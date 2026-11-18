/* ชุดไอคอนลายเส้นชุดเดียวของทั้งเว็บ — stroke อย่างเดียว ไม่มีพื้นทึบ ไม่มีอิโมจิ
   เส้นหนา 1.5 มุมมน บนกริด 24×24 เพื่อให้ทุกไอคอนดูน้ำหนักเท่ากัน */
(function () {
  var D = {
    search:   '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
    heart:    '<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6c0 4.8-7.5 9.4-7.5 9.4Z"/>',
    cart:     '<path d="M3 4h2.2l2 11.2a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L20.5 8H6"/>' +
              '<circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/>',
    pin:      '<path d="M12 21s6.5-5.6 6.5-10.3a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z"/>' +
              '<circle cx="12" cy="10.5" r="2.4"/>',
    user:     '<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    menu:     '<path d="M4 7h16M4 12h16M4 17h16"/>',
    truck:    '<path d="M3 7.5h10.5v9H3zM13.5 11h4l3 3v2.5h-7z"/>' +
              '<circle cx="7" cy="18.5" r="1.6"/><circle cx="17" cy="18.5" r="1.6"/>',
    refresh:  '<path d="M20 11a8 8 0 1 0-.9 4.7"/><path d="M20 5.5V11h-5.5"/>',
    shield:   '<path d="M12 3.5 5 6.2v5c0 4.3 2.9 7.6 7 9.3 4.1-1.7 7-5 7-9.3v-5Z"/><path d="m9.2 11.8 2 2 3.6-3.8"/>',
    card:     '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M6.5 14.5h3"/>',
    calc:     '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7h7"/>' +
              '<path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01M9 15h.01M12 15h.01M15 15h.01M12 18h.01"/>',
    ruler:    '<path d="m3.5 14.8 11.3-11.3a1.4 1.4 0 0 1 2 0l2.7 2.7a1.4 1.4 0 0 1 0 2L8.2 19.5a1.4 1.4 0 0 1-2 0l-2.7-2.7a1.4 1.4 0 0 1 0-2Z"/>' +
              '<path d="m8 10.3 1.8 1.8M11 7.3l1.8 1.8M5 13.3l1.8 1.8"/>',
    room:     '<path d="M3 10.5 12 4l9 6.5"/><path d="M5.5 9.6V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.6"/>' +
              '<path d="M9.2 20v-5.2h5.6V20"/>',
    box:      '<path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2Z"/><path d="m4 7.2 8 4.2 8-4.2M12 11.4V21"/>',
    tools:    '<path d="M14.2 6.6a3.6 3.6 0 0 1 4.9 4.6l-8.4 8.4a2 2 0 0 1-2.8-2.8l8-8"/>' +
              '<path d="M9.2 4.6 4.6 9.2 3 7.6l4.6-4.6Z"/>',
    file:     '<path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z"/>' +
              '<path d="M13.5 3v5.5H19"/><path d="M8.8 13h6.4M8.8 16.5h4.4"/>',
    track:    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2V12l3.2 1.9"/>',
    chat:     '<path d="M20.5 11.6c0 4-3.8 7.2-8.5 7.2a9.9 9.9 0 0 1-2.6-.35L4.5 20l1.3-3.5a6.8 6.8 0 0 1-2.3-4.9c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z"/>',
    line:     '<path d="M20.5 11c0 3.8-3.8 6.9-8.5 6.9-.6 0-1.2 0-1.7-.1L5.6 20l1.1-3.2A6.6 6.6 0 0 1 3.5 11c0-3.8 3.8-6.9 8.5-6.9s8.5 3.1 8.5 6.9Z"/>' +
              '<path d="M8.4 9.3v4M8.4 9.3M11 13.3v-4l2.4 4v-4M15.6 9.3h2M15.6 9.3v4h2M15.6 11.3h1.6"/>',
    phone:    '<path d="M6.3 3.8h3.1l1.4 3.6-2 1.4a11.2 11.2 0 0 0 5.3 5.3l1.4-2 3.6 1.4v3.1a1.9 1.9 0 0 1-2.1 1.9A15.6 15.6 0 0 1 4.4 5.9a1.9 1.9 0 0 1 1.9-2.1Z"/>',
    mail:     '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.6 7 8.4 6 8.4-6"/>',
    up:       '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
    check:    '<path d="m5 12.6 4.6 4.6L19 7.5"/>',
    plus:     '<path d="M12 5v14M5 12h14"/>',
    minus:    '<path d="M5 12h14"/>',
    close:    '<path d="M6 6l12 12M18 6 6 18"/>',
    right:    '<path d="m9 5 7 7-7 7"/>',
    down:     '<path d="m5 9 7 7 7-7"/>',
    filter:   '<path d="M4 6h16M7 12h10M10 18h4"/>',
    sort:     '<path d="M7 4v16M7 20l-3-3M7 4l3 3"/><path d="M17 20V4M17 4l3 3M17 20l-3-3"/>',
    grid:     '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/>' +
              '<rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
    rows:     '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
    tile:     '<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="1"/>' +
              '<rect x="3.5" y="13" width="7.5" height="7.5" rx="1"/><rect x="13" y="13" width="7.5" height="7.5" rx="1"/>',
    toilet:   '<path d="M5.5 4h3.2v6.5H5.5z"/><path d="M4.5 10.5h12a0 0 0 0 1 0 0 5.5 5.5 0 0 1-5.5 5.5H10a5.5 5.5 0 0 1-5.5-5.5Z"/>' +
              '<path d="M8.5 16v4h5"/>',
    shower:   '<path d="M12 3.5v4"/><path d="M5.5 11.5a6.5 6.5 0 0 1 13 0Z"/>' +
              '<path d="M9 15.5v1.2M12 15.5v2.4M15 15.5v1.2M10.5 19.3v1.2M13.5 19.3v1.2"/>',
    sparkle:  '<path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.7 10.4 12.2 5 10.6 10.4 9Z"/>' +
              '<path d="M18.5 16.5 19.2 18.8 21.5 19.5 19.2 20.2 18.5 22.5 17.8 20.2 15.5 19.5 17.8 18.8Z"/>'
  };
  function icon(name, cls) {
    var d = D[name]; if (!d) return "";
    return '<svg class="ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + d + "</svg>";
  }
  window.ICON = icon;
})();
