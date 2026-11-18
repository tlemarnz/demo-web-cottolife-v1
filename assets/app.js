/* COTTO LiFE prototype — shared behaviour (โครงตาม Figma) */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function money(n, dec) {
    return "฿" + Number(n).toLocaleString("th-TH", dec ? {minimumFractionDigits:2, maximumFractionDigits:2} : {maximumFractionDigits:0});
  }
  function img(n) { return "assets/img/" + n + ".jpg"; }

  /* ---------- cart ---------- */
  var CART = {
    get: function () { try { return +sessionStorage.getItem("cl_cart") || 0; } catch (e) { return 0; } },
    add: function (n) { var v = this.get() + (n || 1); try { sessionStorage.setItem("cl_cart", v); } catch (e) {} paint(); return v; }
  };
  function paint() { $$(".cart-n").forEach(function (e) { e.textContent = CART.get(); }); }

  /* ---------- toast ---------- */
  var tmr;
  function toast(msg) {
    var t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on");
    clearTimeout(tmr); tmr = setTimeout(function () { t.classList.remove("on"); }, 2800);
  }

  /* ---------- chrome ---------- */
  var NAV = [["Products", "list.html"], ["Room", "#"], ["Professional", "#"], ["Tools and Services", "#"]];
  function header(active) {
    return '<div class="util"><div class="wrap">' +
      '<a href="#">' + ICON("pin") + 'Find a Store</a><span class="sep"></span>' +
      '<a href="#">TH</a><span class="sep"></span><a href="#">Login/Register</a>' +
      '</div></div>' +
      '<header class="site"><div class="wrap">' +
        '<button class="burger" aria-label="เมนู">' + ICON("menu") + '</button>' +
        '<a class="logo" href="index.html">COTTO<span>·</span><i>LiFE</i></a>' +
        '<nav class="main">' + NAV.map(function (n) {
          return '<a href="' + n[1] + '"' + (active === n[0] ? ' class="on"' : '') + '>' + n[0] + '</a>';
        }).join("") + '</nav>' +
        '<label class="search">' + ICON("search") + '<input placeholder="What are you looking for?" aria-label="ค้นหา"></label>' +
        '<div class="hd-ico">' +
          '<a href="#" title="รายการที่ชอบ">' + ICON("heart") + '</a>' +
          '<a href="#" title="ตะกร้า">' + ICON("cart") + '<span class="cart-n">0</span></a>' +
        '</div>' +
      '</div></header>';
  }
  var F_COLS = [
    ["SHOP", ["New Arrival", "Tile / Floor", "Wall", "Bathroom", "Kitchen", "Outdoor", "Bedroom"]],
    ["BRANDS", ["COTTO", "SOSUCO", "CAMPANA", "LT by COTTO", "hansgrohe", "AXOR", "View all"]],
    ["SERVICES", ["Design Service", "Room Viewer", "Installation", "Sample Free", "Warranty", "E-Catalogue"]],
    ["HELP", ["Contact Us", "FAQs", "Order Tracking", "Returns", "Shipping", "Payment", "Care Guide"]],
    ["CONNECT", ["About Us", "Blog", "Careers", "Stores"]]
  ];
  function footer() {
    return '<footer class="site"><div class="wrap">' +
      '<div class="f-grid">' +
        '<div class="f-about">' +
          '<a class="logo" href="index.html">COTTO<span>·</span><i>LiFE</i></a>' +
          '<p>Authorized distributor of ceramic tiles by COTTO, CAMPANA, SOSUCO and SCG brands — delivered direct from the manufacturer.</p>' +
          '<h4>CONTACT US</h4>' +
          '<p class="addr">SCG Ceramics Public Company Limited<br>1 Siam Cement Road, Bang Sue, Bangkok 10800, Thailand</p>' +
          '<div class="f-social"><i>f</i><i>ig</i><i>yt</i><i>LINE</i></div>' +
        '</div>' +
        F_COLS.map(function (c) {
          return '<div><h4>' + c[0] + '</h4><ul>' + c[1].map(function (i) {
            return '<li><a href="#">' + i + '</a></li>'; }).join("") + '</ul></div>';
        }).join("") +
      '</div>' +
      '<div class="f-bot">' +
        '<span>© 2026 COTTO LiFE · SCG Decor PCL. &nbsp;·&nbsp; ต้นแบบสำหรับทดสอบกับผู้ใช้ ไม่ใช่เว็บไซต์จริง</span>' +
        '<span class="f-legal"><a href="#">Terms</a><a href="#">Privacy</a><a href="#">Cookie</a><a href="#">PDPA</a><a href="#">Sitemap</a></span>' +
        '<span class="f-pay"><b>VISA</b><b>MC</b><b>JCB</b><b>AMEX</b><b>TrueMoney</b></span>' +
      '</div></div></footer>' +
      '<div class="fab">' +
        '<button class="line" title="แชทผ่าน LINE" onclick="CL.toast(\'เปิดแชท LINE @COTTOLIFE (ตัวอย่าง)\')">' + ICON("chat") + '</button>' +
        '<button class="red" title="คำนวณกระเบื้อง" onclick="CL.toast(\'เปิดเครื่องคำนวณ (ตัวอย่าง)\')">' + ICON("calc") + '</button>' +
        '<button title="Room Viewer" onclick="CL.toast(\'เปิด Room Viewer (ตัวอย่าง)\')">' + ICON("room") + '</button>' +
      '</div>';
  }

  /* ---------- สถานะสต็อก ---------- */
  function stockChip(s) {
    if (s.stockState === "out" || (!s.inStock && s.inStock !== undefined) || s.stock === 0)
      return '<span class="stk out">● สินค้าหมดชั่วคราว</span>';
    if (s.stockState === "made") return '<span class="stk made">● สั่งผลิต 7–14 วัน</span>';
    return '<span class="stk ok">● พร้อมส่ง</span>';
  }
  function badges(s) {
    var b = [];
    if (s["new"]) b.push('<span class="badge new">ใหม่</span>');
    if (s.sale) b.push('<span class="badge sale">ลดราคา</span>');
    if (s.best) b.push('<span class="badge best">ขายดี</span>');
    return b.join("");
  }

  /* ---------- การ์ดซีรีส์ (หน้า list) ---------- */
  function seriesCard(s, compared) {
    var unit = s.type === "sanitary" ? " / ชุด" : " / ตร.ม.";
    var variants = s.type === "sanitary"
      ? "มี " + s.skus.length + " รุ่น · " + s.nColor + " สี"
      : "มี " + s.nFinish + " ผิว · " + s.nSize + " ขนาด" + (s.nColor > 1 ? " · " + s.nColor + " สี" : "");
    var first = s.skus.filter(function (k) { return k.stock > 0; })[0] || s.skus[0];
    return '<article class="scard" data-id="' + s.id + '">' +
      '<a class="ph" href="detail.html?sku=' + encodeURIComponent(first.sku) + '">' +
        badges(s) + '<img src="' + img(s.img) + '" alt="' + s.name + '" loading="lazy" width="420" height="420">' +
      '</a>' +
      '<div class="bd">' +
        '<span class="brand">' + s.brand + ' · ' + s.name + '</span>' +
        '<a class="nm" href="detail.html?sku=' + encodeURIComponent(first.sku) + '">' + s.sub + '</a>' +
        '<span class="use">' + s.use + (s.slip && s.slip !== "-" ? " · กันลื่น " + s.slip : "") + '</span>' +
        '<span class="var">' + variants + '</span>' +
        '<div class="pr"><span>เริ่มต้น</span> <b>' + money(s.priceFrom) + '</b><small>' + unit + '</small></div>' +
        '<div class="foot">' + stockChip(s) +
          '<label class="cmp"><input type="checkbox" class="cmpbox" value="' + s.id + '"' +
          (compared ? " checked" : "") + '> เปรียบเทียบ</label>' +
        '</div>' +
      '</div></article>';
  }

  /* ---------- การ์ดสินค้า (หน้าแรก / สินค้าคล้ายกัน) ---------- */
  function productCard(k, opt) {
    opt = opt || {};
    var tags = (k.tags || []).map(function (t) { return '<span class="tg">' + t + '</span>'; }).join("");
    var price = k.type === "sanitary"
      ? '<b>' + money(k.price) + '</b><small>ราคา/ชุด</small>'
      : '<b>' + money(k.pricePerBox, true) + '</b><small>ราคา/' + (k.unit === "ม้วน" ? "ม้วน" : "กล่อง") + '</small>';
    var size = k.unit === "ม้วน" ? "ขนาด " + k.size : (k.type === "sanitary" ? k.size : "ขนาด " + k.size + " ซม.");
    return '<a class="pcard" href="detail.html?sku=' + encodeURIComponent(k.sku) + '">' +
      '<div class="ph">' + (tags ? '<div class="tags">' + tags + '</div>' : "") +
        '<img src="' + img(k.img) + '" alt="' + k.name + '" loading="lazy" width="360" height="360"></div>' +
      '<div class="bd"><span class="brand">' + k.brand + '</span>' +
        '<span class="nm">' + (opt.short ? k.series : k.name) + '</span>' +
        '<span class="sz">' + size + '</span>' +
        '<div class="pr">' + price + '</div>' +
        (k.stock > 0 ? '<span class="stk ok">● มีสินค้า</span>' : '<span class="stk out">● สินค้าหมด</span>') +
      '</div></a>';
  }

  function mount(active) {
    var h = document.getElementById("hd") || document.getElementById("hdr"),
        f = document.getElementById("ft") || document.getElementById("ftr");
    if (h) h.innerHTML = header(active);
    if (f) f.innerHTML = footer();
    paint();
    document.addEventListener("click", function (e) {
      if (e.target.closest(".burger")) toast("เมนูมือถือ (ตัวอย่าง)");
    });
  }

  window.CL = { $: $, $$: $$, money: money, img: img, mount: mount, toast: toast, CART: CART,
                seriesCard: seriesCard, productCard: productCard, stockChip: stockChip, badges: badges };
})();
