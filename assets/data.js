/* COTTO LiFE prototype — catalogue + facet model
   กระเบื้อง: โครงตัวกรองแบบ Thai Soung · สุขภัณฑ์: โครงตัวกรองแบบ TOTO
   ข้อมูลทั้งหมดเป็นตัวอย่างสำหรับ user test ไม่ใช่ข้อมูลสินค้าจริง */
window.CATALOG = (function () {

  var PACK = {
    "60x120":{sqm:1.44,pcs:2}, "60x60":{sqm:1.44,pcs:4}, "30x60":{sqm:1.44,pcs:8},
    "30x30":{sqm:1.44,pcs:16}, "25x40":{sqm:1.40,pcs:14}, "20x120":{sqm:1.44,pcs:6},
    "120x120":{sqm:1.44,pcs:1}
  };
  /* ผิวสัมผัส — ชุดเดียวกับที่ร้านกระเบื้องไทยใช้ */
  var FINISH = {
    pol:     {label:"ผิวมัน",               en:"Polished",     desc:"สะท้อนแสง ทำให้ห้องดูสว่าง"},
    matt:    {label:"ผิวด้าน",              en:"Matt",         desc:"ไม่สะท้อนแสง เห็นรอยน้ำน้อย"},
    honed:   {label:"ผิวฮอน",               en:"Honed",        desc:"ด้านเนียน สัมผัสเรียบ"},
    lappato: {label:"ผิวกึ่งมันกึ่งด้าน",   en:"Lappato",      desc:"เงาบางส่วน ลดการลื่น"},
    antislip:{label:"ผิวกันลื่น",           en:"Antislip",     desc:"ผิวหยาบ สำหรับพื้นเปียก"},
    natural: {label:"ผิว Natural Matt",     en:"Natural Matt", desc:"ด้านธรรมชาติ ใกล้เคียงหินจริง"}
  };
  /* กลุ่มขนาด — จัดตามการใช้งาน ไม่เรียงตัวเลข */
  var SIZE_GROUPS = [
    {g:"ขนาดมาตรฐาน", sizes:["30x30","30x60","60x60"]},
    {g:"ขนาดใหญ่",     sizes:["60x120","120x120"]},
    {g:"ลายไม้",       sizes:["20x120"]},
    {g:"กระเบื้องผนัง", sizes:["25x40"]}
  ];

  var S = [
    {id:"soft-opera", brand:"COTTO", name:"ซอฟท์ โอเปร่า", sub:"กระเบื้องพอร์ซเลน ลายหินอ่อนโทนขาวเทา",
     pattern:"กระเบื้องลายหินอ่อน", tex:"soft-opera-matt", finishes:["matt","pol"], sizes:["60x120","60x60"],
     colors:["ขาว"], use:"ปูพื้น/ผนังภายใน", slip:"R10", env:"ภายใน", usage:["พื้น","ผนัง"],
     absorb:0.4, thick:12, patt:4, shade:"V2", green:true, price:{"60x120":769,"60x60":690}, finishAdd:{pol:60},
     added:"2026-09-12", sold:420, rating:4.8, reviews:23, stock:"ready", "new":true, tex2:{pol:"soft-opera-pol"}},
    {id:"calacatta", brand:"COTTO", name:"คาลาคัตต้า โกลด์", sub:"ลายหินอ่อนเส้นทองบนพื้นขาว",
     pattern:"กระเบื้องลายหินอ่อน", tex:"calacatta-gold", finishes:["pol","lappato"], sizes:["60x120","120x120"],
     colors:["ขาว"], use:"ปูพื้น/ผนังภายใน", slip:"R9", env:"ภายใน", usage:["พื้น","ผนัง"],
     absorb:0.3, thick:12, patt:6, shade:"V3", price:{"60x120":1290,"120x120":1690}, finishAdd:{lappato:80},
     added:"2026-10-20", sold:260, rating:4.9, reviews:19, stock:"ready", "new":true},
    {id:"carrara", brand:"COTTO", name:"คาร์รารา สตาชัวริโอ", sub:"ลายหินอ่อนขาวเส้นเทา",
     pattern:"กระเบื้องลายหินอ่อน", tex:"carrara-statuario", finishes:["matt","pol","honed"], sizes:["60x60","30x60"],
     colors:["ขาว"], use:"ปูพื้น/ผนังภายใน", slip:"R9", env:"ภายใน", usage:["พื้น","ผนัง"],
     absorb:0.3, thick:10, patt:4, shade:"V2", green:true, price:{"60x60":690,"30x60":620}, finishAdd:{pol:55,honed:35},
     added:"2026-07-02", sold:980, rating:4.9, reviews:41, stock:"ready", sale:true},
    {id:"pietra", brand:"SOSUCO", name:"เปียตร้า เกรย์", sub:"ลายหินเทาเข้ม ผิวด้าน",
     pattern:"กระเบื้องลายหินอ่อน", tex:"pietra-grey", finishes:["matt"], sizes:["60x120","60x60"],
     colors:["เทา"], use:"ปูพื้นภายใน · ภายนอก", slip:"R10", env:"ภายใน · ภายนอก", usage:["พื้น","ผนัง"],
     absorb:0.4, thick:12, patt:4, shade:"V2", price:{"60x120":749,"60x60":665},
     added:"2026-06-15", sold:540, rating:4.6, reviews:17, stock:"ready"},
    {id:"aqua", brand:"CAMPANA", name:"อควา สกาย", sub:"ลายหินอ่อนโทนฟ้าอ่อน ผิวมัน",
     pattern:"กระเบื้องลายหินอ่อน", tex:"aqua-sky", finishes:["pol"], sizes:["60x120"],
     colors:["ขาว"], use:"บุผนังภายใน", slip:"-", env:"ภายใน", usage:["ผนัง"],
     absorb:0.5, thick:9, patt:4, shade:"V2", price:{"60x120":459},
     added:"2026-05-08", sold:1240, rating:4.4, reviews:31, stock:"ready", best:true},

    {id:"cemento", brand:"COTTO", name:"ซีเมนโต้", sub:"ลายซีเมนต์เปลือย โทนเทาและชาร์โคล",
     pattern:"กระเบื้องลายซีเมนต์", tex:"cement-grey", finishes:["matt","antislip"], sizes:["60x120","60x60"],
     colors:["เทา","ดำ"], use:"ปูพื้นภายใน · ภายนอก", slip:"R11", env:"ภายใน · ภายนอก", usage:["พื้น","ผนัง"],
     absorb:0.4, thick:12, patt:4, shade:"V2", green:true, price:{"60x120":815,"60x60":740}, finishAdd:{antislip:45},
     added:"2026-07-30", sold:690, rating:4.6, reviews:16, stock:"ready", tex2:{"ดำ":"cement-charcoal"}},
    {id:"travertine", brand:"SOSUCO", name:"ทราเวอร์ทีน เบจ", sub:"ลายหินลาวาโทนอุ่น",
     pattern:"กระเบื้องลายหินลาวา", tex:"travertine-beige", finishes:["natural"], sizes:["60x60","30x60"],
     colors:["ครีม"], use:"ปูพื้น/ผนังภายใน", slip:"R10", env:"ภายใน · ภายนอก", usage:["พื้น","ผนัง"],
     absorb:0.4, thick:10, patt:4, shade:"V3", price:{"60x60":665,"30x60":590},
     added:"2026-05-27", sold:1050, rating:4.4, reviews:26, stock:"ready", best:true},
    {id:"outdoor", brand:"SOSUCO", name:"เอาต์ดอร์ สโตน", sub:"กระเบื้องปูพื้นภายนอก หนาพิเศษ 20 มม.",
     pattern:"กระเบื้องปูพื้นภายนอก", tex:"outdoor-stone", finishes:["antislip"], sizes:["60x60","30x30"],
     colors:["น้ำตาล"], use:"ภายนอก / ลานจอดรถ", slip:"R11", env:"ภายนอก", usage:["พื้น"],
     absorb:0.3, thick:20, patt:4, shade:"V3", price:{"60x60":580,"30x30":490},
     added:"2026-03-11", sold:870, rating:4.5, reviews:24, stock:"made"},

    {id:"woodland", brand:"COTTO", name:"วู้ดแลนด์ โอ๊ค", sub:"กระเบื้องลายไม้โอ๊ค แผ่นยาว",
     pattern:"กระเบื้องลายไม้", tex:"oak-natural", finishes:["natural"], sizes:["20x120"],
     colors:["น้ำตาล","ครีม"], use:"ปูพื้น/ผนังภายใน", slip:"R10", env:"ภายใน", usage:["พื้น","ผนัง"],
     absorb:0.4, thick:9, patt:8, shade:"V3", green:true, price:{"20x120":720},
     added:"2026-06-03", sold:1340, rating:4.8, reviews:35, stock:"ready", best:true, tex2:{"น้ำตาล":"oak-smoked"}},

    {id:"arkigem", brand:"COTTO", name:"อาร์คิเจม ทัลโค", sub:"ลายหินขัดเม็ดละเอียด โทนขาวครีม",
     pattern:"กระเบื้องลายหินขัด", tex:"arkigem-talco", finishes:["matt","lappato"], sizes:["60x120","60x60"],
     colors:["ครีม"], use:"ปูพื้น/ผนังภายใน", slip:"R10", env:"ภายใน · ภายนอก", usage:["พื้น","ผนัง"],
     absorb:0.4, thick:12, patt:6, shade:"V3", price:{"60x120":890,"60x60":799}, finishAdd:{lappato:70},
     added:"2026-10-01", sold:330, rating:4.7, reviews:14, stock:"ready", "new":true},
    {id:"terrazzo", brand:"SOSUCO", name:"เทอราซโซ แซนด์", sub:"ลายหินขัดเม็ดใหญ่ โทนทราย",
     pattern:"กระเบื้องลายหินขัด", tex:"terrazzo-sand", finishes:["matt"], sizes:["60x60"],
     colors:["ครีม"], use:"ปูพื้นภายใน", slip:"R10", env:"ภายใน · ภายนอก", usage:["พื้น"],
     absorb:0.4, thick:10, patt:6, shade:"V3", price:{"60x60":620},
     added:"2026-08-19", sold:760, rating:4.5, reviews:19, stock:"ready"},

    {id:"gloss", brand:"CAMPANA", name:"กลอส ซีรีส์", sub:"กระเบื้องบุผนังสีพื้น ผิวมัน 4 สี",
     pattern:"กระเบื้องสีพื้น", tex:"gloss-white", finishes:["pol"], sizes:["25x40"],
     colors:["ขาว","ครีม","เขียวอ่อน","น้ำเงิน"], use:"บุผนังภายใน", slip:"-", env:"ภายใน", usage:["ผนัง"],
     absorb:6, thick:8, patt:1, shade:"V1", price:{"25x40":295}, colorAdd:{"เขียวอ่อน":45,"น้ำเงิน":45},
     added:"2026-10-28", sold:2300, rating:4.3, reviews:52, stock:"ready", best:true,
     tex2:{"ครีม":"gloss-ivory","เขียวอ่อน":"gloss-sage","น้ำเงิน":"gloss-navy"}, outOfStock:["น้ำเงิน"]},
    {id:"granito", brand:"COTTO", name:"แกรนิตโต้", sub:"ผิวเม็ดทราย ดูแลง่าย ใช้ได้ทั้งในและนอก",
     pattern:"กระเบื้องสีพื้น", tex:"granito-white", finishes:["matt"], sizes:["60x60","30x30"],
     colors:["ขาว","ครีม"], use:"ปูพื้นภายใน · ภายนอก", slip:"R10", env:"ภายใน · ภายนอก", usage:["พื้น"],
     absorb:0.5, thick:10, patt:2, shade:"V1", green:true, price:{"60x60":545,"30x30":470},
     added:"2026-04-22", sold:1510, rating:4.3, reviews:27, stock:"ready", best:true, tex2:{"ครีม":"granito-sand"}},

    {id:"chicago", brand:"COTTO", name:"GP ชิคาโก้ ขาว 09676 (POL) PM", sub:"แกรนิตโต้ผิวเงา โทนขาวสว่าง",
     pattern:"กระเบื้องสีพื้น", tex:"granito-white", finishes:["pol"], sizes:["60x60"], colors:["ขาว"],
     use:"ปูพื้นภายใน", slip:"R9", env:"ภายใน", usage:["พื้น"], tags:["INDOOR","POLISHED"],
     absorb:0.5, thick:10, patt:2, shade:"V1", price:{"60x60":678},
     added:"2026-04-02", sold:3100, rating:4.7, reviews:64, stock:"ready", best:true},
    {id:"petchnin", brand:"COTTO", name:"FA-N เพชรนิล-ขาว (A)", sub:"กระเบื้องปูพื้นผิวด้าน ขนาดเล็ก",
     pattern:"กระเบื้องสีพื้น", tex:"granito-sand", finishes:["matt"], sizes:["30x30"], colors:["ขาว"],
     use:"ปูพื้นภายใน", slip:"R10", env:"ภายใน", usage:["พื้น"], tags:["INDOOR"],
     absorb:3, thick:8, patt:2, shade:"V1", price:{"30x30":471},
     added:"2026-02-20", sold:2900, rating:4.2, reviews:47, stock:"ready", best:true},
    {id:"myra", brand:"COTTO", name:"FT ไมร่า (II) เทา (HYG) PK8", sub:"ผิวเคลือบ HYG ยับยั้งแบคทีเรีย",
     pattern:"กระเบื้องลายซีเมนต์", tex:"cement-grey", finishes:["matt"], sizes:["30x60"], colors:["เทา"],
     use:"ปูพื้น/ผนังภายใน", slip:"R10", env:"ภายใน", usage:["พื้น","ผนัง"], tags:["INDOOR","HYG"],
     absorb:3, thick:8, patt:4, shade:"V2", price:{"30x60":618},
     added:"2026-03-28", sold:2650, rating:4.5, reviews:33, stock:"ready", best:true},
    {id:"glee", brand:"CAMPANA", name:"WT กลี บริค ขาว (HYG) PM", sub:"กระเบื้องบุผนังลายอิฐ ผิวมัน",
     pattern:"กระเบื้องลายอิฐ ตกแต่ง เซรามิก", tex:"gloss-white", finishes:["pol"], sizes:["25x40"], colors:["ขาว"],
     use:"บุผนังภายใน", slip:"-", env:"ภายใน", usage:["ผนัง"], tags:["WALL","HYG"],
     absorb:6, thick:8, patt:1, shade:"V1", price:{"25x40":564},
     added:"2026-01-30", sold:3400, rating:4.4, reviews:58, stock:"ready", best:true},
    {id:"freya", brand:"CAMPANA", name:"WT เฟรย่า เดคคอร์ ขาว PM", sub:"กระเบื้องบุผนังลายนูน",
     pattern:"กระเบื้องลายอิฐ ตกแต่ง เซรามิก", tex:"gloss-ivory", finishes:["pol"], sizes:["25x40"], colors:["ขาว"],
     use:"บุผนังภายใน", slip:"-", env:"ภายใน", usage:["ผนัง"], tags:["WALL"],
     absorb:6, thick:8, patt:2, shade:"V1", price:{"25x40":586},
     added:"2026-02-06", sold:2100, rating:4.3, reviews:29, stock:"ready", sale:true}
  ];

  /* ---- กระจายเป็น SKU ---- */
  var SKUS = [];
  function pad(n,w){ n=String(n); while(n.length<w) n="0"+n; return n; }
  S.forEach(function (s, si) {
    s.type = "tile"; s.cat = "tile"; s.skus = [];
    var i = 0;
    s.finishes.forEach(function (f) {
      s.sizes.forEach(function (sz) {
        s.colors.forEach(function (c) {
          i++;
          var pack = PACK[sz] || {sqm:1, pcs:1};
          var perSqm = s.price[sz] + ((s.finishAdd||{})[f]||0) + ((s.colorAdd||{})[c]||0);
          var out = (s.outOfStock||[]).indexOf(c) >= 0;
          var tex = (s.tex2||{})[c] || (s.tex2||{})[f] || s.tex;
          var k = {
            sku:"Z"+pad(si+1,2)+f.toUpperCase().slice(0,3)+pad(i,2)+s.id.slice(0,4).toUpperCase(),
            seriesId:s.id, type:"tile", cat:"tile", brand:s.brand, series:s.name, seriesSub:s.sub,
            name:s.name+" "+sz+" "+FINISH[f].label+(s.colors.length>1?" สี"+c:""),
            finish:f, finishLabel:FINISH[f].label, finishEn:FINISH[f].en, finishDesc:FINISH[f].desc,
            size:sz, color:c, tex:tex, img:"tile-"+tex, pattern:s.pattern,
            pricePerSqm:perSqm, pricePerBox:Math.round(perSqm*pack.sqm),
            sqmPerBox:pack.sqm, pcsPerBox:pack.pcs, unit:"กล่อง",
            slip:s.slip, env:s.env, usage:s.usage, use:s.use, absorb:s.absorb, thick:s.thick,
            thickClass: s.thick >= 18 ? "กระเบื้องหนาพิเศษ 18, 20 มม." : "กระเบื้องหนาปกติ",
            green: !!s.green, patt:s.patt, shade:s.shade, tags:s.tags||[],
            stock: out ? 0 : (s.stock==="made" ? 0 : Math.max(3, Math.round(s.sold/60) - i*2)),
            stockState: out ? "out" : s.stock,
            rating:s.rating, reviews:s.reviews, added:s.added, sold:s.sold
          };
          SKUS.push(k); s.skus.push(k);
        });
      });
    });
    s.tis = "มอก. 2508-2555 (กระเบื้องเซรามิก)";
    s.skus.forEach(function (k) {
      k.tis = s.tis;
      if (s.sale) {                       /* ราคาก่อนลด ปัดเป็นหลักสิบ */
        k.wasPerSqm = Math.round(k.pricePerSqm * 1.18 / 10) * 10;
        k.wasPerBox = Math.round(k.wasPerSqm * k.sqmPerBox);
        k.off = Math.round((1 - k.pricePerSqm / k.wasPerSqm) * 100);
      }
    });
    s.priceFrom = Math.min.apply(null, s.skus.map(function(k){return k.pricePerSqm;}));
    s.nFinish = s.finishes.length; s.nSize = s.sizes.length; s.nColor = s.colors.length;
    s.img = "tile-"+s.tex; s.inStock = s.skus.some(function(k){return k.stock>0;});
    s.thickClass = s.thick >= 18 ? "กระเบื้องหนาพิเศษ 18, 20 มม." : "กระเบื้องหนาปกติ";
  });

  /* ---------- สุขภัณฑ์ (โครงสเปกแบบ TOTO) ---------- */
  var SAN = [
    {id:"hercules", brand:"COTTO", name:"HERCULES CURVE", sub:"สุขภัณฑ์สองชิ้นทรงโค้ง ระบบ Siphonic Jet",
     kind:"สุขภัณฑ์สองชิ้น", tex:"san-toilet-1", colors:["ขาว","ขาวมุก"],
     rating:4.9, reviews:8, added:"2026-09-30", sold:120, "new":true, warranty:"5 ปี", pieces:11,
     models:[
       {sku:"C135137", label:"TOUCHLESS 4.5 ลิตร", img:"san-toilet-1", price:21900, was:24500, stock:6,
        flush:"Siphonic Jet", rate:"4.5/3 ลิตร", rateL:4.5, rough:"305 มม.", trap:"S-Trap",
        bowl:"Elongated", tech:["ฝารองนั่งอัตโนมัติ","ผิวเคลือบยับยั้งแบคทีเรีย","ประหยัดน้ำ"], dim:"38 × 72 × 78 ซม."},
       {sku:"C135147", label:"แบบกดปกติ", img:"san-toilet-2", price:18500, was:19900, stock:14,
        flush:"Siphonic Jet", rate:"4.5/3 ลิตร", rateL:4.5, rough:"305 มม.", trap:"S-Trap",
        bowl:"Elongated", tech:["ผิวเคลือบยับยั้งแบคทีเรีย","ประหยัดน้ำ"], dim:"38 × 72 × 78 ซม."},
       {sku:"C135167", label:"TOUCHLESS ระยะท่อ 200 มม.", img:"san-toilet-1", price:21900, was:24500, stock:0,
        flush:"Siphonic Jet", rate:"4.5/3 ลิตร", rateL:4.5, rough:"200 มม.", trap:"S-Trap",
        bowl:"Elongated", tech:["ฝารองนั่งอัตโนมัติ","ผิวเคลือบยับยั้งแบคทีเรีย","ประหยัดน้ำ"], dim:"38 × 72 × 78 ซม."}
     ], install:{price:1500, area:"กรุงเทพฯ และปริมณฑล"}},

    {id:"modish", brand:"COTTO", name:"MODISH", sub:"สุขภัณฑ์ชิ้นเดียว ทรงเตี้ย ไร้ขอบ",
     kind:"สุขภัณฑ์ชิ้นเดียว", tex:"san-onepiece", colors:["ขาว"],
     rating:4.7, reviews:21, added:"2026-08-08", sold:430, warranty:"5 ปี", pieces:7,
     models:[
       {sku:"C10307", label:"ไร้ขอบ 3.8 ลิตร", img:"san-onepiece", price:16900, was:18900, stock:11,
        flush:"Jet Flush", rate:"3.8 ลิตร", rateL:3.8, rough:"305 มม.", trap:"S-Trap",
        bowl:"Elongated", tech:["ไร้ขอบ (Rimless)","ผิวเคลือบยับยั้งแบคทีเรีย","ประหยัดน้ำ"], dim:"42 × 70 × 66 ซม."},
       {sku:"C10327", label:"ไร้ขอบ พร้อมฝาอัตโนมัติ", img:"san-onepiece", price:32900, was:35900, stock:4,
        flush:"Jet Flush", rate:"3.8 ลิตร", rateL:3.8, rough:"305 มม.", trap:"S-Trap",
        bowl:"Elongated", tech:["ไร้ขอบ (Rimless)","ฝารองนั่งอัตโนมัติ","ผิวเคลือบยับยั้งแบคทีเรีย","ประหยัดน้ำ"], dim:"42 × 70 × 66 ซม."}
     ], install:{price:1500, area:"กรุงเทพฯ และปริมณฑล"}},

    {id:"avanti", brand:"COTTO", name:"AVANTI", sub:"สุขภัณฑ์แขวนผนัง สำหรับถังน้ำฝังผนัง",
     kind:"สุขภัณฑ์แขวนผนัง", tex:"san-wallhung", colors:["ขาว"],
     rating:4.8, reviews:9, added:"2026-10-12", sold:95, "new":true, warranty:"5 ปี", pieces:4,
     models:[
       {sku:"C02217", label:"ท่อออกผนัง 200 มม.", img:"san-wallhung", price:24900, was:27500, stock:5,
        flush:"Wash Down", rate:"4.5/3 ลิตร", rateL:4.5, rough:"200 มม.", trap:"P-Trap",
        bowl:"D-Shape", tech:["ไร้ขอบ (Rimless)","ผิวเคลือบยับยั้งแบคทีเรีย","ประหยัดน้ำ"], dim:"38 × 53 × 34 ซม."},
       {sku:"C02237", label:"ท่อออกผนัง 220 มม.", img:"san-wallhung", price:24900, was:27500, stock:0,
        flush:"Wash Down", rate:"4.5/3 ลิตร", rateL:4.5, rough:"220 มม.", trap:"P-Trap",
        bowl:"D-Shape", tech:["ไร้ขอบ (Rimless)","ผิวเคลือบยับยั้งแบคทีเรีย","ประหยัดน้ำ"], dim:"38 × 53 × 34 ซม."}
     ], install:{price:2500, area:"กรุงเทพฯ และปริมณฑล"}},

    {id:"spacesol", brand:"COTTO", name:"SPACE SOLUTION", sub:"สุขภัณฑ์ชิดผนัง ประหยัดพื้นที่",
     kind:"สุขภัณฑ์ชิดผนัง", tex:"san-wallfaced", colors:["ขาว"],
     rating:4.5, reviews:14, added:"2026-05-20", sold:310, warranty:"5 ปี", pieces:8,
     models:[
       {sku:"C13827", label:"ชิดผนัง 6/3 ลิตร", img:"san-wallfaced", price:13900, was:15200, stock:18,
        flush:"Wash Down", rate:"6/3 ลิตร", rateL:6, rough:"305 มม.", trap:"S-Trap",
        bowl:"Round", tech:["ผิวเคลือบยับยั้งแบคทีเรีย"], dim:"36 × 65 × 76 ซม."}
     ], install:{price:1500, area:"กรุงเทพฯ และปริมณฑล"}},

    {id:"c2basin", brand:"COTTO", name:"C2 BASIN", sub:"อ่างล้างหน้า วางบนและฝังใต้เคาน์เตอร์",
     kind:"อ่างล้างหน้า", tex:"san-basin-1", colors:["ขาว"],
     rating:4.6, reviews:12, added:"2026-07-18", sold:340, warranty:"3 ปี", pieces:3,
     models:[
       {sku:"C0231", label:"วางบนเคาน์เตอร์ 60 ซม.", img:"san-basin-1", price:4200, was:4900, stock:9,
        flush:"-", rate:"-", rateL:99, rough:"-", trap:"-", bowl:"Oval",
        tech:["ผิวเคลือบยับยั้งแบคทีเรีย"], dim:"60 × 42 × 15 ซม."},
       {sku:"C0248", label:"ฝังใต้เคาน์เตอร์ 52 ซม.", img:"san-basin-2", price:3800, was:4200, stock:0,
        flush:"-", rate:"-", rateL:99, rough:"-", trap:"-", bowl:"Square",
        tech:["ผิวเคลือบยับยั้งแบคทีเรีย"], dim:"52 × 38 × 17 ซม."}
     ], install:{price:800, area:"กรุงเทพฯ และปริมณฑล"}}
  ];

  SAN.forEach(function (s) {
    s.type = "sanitary"; s.cat = "sanitary"; s.pattern = s.kind;
    s.use = s.kind; s.slip = "-"; s.env = "ภายใน";
    s.skus = s.models.map(function (m) {
      return {
        sku:m.sku, seriesId:s.id, type:"sanitary", cat:"sanitary", brand:s.brand,
        series:s.name, seriesSub:s.sub, name:s.kind+" "+s.name+" "+m.label, label:m.label,
        kind:s.kind, flush:m.flush, rate:m.rate, rateL:m.rateL, rough:m.rough, trap:m.trap,
        bowl:m.bowl, tech:m.tech, size:m.dim, dim:m.dim, color:s.colors[0], colors:s.colors,
        price:m.price, priceWas:m.was, stock:m.stock, stockState:m.stock?"ready":"out",
        img:m.img, tex:m.img, pattern:s.kind, unit:"ชุด", warranty:s.warranty, pieces:s.pieces,
        install:s.install, use:s.kind, env:"ภายใน", usage:["ห้องน้ำ"], slip:"-", tags:[],
        tis: s.kind === "อ่างล้างหน้า" ? "มอก. 792-2554 (เครื่องสุขภัณฑ์เซรามิก)"
                                       : "มอก. 792-2554 (โถส้วมนั่งราบ)",
        off: m.was ? Math.round((1 - m.price / m.was) * 100) : 0,
        rating:s.rating, reviews:s.reviews, added:s.added, sold:s.sold
      };
    });
    s.priceFrom = Math.min.apply(null, s.skus.map(function(k){return k.price;}));
    s.nFinish = 1; s.nSize = 1; s.nColor = s.colors.length;
    s.img = s.tex; s.inStock = s.skus.some(function(k){return k.stock>0;});
    s.stock = s.inStock ? "ready" : "out";
  });


  /* ---------- อุปกรณ์ห้องน้ำ ---------- */
  var FIN_ACC = {
    chrome:{label:"โครเมียมเงา", hex:"#D5D8DC"},
    black: {label:"ดำด้าน",       hex:"#3A3C40"},
    gold:  {label:"ทองแปรง",      hex:"#B99058"},
    white: {label:"ขาว",          hex:"#F2F2F0"}
  };
  var ACC = [
    {id:"bar-line", brand:"COTTO", name:"LINE", sub:"ราวแขวนผ้าเส้นตรง ยาว 60 ซม.",
     kind:"ราวแขวนผ้า", tex:"acc-towelbar", material:"ทองเหลืองชุบ", mount:"เจาะผนัง",
     dim:"60 × 6 × 7 ซม.", warranty:"5 ปี", base:1890,
     fins:["chrome","black"], rating:4.7, reviews:0, added:"2026-09-18", sold:640},
    {id:"bar-arc", brand:"COTTO", name:"ARC", sub:"ราวแขวนผ้าสองชั้น พร้อมชั้นวาง",
     kind:"ราวแขวนผ้า", tex:"acc-towelbar", material:"สเตนเลส 304", mount:"เจาะผนัง",
     dim:"60 × 22 × 14 ซม.", warranty:"5 ปี", base:3290,
     fins:["chrome","gold"], rating:4.8, reviews:0, added:"2026-10-24", sold:210, "new":true},
    {id:"paper-line", brand:"COTTO", name:"LINE PAPER", sub:"ที่ใส่กระดาษชำระ มีฝาปิดกันน้ำ",
     kind:"ที่ใส่กระดาษชำระ", tex:"acc-paperholder", material:"ทองเหลืองชุบ", mount:"เจาะผนัง",
     dim:"16 × 13 × 7 ซม.", warranty:"5 ปี", base:1290,
     fins:["chrome","black","gold"], rating:4.6, reviews:0, added:"2026-07-30", sold:980, best:true},
    {id:"hook-dot", brand:"COTTO", name:"DOT", sub:"ตะขอแขวนทรงกลม ติดตั้งง่าย",
     kind:"ตะขอแขวน", tex:"acc-hook", material:"อะลูมิเนียม", mount:"ติดกาว",
     dim:"5.5 × 5.5 × 4 ซม.", warranty:"2 ปี", base:390,
     fins:["chrome","black","white"], rating:4.4, reviews:0, added:"2026-05-14", sold:2100, best:true},
    {id:"grab-safe", brand:"COTTO", name:"SAFE GRIP", sub:"ราวจับนิรภัย ผิวกันลื่น รับน้ำหนัก 120 กก.",
     kind:"ราวจับนิรภัย", tex:"acc-grabbar", material:"สเตนเลส 304", mount:"เจาะผนัง",
     dim:"45 × 8 × 8 ซม.", warranty:"10 ปี", base:2490,
     fins:["chrome","white"], rating:4.9, reviews:0, added:"2026-08-06", sold:430},
    {id:"soap-line", brand:"COTTO", name:"LINE SOAP", sub:"ที่ใส่สบู่ ถอดล้างได้",
     kind:"ที่ใส่สบู่", tex:"acc-soapdish", material:"ทองเหลืองชุบ", mount:"เจาะผนัง",
     dim:"14 × 12 × 6 ซม.", warranty:"5 ปี", base:990,
     fins:["chrome","black"], rating:4.3, reviews:0, added:"2026-04-02", sold:1340, sale:true},
    {id:"mirror-plain", brand:"COTTO", name:"PLAIN", sub:"กระจกห้องน้ำขอบมน กันไอน้ำ",
     kind:"กระจกห้องน้ำ", tex:"acc-mirror", material:"อะลูมิเนียม", mount:"เจาะผนัง",
     dim:"60 × 80 × 3 ซม.", warranty:"3 ปี", base:4590,
     fins:["chrome","black"], rating:4.7, reviews:0, added:"2026-10-02", sold:160, "new":true},
    {id:"tap-slim", brand:"COTTO", name:"SLIM", sub:"ก๊อกอ่างล้างหน้า ก้านโยก คอสูง",
     kind:"ก๊อกน้ำ", tex:"acc-faucet", material:"ทองเหลืองชุบ", mount:"ตั้งบนเคาน์เตอร์",
     dim:"17 × 5 × 30 ซม.", warranty:"5 ปี", base:3890,
     fins:["chrome","black","gold"], rating:4.8, reviews:0, added:"2026-06-20", sold:720, best:true},
    {id:"shower-rain", brand:"COTTO", name:"RAIN SET", sub:"ชุดฝักบัวพร้อมราวเลื่อน ปรับระดับได้",
     kind:"ฝักบัว", tex:"acc-shower", material:"ทองเหลืองชุบ", mount:"เจาะผนัง",
     dim:"20 × 12 × 90 ซม.", warranty:"5 ปี", base:5290,
     fins:["chrome","black"], rating:4.6, reviews:0, added:"2026-09-05", sold:390, sale:true}
  ];
  var FIN_ADD = {chrome:0, black:400, gold:700, white:150};
  ACC.forEach(function (s) {
    s.type = "accessory"; s.cat = "accessory"; s.pattern = s.kind; s.use = s.kind;
    s.slip = "-"; s.env = "ภายใน"; s.colors = s.fins.map(function (f) { return FIN_ACC[f].label; });
    s.tis = "มอก. 2067-2552 (อุปกรณ์ประกอบห้องน้ำ)";
    s.skus = s.fins.map(function (f, i) {
      var pr = s.base + FIN_ADD[f];
      var k = {
        sku:"A" + s.id.toUpperCase().replace(/-/g, "").slice(0, 6) + (i + 1),
        seriesId:s.id, type:"accessory", cat:"accessory", brand:s.brand,
        series:s.name, seriesSub:s.sub, kind:s.kind, label:FIN_ACC[f].label,
        name:s.kind + " " + s.name + " " + FIN_ACC[f].label,
        fin:f, finLabel:FIN_ACC[f].label, hex:FIN_ACC[f].hex, color:FIN_ACC[f].label,
        material:s.material, mount:s.mount, dim:s.dim, size:s.dim, warranty:s.warranty,
        price:pr, stock: i === 2 ? 0 : Math.max(2, Math.round(s.sold / 90) - i * 2),
        img:s.tex, tex:s.tex, pattern:s.kind, unit:"ชิ้น", use:s.kind, env:"ภายใน",
        usage:["ห้องน้ำ"], slip:"-", tags:[], tis:s.tis, pieces:1,
        rating:s.rating, reviews:0, added:s.added, sold:s.sold
      };
      k.stockState = k.stock ? "ready" : "out";
      if (s.sale) { k.priceWas = Math.round(pr * 1.2 / 10) * 10;
                    k.off = Math.round((1 - pr / k.priceWas) * 100); }
      return k;
    });
    s.priceFrom = Math.min.apply(null, s.skus.map(function (k) { return k.price; }));
    s.nFinish = s.fins.length; s.nSize = 1; s.nColor = s.fins.length;
    s.img = s.tex; s.inStock = s.skus.some(function (k) { return k.stock > 0; });
    s.stock = s.inStock ? "ready" : "out";
  });

  var ALL_SKUS = SKUS
    .concat(SAN.reduce(function (a, s) { return a.concat(s.skus); }, []))
    .concat(ACC.reduce(function (a, s) { return a.concat(s.skus); }, []));
  var ALL_SERIES = S.concat(SAN).concat(ACC);

  /* ---------- FACETS ----------
     ลำดับตั้งใจ: กระเบื้องเรียงตาม Thai Soung (งบ → หน้าตา → ความปลอดภัย → สเปกช่าง)
                 สุขภัณฑ์เรียงตาม TOTO (ประเภทติดตั้ง → เทคโนโลยี → ความเข้ากันได้ของท่อ) */
  var FACETS = {
    tile: [
      {key:"priceBand", label:"ราคา", why:"ตัดตัวเลือกออกได้มากที่สุดในคลิกเดียว ลูกค้ามักมีงบต่อ ตร.ม. มาแล้ว",
       options:[{v:"1–299 บาท/ตร.ม.",lo:0,hi:299},{v:"300–499 บาท/ตร.ม.",lo:300,hi:499},
                {v:"500–999 บาท/ตร.ม.",lo:500,hi:999},{v:"1,000 บาท/ตร.ม. ขึ้นไป",lo:1000,hi:1e9}],
       get:function(k){ return k.pricePerSqm; }, range:true},
      {key:"pattern", label:"ลวดลาย", why:"คำถามที่ลูกค้าตอบได้โดยไม่ต้องมีความรู้ช่าง และเป็นตัวตัดสินใจหลัก",
       get:function(k){ return k.pattern; }},
      {key:"finishLabel", label:"ผิวสัมผัส", why:"กำหนดทั้งหน้าตาและความลื่น จึงวางไว้ก่อนค่า R",
       get:function(k){ return k.finishLabel; }},
      {key:"slip", label:"ค่าต้านทานความลื่น (R)", why:"ต่อจากผิวสัมผัสทันที เพราะผิวเป็นตัวกำหนดค่า R",
       get:function(k){ return k.slip === "-" ? "ไม่มีค่า R" : k.slip; }},
      {key:"color", label:"สี", why:"ใช้กรองซ้ำภายในลายที่เลือกไว้แล้ว", swatch:{
        "ขาว":"#F2F2F0","ครีม":"#E3D9C6","เทา":"#9A9A96","ดำ":"#3B3B3B",
        "น้ำตาล":"#9C7449","เขียวอ่อน":"#BAC6B8","น้ำเงิน":"#3E5068"},
       get:function(k){ return k.color; }},
      {key:"size", label:"ขนาด (ซม.)", why:"จัดกลุ่มตามการใช้งาน ไม่เรียงตัวเลข เพราะรายการขนาดดิบอ่านไม่รู้เรื่อง",
       groups:SIZE_GROUPS, get:function(k){ return k.size; }},
      {key:"use", label:"การใช้งาน", why:"ลูกค้าส่วนใหญ่เข้ามาจากหมวดที่บอกการใช้งานอยู่แล้ว จึงอยู่ล่างลงมา",
       get:function(k){ return k.use; }},
      {key:"thickClass", label:"ความหนา", why:"ตัวกรองของผู้รับเหมางานภายนอก คนทั่วไปแทบไม่ใช้",
       get:function(k){ return k.thickClass; }},
      {key:"green", label:"ฉลากเขียว", why:"ใช้เฉพาะงานที่ต้องยื่นคะแนนอาคารเขียว",
       options:[{v:"Green Label Collection"}], get:function(k){ return k.green ? "Green Label Collection" : null; }}
    ],
    accessory: [
      {key:"kind", label:"ประเภทอุปกรณ์", why:"คนเข้ามาหาของชิ้นที่รู้อยู่แล้วว่าต้องการอะไร",
       get:function(k){ return k.kind; }},
      {key:"finLabel", label:"สี / ผิวเคลือบ", why:"ต้องเข้าชุดกับก๊อกและสุขภัณฑ์เดิมในห้อง",
       swatch:{"โครเมียมเงา":"#D5D8DC","ดำด้าน":"#3A3C40","ทองแปรง":"#B99058","ขาว":"#F2F2F0"},
       get:function(k){ return k.finLabel; }},
      {key:"material", label:"วัสดุ", why:"ตัดสินเรื่องสนิมและอายุการใช้งานในที่เปียก",
       get:function(k){ return k.material; }},
      {key:"mount", label:"วิธีติดตั้ง", why:"บ้านเช่าหรือผนังกระเบื้องแล้วมักเลี่ยงการเจาะ",
       get:function(k){ return k.mount; }},
      {key:"priceBand", label:"ราคา", why:"ของชิ้นเล็ก ราคาไม่ใช่ตัวตัดสินแรก จึงอยู่ท้าย",
       options:[{v:"ไม่เกิน ฿1,000",lo:0,hi:1000},{v:"฿1,000–2,500",lo:1000,hi:2500},
                {v:"฿2,500–5,000",lo:2500,hi:5000},{v:"฿5,000 ขึ้นไป",lo:5000,hi:1e9}],
       get:function(k){ return k.price; }, range:true}
    ],
    sanitary: [
      {key:"kind", label:"ประเภท", why:"ทางแยกแรกที่ย้อนกลับไม่ได้ เพราะล็อกทั้งงานติดตั้ง ราคา และรูปห้องน้ำ",
       get:function(k){ return k.kind; }},
      {key:"tech", label:"เทคโนโลยี", why:"จุดขายของแบรนด์ ใช้สอนลูกค้าว่าควรมองหาอะไร",
       multi:true, get:function(k){ return k.tech || []; }},
      {key:"flush", label:"ระบบชำระล้าง", why:"สเปกวิศวกรรมที่ตามมาจากประเภทและเทคโนโลยี",
       get:function(k){ return k.flush === "-" ? null : k.flush; }},
      {key:"rough", label:"ระยะท่อ (Rough-in)", why:"ด่านความเข้ากันได้ ผิดไป 20 มม. ก็ติดตั้งไม่ได้เลย",
       get:function(k){ return k.rough === "-" ? null : k.rough; }},
      {key:"trap", label:"ชนิดท่อ", why:"คู่กับระยะท่อ ตัดสินว่าท่อออกพื้นหรือออกผนัง",
       get:function(k){ return k.trap === "-" ? null : k.trap; }},
      {key:"rate", label:"ปริมาณน้ำต่อการกด", why:"เกณฑ์ประหยัดน้ำที่ลูกค้าและงานราชการใช้เปรียบเทียบ",
       get:function(k){ return k.rate === "-" ? null : k.rate; }},
      {key:"bowl", label:"รูปทรงโถ", why:"มีผลกับความสบายและพื้นที่ที่ใช้ แต่ไม่ใช่ตัวตัดสิน",
       get:function(k){ return k.bowl; }},
      {key:"priceBand", label:"ราคา", why:"อยู่ล่างสุด เพราะสุขภัณฑ์ซื้อชิ้นเดียว ความเข้ากันได้สำคัญกว่าราคา",
       options:[{v:"ไม่เกิน ฿10,000",lo:0,hi:10000},{v:"฿10,000–20,000",lo:10000,hi:20000},
                {v:"฿20,000–30,000",lo:20000,hi:30000},{v:"฿30,000 ขึ้นไป",lo:30000,hi:1e9}],
       get:function(k){ return k.price; }, range:true}
    ]
  };

  var SORTS = {
    tile: [
      {v:"featured", label:"สินค้าแนะนำ"},
      {v:"price-asc", label:"ราคา/ตร.ม. น้อยไปมาก"},
      {v:"price-desc", label:"ราคา/ตร.ม. มากไปน้อย"},
      {v:"new", label:"ใหม่สุด"},
      {v:"popular", label:"ขายดี"},
      {v:"size-asc", label:"ขนาด เล็กไปใหญ่"},
      {v:"size-desc", label:"ขนาด ใหญ่ไปเล็ก"},
      {v:"stock", label:"สต็อก มากไปน้อย"},
      {v:"name", label:"ชื่อสินค้า ก–ฮ"}
    ],
    accessory: [
      {v:"featured", label:"สินค้าแนะนำ"},
      {v:"price-asc", label:"ราคา น้อยไปมาก"},
      {v:"price-desc", label:"ราคา มากไปน้อย"},
      {v:"new", label:"ใหม่สุด"},
      {v:"popular", label:"ขายดี"},
      {v:"name", label:"ชื่อสินค้า ก–ฮ"}
    ],
    sanitary: [
      {v:"featured", label:"สินค้าแนะนำ"},
      {v:"price-asc", label:"ราคา น้อยไปมาก"},
      {v:"price-desc", label:"ราคา มากไปน้อย"},
      {v:"water", label:"ประหยัดน้ำที่สุด"},
      {v:"new", label:"ใหม่สุด"},
      {v:"popular", label:"ขายดี"},
      {v:"name", label:"ชื่อสินค้า ก–ฮ"}
    ]
  };

  var PARTS = {
    hercules:[{n:1,name:"โถสุขภัณฑ์ HERCULES CURVE",code:"C651407",price:12080,inStock:true,img:"san-toilet-2"},
              {n:2,name:"หม้อน้ำพร้อมฝา TOUCHLESS",code:"C60202",price:1540,inStock:true,img:"part-cistern"},
              {n:3,name:"ฝารองนั่ง SOFT CLOSE",code:"C91512",price:3930,inStock:true,img:"part-seat"},
              {n:4,name:"อุปกรณ์ภายในหม้อน้ำ เซ็นเซอร์",code:"C93876",price:3930,inStock:false,img:"part-valve"},
              {n:5,name:"สายน้ำดี 4x4 หุน 14 นิ้ว",code:"S721",price:150,inStock:true,img:"part-hose"},
              {n:6,name:"ยางรองหม้อน้ำ 3 นิ้ว",code:"C961107",price:90,inStock:true,img:"part-gasket"}],
    modish:[{n:1,name:"โถสุขภัณฑ์ MODISH",code:"C103071",price:11200,inStock:true,img:"san-onepiece"},
            {n:2,name:"ฝารองนั่ง Soft close",code:"C91520",price:2800,inStock:true,img:"part-seat"},
            {n:3,name:"อุปกรณ์ภายใน Dual flush",code:"C93810",price:1950,inStock:true,img:"part-valve"},
            {n:4,name:"ยางรองฐานโถ",code:"C96110",price:120,inStock:true,img:"part-gasket"}],
    avanti:[{n:1,name:"โถแขวนผนัง AVANTI",code:"C022171",price:17600,inStock:true,img:"san-wallhung"},
            {n:2,name:"ฝารองนั่ง Soft close",code:"C91533",price:3200,inStock:true,img:"part-seat"},
            {n:3,name:"ชุดยึดผนัง",code:"CT9901",price:1450,inStock:true,img:"part-bracket"},
            {n:4,name:"ถังน้ำฝังผนัง",code:"CT6900",price:6900,inStock:false,img:"part-tank"}],
    spacesol:[{n:1,name:"โถสุขภัณฑ์ SPACE SOLUTION",code:"C138271",price:9900,inStock:true,img:"san-wallfaced"},
              {n:2,name:"ฝารองนั่ง",code:"C91544",price:1500,inStock:true,img:"part-seat"},
              {n:3,name:"อุปกรณ์ภายใน",code:"C93822",price:1700,inStock:true,img:"part-valve"}],
    c2basin:[{n:1,name:"อ่างล้างหน้า C2",code:"C02311",price:3400,inStock:true,img:"san-basin-1"},
             {n:2,name:"สะดืออ่าง ป๊อปอัพ",code:"CT6810",price:620,inStock:true,img:"part-waste"},
             {n:3,name:"ท่อน้ำทิ้งกระปุก",code:"CT680",price:480,inStock:true,img:"part-trap"}]
  };

  var BUNDLE = [
    {name:"กาวซีเมนต์สำหรับกระเบื้องแผ่นใหญ่", unit:"ถุง", perSqm:4, pack:20, price:290, checked:true},
    {name:"ยาแนว สีเทาอ่อน", unit:"ถุง", perSqm:1.2, pack:5, price:240, checked:true},
    {name:"คิ้วจบขอบ อะลูมิเนียม", unit:"เส้น", perEdge:true, price:160, checked:false}
  ];
  /* สินค้าที่ใช้ด้วยกัน — ฝั่งสุขภัณฑ์ คิดเป็นชิ้น ไม่ใช่ต่อ ตร.ม. */
  var BUNDLE_SAN = [
    {name:"สายน้ำดีสเตนเลสถัก 16 นิ้ว", sub:"ทดแทนของเดิมที่มักเสื่อมก่อนตัวสุขภัณฑ์",
     unit:"เส้น", qty:1, price:260, checked:true},
    {name:"วาล์วเปิด-ปิดน้ำ ทองเหลืองชุบโครเมียม", sub:"ให้ปิดน้ำเฉพาะจุดได้เวลาซ่อม",
     unit:"ตัว", qty:1, price:420, checked:true},
    {name:"สายฉีดชำระ พร้อมหัวฉีด", sub:"ติดตั้งพร้อมกันได้ในครั้งเดียว",
     unit:"ชุด", qty:1, price:690, checked:false},
    {name:"ซิลิโคนยาแนวสุขภัณฑ์ ชนิดกันเชื้อรา", sub:"ใช้ยาแนวรอบฐานหลังติดตั้ง",
     unit:"หลอด", qty:1, price:180, checked:true}
  ];

  var GROUT = [["ขาว","#F2F2F0"],["เทาอ่อน","#C9C9C4"],["เทา","#8C8C88"],["ครีม","#E3D9C6"],["ดำ","#3B3B3B"]];

  return {
    series:ALL_SERIES, tileSeries:S, sanSeries:SAN, accSeries:ACC, skus:ALL_SKUS,
    facets:FACETS, sorts:SORTS, finish:FINISH, pack:PACK, sizeGroups:SIZE_GROUPS,
    parts:PARTS, bundle:BUNDLE, bundleSan:BUNDLE_SAN, grout:GROUT,
    bySku:function(id){ return ALL_SKUS.filter(function(k){return k.sku===id;})[0]; },
    bySeries:function(id){ return ALL_SERIES.filter(function(s){return s.id===id;})[0]; }
  };
})();
