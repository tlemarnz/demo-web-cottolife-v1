const { chromium } = require('/opt/node-tools/node_modules/playwright-core');
const EXE='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
let fail=0,pass=0;
const ok=(c,m,x)=>{if(c){pass++;console.log('  ok  '+m)}else{fail++;console.log('  FAIL '+m+(x!==undefined?'  → '+JSON.stringify(x):''))}};
const B='file:///home/claude/site/';
(async()=>{
  const br=await chromium.launch({executablePath:EXE,args:['--no-sandbox']});
  const pg=await br.newPage({viewport:{width:1440,height:1000}});
  const errs=[],broken=[];
  pg.on('pageerror',e=>errs.push('PE '+e.message));
  pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  pg.on('response',r=>{if(!r.ok()&&r.request().resourceType()==='image')broken.push(r.url())});
  const n=async s=>(await pg.$$(s)).length;
  const tx=async s=>((await pg.locator(s).first().textContent())||'').trim();

  console.log('\n— การจัดวาง —');
  await pg.goto(B+'detail.html?s=carrara',{waitUntil:'networkidle'});
  const box=await pg.locator('.thumbs').boundingBox();
  const main=await pg.locator('.galmain .main').boundingBox();
  ok(box.x+box.width<=main.x+2,'รายการภาพอยู่ซ้ายมือของรูปใหญ่',{thumbs:Math.round(box.x),main:Math.round(main.x)});
  ok(await n('.thumbs button')===5,'มีรูปย่อย 5 รูป');
  ok(await n('.opt small')===0,'ตัวเลือก ผิว/ขนาด ไม่มีคำอธิบายใต้ปุ่มแล้ว');
  ok(await n('#allImg')===0,'ตัดปุ่มแกลเลอรีภาพทั้งหมดออกแล้ว');
  ok(await n('.gal-note')===0,'ตัดข้อความแนะนำขอแผ่นตัวอย่างออกแล้ว');
  ok(await n('#tryRoom .ico')===1,'ปุ่มลองปูใช้ไอคอนลายเส้น (SVG) ไม่ใช่อิโมจิ');
  ok(!(await tx('#tryRoom')).includes('🏠'),'ไม่มีอิโมจิในปุ่มแล้ว');
  ok(await pg.locator('#tryRoom').isVisible()&&(await tx('#tryRoom')).includes('ลองปูในห้องคุณ'),
     'ปุ่ม “ลองปูในห้องคุณ” อยู่ใต้รูปใหญ่');


  console.log('\n— ราคาลด —');
  ok(await n('.price-main .was')===1,'ขีดราคาปกติต่อ ตร.ม.');
  ok((await tx('.price-main .off')).includes('ลด'),'แสดง % ส่วนลด');
  ok(await n('.price-sub .was')===1,'ขีดราคาปกติต่อกล่องด้วย');
  ok((await tx('.price-main b'))==='฿690'&&(await tx('.price-main .was'))==='฿810','ราคา ตร.ม. 690 ← 810');
  ok((await tx('.price-sub .was'))==='฿1,166','ราคากล่องก่อนลด 1,166');
  await pg.goto(B+'detail.html?s=hercules',{waitUntil:'networkidle'});
  ok((await tx('.price-main .was'))==='฿24,500'&&(await tx('.price-main .off')).includes('11'),
     'สุขภัณฑ์ก็มีสินค้าลดราคาเป็นตัวอย่าง');

  console.log('\n— จำนวนที่สั่ง —');
  await pg.goto(B+'detail.html?s=carrara',{waitUntil:'networkidle'});
  ok(await n('#useQty')===1,'เครื่องคำนวณมีปุ่ม “ใช้จำนวนนี้”');
  ok(await n('.buyrow .qty')===1,'มีช่องจำนวนติดกับปุ่มเพิ่มลงตะกร้า');
  ok(await pg.locator('#qn').inputValue()==='1','เริ่มที่ 1');
  await pg.locator('#qp').click(); await pg.waitForTimeout(150);
  ok(await pg.locator('#qn').inputValue()==='2','กด + เพิ่มจำนวนได้');
  await pg.locator('#qm').click(); await pg.waitForTimeout(150);
  ok(await pg.locator('#qn').inputValue()==='1','กด − ลดจำนวนได้');
  const eq=await tx('.calc-res .eq');
  ok(eq.includes('14 กล่อง'),'คำนวณจาก กว้าง×ยาว ได้ 14 กล่อง: '+eq.slice(0,38));
  await pg.locator('#useQty').click(); await pg.waitForTimeout(250);
  ok(await pg.locator('#qn').inputValue()==='14','กด “ใช้จำนวนนี้” แล้วจำนวนกลายเป็น 14');
  ok((await tx('.buyrow + .calc-note')).includes('14 กล่อง'),'บอกยอดรวมของจำนวนที่สั่ง');
  await pg.fill('#cw','3'); await pg.fill('#cl','3'); await pg.waitForTimeout(250);
  ok((await tx('.calc-res .eq')).includes('7 กล่อง'),'เปลี่ยนขนาดห้องแล้วคำนวณใหม่',await tx('.calc-res .eq'));
  await pg.goto(B+'detail.html?s=hercules',{waitUntil:'networkidle'});
  ok(await n('.buyrow .qty')===1,'สุขภัณฑ์ก็มีช่องจำนวน');

  console.log('\n— ปุ่มตามดีไซน์ —');
  ok((await tx('#lineBtn'))==='ถามผ่าน LINE','สุขภัณฑ์มีปุ่ม “ถามผ่าน LINE”');
  ok((await tx('#copyLink'))==='คัดลอกลิงก์นี้','สุขภัณฑ์ก็ใช้ปุ่ม “คัดลอกลิงก์นี้” เหมือนกระเบื้อง');
  ok(await n('#install')===0,'ไม่มีปุ่ม “บริการติดตั้ง” ในแถวนั้นแล้ว');
  ok(await n('#sample')===0,'ไม่มีปุ่ม “นัดดูที่โชว์รูม” แล้ว');
  ok(await n('.gal-btns button')===0,'สุขภัณฑ์ตัดปุ่มดูภาพแยกชิ้น + CAD ออกทั้งคู่');
  await pg.goto(B+'detail.html?s=carrara',{waitUntil:'networkidle'});
  ok((await tx('#lineBtn'))==='ถามผ่าน LINE'&&(await tx('#copyLink'))==='คัดลอกลิงก์นี้',
     'กระเบื้องมีปุ่ม “คัดลอกลิงก์นี้” + “ถามผ่าน LINE”');
  ok((await tx('.stock-line a'))==='ดูรายละเอียดการจัดส่ง','เปลี่ยนเป็น “ดูรายละเอียดการจัดส่ง”');
  await pg.locator('#copyLink').click(); await pg.waitForTimeout(250);
  ok((await tx('#toast')).includes('คัดลอกลิงก์'),'กดแล้วคัดลอกลิงก์จริง');

  console.log('\n— เนื้อหา —');
  ok((await tx('.panel h3'))==='คุณสมบัติสินค้า','เปลี่ยน “ไฮไลต์” เป็น “คุณสมบัติสินค้า”');
  const feat=await pg.$$eval('.feat b',e=>e.map(x=>x.textContent));
  ok(feat.length===4&&!feat.some(f=>f.includes('มอก')),'คุณสมบัติสินค้า 4 ช่อง ไม่มี มอก.',feat);
  ok(feat[0]==='กันลื่น R9','ค่า R แสดงถูก',feat[0]);
  ok((await tx('.feat div:first-child span'))==='พื้นภายในทั่วไป','R9 ไม่ถูกจัดเป็นพื้นเปียก');
  ok(await n('.two-col .desc')>=2,'มีบล็อกรายละเอียดสินค้าเป็นย่อหน้า');
  ok((await pg.locator('.two-col h3').nth(1).textContent())==='สเปกและบรรจุภัณฑ์','หัวข้อตารางตรงดีไซน์');
  ok(await n('.tis')>=1&&(await tx('.tis')).includes('มอก.'),'มอก. อยู่ใต้สเปกและบรรจุภัณฑ์');
  ok(await n('#series')===1&&(await tx('#series')).includes('รุ่นอื่นในซีรีส์'),'มีส่วนรุ่นอื่นในซีรีส์');
  ok(await n('.vtab tr')>=3,'ตารางซีรีส์มีรายการ');
  ok((await pg.locator('.vtab .px').first().textContent()).includes('฿'),'ตารางซีรีส์มีราคา');
  ok(await n('.vtab .px s')>=1,'ตารางซีรีส์ขีดราคาปกติด้วย');

  console.log('\n— มอก. ทุกสินค้า —');
  for (const s of ['soft-opera','gloss','woodland','hercules','c2basin','avanti']) {
    await pg.goto(B+'detail.html?s='+s,{waitUntil:'networkidle'});
    const t=await tx('.tis');
    ok(t.includes('มอก.')&&t.length>12, 'มอก. ใน '+s+': '+t.slice(0,30).replace(/\s+/g,' '));
    ok(await n('.tis img.cert')>=1, '  └ มีภาพใบรับรองประกอบ');
  }

  console.log('\n— อะไหล่ —');
  await pg.goto(B+'detail.html?s=hercules',{waitUntil:'networkidle'});
  await pg.locator('[data-t="2"]').click(); await pg.waitForTimeout(250);
  ok((await tx('.tabs button.on, [data-t="2"]')).length>0,'แท็บอะไหล่เปลี่ยนชื่อแล้ว');
  ok((await pg.$$eval('.tabs button',e=>e.map(x=>x.textContent))).includes('อะไหล่ที่ใช้ร่วมกันได้ในรุ่นนี้'),
     'ชื่อแท็บ = “อะไหล่ที่ใช้ร่วมกันได้ในรุ่นนี้”');
  ok(await n('.pitem')===6,'รายการอะไหล่ 6 ชิ้น');
  ok(await n('.pitem img')===6,'อะไหล่ทุกชิ้นมีรูปของตัวเอง');
  const srcs=await pg.$$eval('.pitem img',e=>e.map(x=>x.getAttribute('src')));
  ok(new Set(srcs).size>=5,'รูปอะไหล่ไม่ซ้ำกัน',srcs.length+' รูป / '+new Set(srcs).size+' แบบ');
  ok(await n('.pitem [data-part]')===5,'อะไหล่ที่มีของมีปุ่มใส่ตะกร้า',await n('.pitem [data-part]'));
  ok(await n('.pitem [data-part] svg.ic')===5,'ปุ่มใช้ไอคอนลายเส้น');
  const c0=await tx('.cart-n');
  await pg.locator('.pitem [data-part]').first().click(); await pg.waitForTimeout(250);
  ok((await tx('#toast')).includes('ลงตะกร้า'),'กดแล้วเพิ่มลงตะกร้าได้');
  ok(await tx('.cart-n')!==c0,'ตัวเลขบนไอคอนตะกร้าเพิ่มขึ้น');
  ok(await n('.diagram')===0&&!srcs.some(s=>s.includes('exploded')),'ไม่มีภาพรวมแยกชิ้นในรายการแล้ว');

  console.log('\n— ส่วนที่ต้องลบ —');
  for (const s of ['carrara','hercules']) {
    await pg.goto(B+'detail.html?s='+s,{waitUntil:'networkidle'});
    const body=await pg.locator('.pdp, #panels, #rel').allTextContents().then(a=>a.join(' '));
    ok(!body.includes('รีวิว'),'ไม่มีคำว่า “รีวิว” ที่ไหนเลยในหน้า '+s);
    ok(!body.includes('PDPA'),'ไม่มีบรรทัดยินยอม PDPA ในเนื้อหาสินค้า '+s);
    ok(await n('.revs')===0&&await n('.consent')===0,'ไม่มีบล็อกรีวิว/consent ใน '+s);
    ok(!/★/.test(body),'ไม่มีดาวให้คะแนนด้านบนใน '+s);
  }

  console.log('\n— แท็บและสถานะหมด —');
  await pg.goto(B+'detail.html?s=carrara',{waitUntil:'networkidle'});
  const tabs=await pg.$$eval('.tabs button',e=>e.map(x=>x.textContent));
  ok(tabs.length===4&&!tabs.includes('รีวิว'),'แท็บกระเบื้อง 4 อัน ไม่มีรีวิว',tabs);
  ok(!(await pg.locator('#panels').textContent()).includes('ฉลากเขียว'),'ตัดฉลากเขียวออกจากสเปกแล้ว');
  await pg.locator('[data-t="3"]').click(); await pg.waitForTimeout(250);
  ok(await n('.steps li')===5,'แท็บวิธีปูมี 5 ขั้นตอน');
  await pg.goto(B+'detail.html?sku=C02237',{waitUntil:'networkidle'});
  ok(await n('.oos')===1&&await n('.buyrow')===0,'สินค้าหมด: ไม่มีปุ่มเพิ่มลงตะกร้า');
  ok((await tx('.oos b'))==='สินค้าหมดชั่วคราว','มีกล่องแจ้งสินค้าหมด');
  ok((await tx('#lineBtn'))==='สอบถามผ่าน LINE','และปุ่มสอบถามผ่าน LINE สีเขียว');
  ok(await n('.stock-line')===0,'ไม่มีสถานะสต็อกซ้ำซ้อน');

  console.log('\n— สินค้าที่ใช้ด้วยกัน —');
  for (const [sl,lbl,cnt] of [['carrara','กระเบื้อง',3],['hercules','สุขภัณฑ์',4]]) {
    await pg.goto(B+'detail.html?s='+sl,{waitUntil:'networkidle'});
    ok(await n('#together')===1,'หมวด'+lbl+'มีหัวข้อ “สินค้าที่ใช้ด้วยกัน” เห็นได้โดยไม่ต้องกดแท็บ');
    ok((await tx('#together h2'))==='สินค้าที่ใช้ด้วยกัน','  └ ชื่อหัวข้อตรง');
    ok(await n('#bundle label')===cnt,'  └ มี '+cnt+' รายการ');
    const t0=await tx('#bundle .tot b');
    await pg.locator('#bundle input').first().uncheck(); await pg.waitForTimeout(200);
    ok(await tx('#bundle .tot b')!==t0,'  └ ติ๊กออกแล้วยอดรวมเปลี่ยน');
  }

  console.log('\n— เช็กระยะท่อ —');
  await pg.goto(B+'detail.html?s=avanti',{waitUntil:'networkidle'});
  await pg.locator('[data-r="305 มม."]').click(); await pg.waitForTimeout(250);
  let r=await tx('#rout');
  ok(r.includes('ใช้ไม่ได้'),'เลือกระยะท่อไม่ตรง → เตือน');
  ok(/HERCULES|MODISH|SPACE/.test(r),'และเสนอรุ่นที่ใช้ได้');
  await pg.locator('[data-r="200 มม."]').click(); await pg.waitForTimeout(250);
  ok((await tx('#rout')).includes('ใช้ได้'),'เลือกระยะท่อตรง → บอกว่าใช้ได้');

  console.log('\n— หมวดอุปกรณ์ห้องน้ำ —');
  await pg.goto(B+'detail.html?s=tap-slim',{waitUntil:'networkidle'});
  ok((await tx('.info h1')).includes('SLIM'),'เปิดหน้าอุปกรณ์ได้');
  ok((await tx('.price-main .u'))==='/ ชิ้น','หน่วยเป็นชิ้น');
  ok(await n('.opt')>=2,'เลือกสีผิวเคลือบได้');
  ok(await n('.opt .dot')>=2,'มีจุดสีให้ดู');
  const at=await pg.$$eval('.tabs button',e=>e.map(x=>x.textContent));
  ok(at.join('|')==='ภาพรวม|สเปก|ดาวน์โหลด','แท็บของหมวดอุปกรณ์',at);
  ok((await tx('.tis')).includes('มอก.'),'มี มอก. ด้วย');
  ok(await n('#together')===1,'มีสินค้าที่ใช้ด้วยกัน');

  console.log('\n— ไอคอนลายเส้นทั้งเว็บ —');
  for (const u of ['index.html','list.html?cat=tile','detail.html?s=carrara']) {
    await pg.goto(B+u,{waitUntil:'networkidle'});
    const emo=await pg.evaluate(()=>(document.body.innerText
      .match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu)||[]).join(''));
    ok(emo==='','ไม่มีอิโมจิใน '+u+(emo?' → '+emo:''));
    ok(await n('svg.ic')>0,'  └ ใช้ไอคอน SVG ลายเส้น ('+await n('svg.ic')+' ชิ้น)');
    const bad=await pg.$$eval('svg.ic',e=>e.filter(x=>x.getAttribute('fill')!=='none').length);
    ok(bad===0,'  └ ไม่มีไอคอนทึบ');
  }

  console.log('\n— มือถือ —');
  const mb=await br.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const me=[]; mb.on('pageerror',e=>me.push(e.message));
  await mb.goto(B+'detail.html?s=carrara',{waitUntil:'networkidle'});
  const ov=await mb.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  ok(ov<=1,'ไม่ล้นขอบบนมือถือ (overflow='+ov+')');
  await mb.evaluate(()=>window.scrollTo(0,900)); await mb.waitForTimeout(300);
  ok(await mb.locator('.sbar.on').count()===1,'แถบล่างโผล่เมื่อเลื่อน');
  ok(me.length===0,'ไม่มี error บนมือถือ',me);

  ok(errs.length===0,'ไม่มี console error',errs.slice(0,4));
  ok(broken.length===0,'ไม่มีรูปเสีย',broken.slice(0,3));
  await br.close();
  console.log('\n'+(fail?'FAILED '+fail+' / ผ่าน '+pass:'ผ่านทั้งหมด '+pass+' ข้อ'));
  process.exit(fail?1:0);
})();
