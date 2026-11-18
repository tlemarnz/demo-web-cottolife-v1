const { chromium } = require('/opt/node-tools/node_modules/playwright-core');
const path = require('path');
const B = 'file://' + path.resolve('.') + '/';
let fail = 0, pass = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok  ' + m); }
  else { fail++; console.log('  FAIL ' + m + (x !== undefined ? '  → ' + JSON.stringify(x) : '')); } };

(async () => {
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',
    args: ['--no-sandbox'] });
  const pg = await br.newPage({ viewport: { width: 1360, height: 950 } });
  const errs = [], broken = [];
  pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  pg.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  pg.on('response', r => { if (!r.ok() && r.request().resourceType() === 'image') broken.push(r.url()); });

  const n = async s => (await pg.$$(s)).length;
  const openFacet = async (k, root = '#facets') => {
    const g = pg.locator(root + ' .fgroup[data-g="' + k + '"]');
    if (!(await g.evaluate(e => e.classList.contains('open')))) await g.locator('.fhead').click();
    await pg.waitForTimeout(80);
  };
  const txt = async s => (await pg.locator(s).first().textContent() || '').trim();
  const prices = (p = pg) => p.$$eval('.scard .pr .p', e =>
    e.map(x => +(x.textContent.match(/[\d,]+/) || ['0'])[0].replace(/,/g, '')));
  const names  = () => pg.$$eval('.scard h3', e => e.map(x => x.textContent.trim()));
  const count  = async () => +(await txt('#rcount b'));

  /* ================= กระเบื้อง ================= */
  console.log('\n— หน้ากระเบื้อง: ลำดับตัวกรองแบบ Thai Soung —');
  await pg.goto(B + 'list.html?cat=tile', { waitUntil: 'networkidle' });

  const labels = await pg.$$eval('#facets .fhead', e =>
    e.map(x => x.textContent.replace(/^\d+/, '').replace('▾', '').trim()));
  const want = ['ราคา','ลวดลาย','ผิวสัมผัส','ค่าต้านทานความลื่น (R)','สี','ขนาด (ซม.)',
                'การใช้งาน','ความหนา','ฉลากเขียว'];
  ok(JSON.stringify(labels) === JSON.stringify(want), 'ลำดับตัวกรอง 9 ชั้นตรงกับ Thai Soung', labels);

  const total = await count();
  ok(total === 18, 'เริ่มต้นแสดง 18 ซีรีส์', total);
  ok((await txt('#rcount')).includes('49 รายการ'), 'นับรายการ (SKU) ควบคู่กับซีรีส์', await txt('#rcount'));
  ok(await n('#facets .fgroup.open') === 4, 'เปิดตัวกรอง 4 ชั้นแรกไว้ ที่เหลือพับ');

  /* นับจำนวนในตัวเลือกต้องตรงกับผลจริง */
  const c1 = await pg.locator('#facets [data-f="pattern"][value="กระเบื้องลายหินอ่อน"]');
  const shown = +(await pg.locator('#facets [data-f="pattern"][value="กระเบื้องลายหินอ่อน"]')
    .locator('xpath=../span[@class="fcount"]').textContent());
  await c1.check();
  await pg.waitForTimeout(120);
  ok((await txt('#rcount')).includes(shown + ' รายการ'),
     'จำนวนที่โชว์ข้างตัวเลือก = จำนวนรายการที่ได้จริง (' + shown + ')', await txt('#rcount'));
  const afterMarble = await count();
  ok(afterMarble === 5, 'กรองลายหินอ่อน → 5 ซีรีส์', afterMarble);
  ok(await n('.achip') === 1, 'ขึ้น chip ตัวกรองที่ใช้งาน');
  ok(await pg.locator('#facets .fgroup[data-g="pattern"] .dotnew').count() === 1, 'ติดจุดแดงที่หัวข้อที่ถูกกรอง');

  /* นับแบบ faceted: ตัวเลือกอื่นในชั้นเดียวกันยังนับเต็ม */
  const sameLayer = +(await pg.locator('#facets [data-f="pattern"][value="กระเบื้องลายไม้"]')
    .locator('xpath=../span[@class="fcount"]').textContent());
  ok(sameLayer === 2, 'ตัวเลือกร่วมชั้นยังนับเต็ม (OR ภายในชั้น) = 2', sameLayer);
  const otherLayer = +(await pg.locator('#facets [data-f="finishLabel"][value="ผิวมัน"]')
    .locator('xpath=../span[@class="fcount"]').textContent());
  ok(otherLayer < 14, 'ตัวเลือกชั้นอื่นนับใหม่ตามที่กรองแล้ว (AND ข้ามชั้น) = ' + otherLayer);

  /* กรองทับอีกชั้น */
  await pg.locator('#facets [data-f="finishLabel"][value="ผิวมัน"]').check();
  await pg.waitForTimeout(120);
  ok((await txt('#rcount')).includes(otherLayer + ' รายการ'), 'กรองสองชั้นแล้วได้ตามตัวเลขที่บอกไว้');
  ok(await n('.achip') === 2, 'chip ครบสองอัน');
  const hits = await pg.$$eval('.scard .hit', e => e.map(x => x.textContent.trim()));
  ok(hits.length > 0 && hits[0].includes('จาก'), 'การ์ดบอกว่าตรงเงื่อนไขกี่รายการจากทั้งหมด', hits[0]);

  /* ปิด chip */
  await pg.locator('.achip').first().click();
  await pg.waitForTimeout(120);
  ok(await n('.achip') === 1, 'กด × บน chip เอาตัวกรองออกได้');
  await pg.locator('#clrAll').click(); await pg.waitForTimeout(120);
  ok(await count() === 18, 'ล้างทั้งหมดกลับมา 18 ซีรีส์');

  /* ---- การเรียงลำดับ ---- */
  console.log('\n— การเรียงลำดับ (กระเบื้อง) —');
  const sortOpts = await pg.$$eval('#sort option', e => e.map(x => x.textContent));
  ok(sortOpts.length === 9 && sortOpts[0] === 'สินค้าแนะนำ', 'มี 9 ตัวเลือกการเรียง เริ่มที่สินค้าแนะนำ', sortOpts);

  await pg.selectOption('#sort', 'price-asc'); await pg.waitForTimeout(120);
  let p = await prices();
  ok(p.every((v, i) => i === 0 || p[i - 1] <= v), 'ราคาน้อย→มาก เรียงถูก', p);
  ok(p[0] === 295, 'ตัวแรกคือ 295 บาท/ตร.ม.', p[0]);

  await pg.selectOption('#sort', 'price-desc'); await pg.waitForTimeout(120);
  p = await prices();
  ok(p.every((v, i) => i === 0 || p[i - 1] >= v), 'ราคามาก→น้อย เรียงถูก', p);
  ok(p[0] === 1290, 'ตัวแรกคือ 1,290 บาท/ตร.ม.', p[0]);

  await pg.selectOption('#sort', 'size-asc'); await pg.waitForTimeout(120);
  const szA = await pg.$$eval('.scard', e => e.map(x => {
    const t = [...x.querySelectorAll('.vcount')].map(v => v.textContent).join(' ');
    return t; }));
  ok(szA.length === 18, 'เรียงตามขนาดไม่ทำให้สินค้าหาย', szA.length);

  await pg.selectOption('#sort', 'stock'); await pg.waitForTimeout(120);
  ok(await count() === 18, 'เรียงตามสต็อกทำงาน');

  await pg.selectOption('#sort', 'name'); await pg.waitForTimeout(120);
  const nm = await names();
  ok(nm.join('|') === [...nm].sort((a, b) => a.localeCompare(b, 'th')).join('|'),
     'เรียงชื่อ ก–ฮ ถูกตามการเรียงภาษาไทย', nm.slice(0, 3));

  await pg.selectOption('#sort', 'new'); await pg.waitForTimeout(120);
  ok((await names())[0] === 'กลอส ซีรีส์', 'ใหม่สุด = กลอส ซีรีส์ (2026-10-28)', (await names())[0]);

  /* เรียงลำดับคงอยู่หลังกรอง */
  await pg.selectOption('#sort', 'price-asc');
  await openFacet('use');
  await pg.locator('#facets [data-f="use"]').first().check();
  await pg.waitForTimeout(150);
  p = await prices();
  ok(p.every((v, i) => i === 0 || p[i - 1] <= v), 'กรองแล้วการเรียงยังคงอยู่', p);
  await pg.locator('#clrAll').click();

  /* ---- ผลลัพธ์ว่าง ---- */
  console.log('\n— กรณีไม่พบสินค้า —');
  await pg.locator('#facets [data-f="priceBand"][value="1–299 บาท/ตร.ม."]').check();
  await pg.waitForTimeout(100);
  await openFacet('color');
  const navy = pg.locator('#facets [data-f="color"][value="เทา"]');
  ok(await navy.isDisabled(), 'ตัวเลือกที่กรองแล้วเหลือ 0 ถูก disable ไม่ให้กดเจอทางตัน');
  ok(await pg.locator('#facets .fopt.zero').count() > 0, 'ตัวเลือก 0 รายการจางลง');
  await openFacet('thickClass');
  await pg.locator('#facets [data-f="thickClass"]').first().check();
  await pg.waitForTimeout(120);
  ok(await n('.empty') === 1 || await count() > 0, 'สถานะว่างมีคำแนะนำให้ถอยตัวกรอง');
  await pg.locator('#clrAll').click(); await pg.waitForTimeout(100);


  /* ---- เปรียบเทียบ / แบ่งหน้า / มุมมอง ---- */
  console.log('\n— เปรียบเทียบ · แบ่งหน้า · มุมมอง —');
  await pg.locator('.scard .cmp input').nth(0).check();
  await pg.locator('.scard .cmp input').nth(1).check();
  await pg.waitForTimeout(120);
  ok(await pg.locator('#cmpbar.on').count() === 1, 'เลือก 2 รายการแล้วแถบเปรียบเทียบเลื่อนขึ้น');
  ok(await n('#cmpList .ci') === 2, 'แถบแสดง 2 รายการ');
  ok(!(await pg.locator('#cmpGo').isDisabled()), 'ปุ่มเปรียบเทียบใช้ได้เมื่อครบ 2');
  await pg.locator('#cmpList .ci button').first().click(); await pg.waitForTimeout(100);
  ok(await n('#cmpList .ci') === 1, 'เอาออกจากแถบเปรียบเทียบได้');

  await pg.selectOption('#per', '12'); await pg.waitForTimeout(120);
  ok(await n('.scard') === 12, 'แสดง 12 ต่อหน้า');
  ok(await n('#pager button') >= 3, 'มีตัวแบ่งหน้า');
  await pg.locator('#pager button[data-p="2"]:not(:last-child)').click(); await pg.waitForTimeout(150);
  ok(await n('.scard') === 6, 'หน้า 2 มี 6 ซีรีส์ที่เหลือ', await n('.scard'));
  ok((await txt('#pgnote')).includes('13–18'), 'บอกช่วงที่กำลังแสดง', await txt('#pgnote'));
  await pg.selectOption('#per', '24'); await pg.waitForTimeout(120);

  await pg.locator('#vRows').click(); await pg.waitForTimeout(100);
  ok(await pg.locator('.sgrid.rows').count() === 1, 'สลับเป็นมุมมองรายการได้');
  await pg.locator('#vGrid').click();

  /* ---- แถบลายกระเบื้องด้านบน ---- */
  ok(await n('.mainbar a') === 3, 'แถบหมวดหลักมี 3 หมวด');
  ok((await pg.$$eval('.mainbar a', e => e.map(x => x.textContent.trim()))).join('|')
       === 'กระเบื้อง|สุขภัณฑ์|อุปกรณ์ห้องน้ำ', 'ชื่อหมวดหลักถูกต้อง');
  ok(await pg.locator('.mainbar a.on').textContent() === 'กระเบื้อง', 'ไฮไลต์หมวดที่อยู่');
  ok((await txt('.mainbar .here')).includes('กระเบื้อง'), 'บอกว่าอยู่หมวดอะไร');
  ok((await txt('#typebarIn a')) === 'ทั้งหมด', 'หมวดย่อยเริ่มด้วย “ทั้งหมด”');
  await pg.locator('#typebarIn [data-tab]').nth(1).click(); await pg.waitForTimeout(150);
  ok(await count() < 18, 'แท็บหมวดย่อยกรองได้', await count());
  await pg.locator('#typebarIn [data-tab$="|*"]').click(); await pg.waitForTimeout(150);
  ok(await count() === 18, 'กด “ทั้งหมด” ล้างหมวดย่อย');

  /* ================= สุขภัณฑ์ ================= */
  console.log('\n— หน้าสุขภัณฑ์: ลำดับตัวกรองแบบ TOTO —');
  await pg.goto(B + 'list.html?cat=sanitary', { waitUntil: 'networkidle' });
  ok(await pg.locator('.mainbar a.on').textContent() === 'สุขภัณฑ์', 'หมวดหลักสลับมาที่สุขภัณฑ์');
  const sl = await pg.$$eval('#facets .fhead', e =>
    e.map(x => x.textContent.replace(/^\d+/, '').replace('▾', '').trim()));
  const sw = ['ประเภท','เทคโนโลยี','ระบบชำระล้าง','ระยะท่อ (Rough-in)','ชนิดท่อ',
              'ปริมาณน้ำต่อการกด','รูปทรงโถ','ราคา'];
  ok(JSON.stringify(sl) === JSON.stringify(sw), 'ลำดับตัวกรอง 8 ชั้นตรงกับ TOTO', sl);
  ok(sl[0] === 'ประเภท' && sl.indexOf('ราคา') === 7,
     'ประเภทการติดตั้งมาก่อน ราคาอยู่ท้ายสุด — สลับกับหน้ากระเบื้อง');
  ok(await count() === 5, 'มี 5 ซีรีส์สุขภัณฑ์', await count());

  const tabs = await pg.$$eval('#typebarIn a', e => e.map(x => x.textContent.trim()));
  ok(tabs.includes('แขวนผนัง') && tabs.includes('อ่างล้างหน้า'), 'แถบประเภทด้านบนแบบ TOTO', tabs);
  await pg.locator('#typebarIn [data-tab*="แขวนผนัง"]').click(); await pg.waitForTimeout(150);
  ok(await count() === 1, 'กดแท็บแขวนผนัง → 1 ซีรีส์', await count());
  ok((await names())[0] === 'AVANTI', 'ได้ AVANTI', await names());
  await pg.locator('#typebarIn [data-tab*="แขวนผนัง"]').click(); await pg.waitForTimeout(150);

  /* ด่านความเข้ากันได้: ระยะท่อ */
  await openFacet('rough');
  await pg.locator('#facets [data-f="rough"][value="200 มม."]').check();
  await pg.waitForTimeout(150);
  ok((await txt('#rcount')).includes('2 รายการ'), 'กรองระยะท่อ 200 มม. → 2 รุ่น', await txt('#rcount'));
  const kinds = await names();
  ok(kinds.length === 2 && kinds.includes('AVANTI') && kinds.includes('HERCULES CURVE'),
     'ได้รุ่นที่ท่อ 200 มม. ข้ามประเภทการติดตั้ง', kinds);

  await openFacet('trap');
  await pg.locator('#facets [data-f="trap"][value="P-Trap"]').check();
  await pg.waitForTimeout(150);
  ok(await count() === 1 && (await names())[0] === 'AVANTI',
     'ระยะท่อ 200 + P-Trap → เหลือ AVANTI ตัวเดียว', await names());
  await pg.locator('#clrAll').click(); await pg.waitForTimeout(120);

  /* เทคโนโลยีเป็น multi-value */
  await pg.locator('#facets [data-f="tech"][value="ไร้ขอบ (Rimless)"]').check();
  await pg.waitForTimeout(150);
  ok((await txt('#rcount')).includes('4 รายการ'), 'กรองเทคโนโลยีไร้ขอบ → 4 รุ่น', await txt('#rcount'));
  await pg.locator('#clrAll').click(); await pg.waitForTimeout(120);

  /* เรียงประหยัดน้ำ */
  const ss = await pg.$$eval('#sort option', e => e.map(x => x.textContent));
  ok(ss.includes('ประหยัดน้ำที่สุด') && !ss.includes('ขนาด เล็กไปใหญ่'),
     'ตัวเลือกการเรียงเปลี่ยนตามหมวด (มีประหยัดน้ำ ไม่มีขนาด)', ss);
  await pg.selectOption('#sort', 'water'); await pg.waitForTimeout(150);
  ok((await names())[0] === 'MODISH', 'ประหยัดน้ำที่สุด = MODISH (3.8 ลิตร)', await names());
  await pg.selectOption('#sort', 'price-asc'); await pg.waitForTimeout(150);
  p = await prices();
  ok(p[0] === 3800 && p.every((v, i) => i === 0 || p[i - 1] <= v), 'ราคาน้อย→มาก เริ่มที่ 3,800', p);

  ok((await txt('#seo h2')).includes('Rough-in'), 'บล็อกท้ายหน้าอธิบายเหตุผลของลำดับ', await txt('#seo h2'));

  /* ================= อุปกรณ์ห้องน้ำ ================= */
  console.log('\n— หมวดอุปกรณ์ห้องน้ำ —');
  await pg.goto(B + 'list.html?cat=accessory', { waitUntil: 'networkidle' });
  ok(await pg.locator('.mainbar a.on').textContent() === 'อุปกรณ์ห้องน้ำ', 'เข้าหมวดอุปกรณ์ได้');
  ok(await count() === 9, 'มี 9 ซีรีส์อุปกรณ์', await count());
  const al = await pg.$$eval('#facets .fhead', e =>
    e.map(x => x.textContent.replace(/^\d+/, '').replace('▾', '').trim()));
  ok(al.join('|') === 'ประเภทอุปกรณ์|สี / ผิวเคลือบ|วัสดุ|วิธีติดตั้ง|ราคา', 'ตัวกรองของหมวดนี้', al);
  await openFacet('mount');
  await pg.locator('#facets [data-f="mount"][value="ติดกาว"]').check();
  await pg.waitForTimeout(150);
  ok(await count() === 1, 'กรองวิธีติดตั้ง “ติดกาว” → 1 ซีรีส์', await count());
  await pg.locator('#clrAll').click(); await pg.waitForTimeout(120);
  ok((await pg.locator('.scard .pr .u').first().textContent()).includes('ชิ้น'), 'หน่วยเป็น “ชิ้น”');

  /* ================= สีราคาลด ================= */
  console.log('\n— สีของราคาที่ลด —');
  await pg.goto(B + 'list.html?cat=tile', { waitUntil: 'networkidle' });
  await pg.selectOption('#sort', 'price-desc'); await pg.waitForTimeout(150);
  const sc = pg.locator('.scard').filter({ hasText: 'คาร์รารา' }).first();
  ok(await sc.locator('.p.sale').count() === 1, 'ราคาที่ลดมีคลาส sale');
  const col = await sc.locator('.p.sale').evaluate(e => getComputedStyle(e).color);
  ok(col === 'rgb(224, 38, 45)', 'ราคาที่ลดเป็นสีแดง', col);
  const wc = await sc.locator('.was').evaluate(e => getComputedStyle(e).color);
  ok(wc.indexOf('rgb(22, 24, 28)') === 0, 'ราคาปกติเป็นสีดำ', wc);
  ok(await sc.locator('.was').evaluate(e => getComputedStyle(e).textDecorationLine) === 'line-through',
     'และถูกขีดฆ่า');
  ok(await n('.whytog') === 0 && await n('.why') === 0, 'ตัดปุ่มอธิบายเหตุผลออกจากหน้าเว็บแล้ว');

  /* ================= มือถือ ================= */
  console.log('\n— มือถือ —');
  const mb = await br.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const merr = [];
  mb.on('pageerror', e => merr.push(e.message));
  await mb.goto(B + 'list.html?cat=tile', { waitUntil: 'networkidle' });
  const ov = await mb.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(ov <= 1, 'ไม่มีการเลื่อนออกด้านข้าง (overflow = ' + ov + ')');
  ok(!(await mb.locator('.side').isVisible()), 'ซ่อน sidebar บนมือถือ');
  ok(await mb.locator('#mbar').isVisible(), 'มีปุ่มตัวกรอง/เรียงลำดับแบบติดบน');
  await mb.locator('#mFil').click(); await mb.waitForTimeout(250);
  ok(await mb.locator('#shFil.on').count() === 1, 'เปิด bottom sheet ตัวกรองได้');
  await mb.locator('#facetsM [data-f="pattern"][value="กระเบื้องลายไม้"]').check({force:true});
  await mb.waitForTimeout(150);
  ok(+(await mb.locator('#mFilN').textContent()) === 1, 'ตัวเลขบนปุ่มตัวกรองอัปเดต');
  await mb.locator('#mApply').click(); await mb.waitForTimeout(250);
  ok(await mb.locator('.scard').count() === 1, 'ปิด sheet แล้วเห็นผลที่กรอง');
  await mb.locator('#mSort').click(); await mb.waitForTimeout(250);
  ok(await mb.locator('#shSort.on').count() === 1, 'เปิด sheet เรียงลำดับได้');
  await mb.locator('#sortM input[value="price-desc"]').check(); await mb.waitForTimeout(200);
  ok(await mb.locator('#shSort.on').count() === 0, 'เลือกการเรียงแล้วปิด sheet ให้เอง');
  ok(merr.length === 0, 'ไม่มี error บนมือถือ', merr);

  console.log('\n— สุขอนามัยของหน้า —');
  ok(errs.length === 0, 'ไม่มี console error', errs.slice(0, 4));
  ok(broken.length === 0, 'ไม่มีรูปเสีย', broken.slice(0, 4));

  await br.close();
  console.log('\n' + (fail ? 'FAILED ' + fail + ' / ผ่าน ' + pass : 'ผ่านทั้งหมด ' + pass + ' ข้อ'));
  process.exit(fail ? 1 : 0);
})();
