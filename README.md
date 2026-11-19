# COTTO LiFE — ต้นแบบเว็บไซต์สำหรับ User Test

เว็บ static ล้วน ไม่มี build step เปิดไฟล์ `.html` ตรง ๆ ก็ทำงาน

## หน้าในต้นแบบ

| URL | หน้า |
|---|---|
| `index.html` | หน้าแรก |
| `list.html?cat=tile` | รายการสินค้า — กระเบื้อง |
| `list.html?cat=sanitary` | รายการสินค้า — สุขภัณฑ์ |
| `list.html?cat=accessory` | รายการสินค้า — อุปกรณ์ห้องน้ำ |
| `detail.html?s=carrara` | หน้าสินค้า (กระเบื้อง ลดราคา) |
| `detail.html?s=hercules` | หน้าสินค้า (สุขภัณฑ์) |
| `detail.html?s=tap-slim` | หน้าสินค้า (อุปกรณ์ห้องน้ำ) |
| `detail.html?sku=C02237` | หน้าสินค้า สถานะสินค้าหมด |

## โครงไฟล์

```
index.html, list.html, detail.html   หน้าเว็บ
assets/
  app.css      ส่วนกลาง — header, footer, ปุ่ม, ตัวแปรสี
  home.css     หน้าแรก
  list.css     หน้ารายการสินค้า
  detail.css   หน้าสินค้า
  app.js       header / footer / การ์ดสินค้า / ตะกร้า / toast
  data.js      ข้อมูลสินค้าทั้งหมด + นิยามตัวกรองและการเรียงลำดับ
  icons.js     ชุดไอคอนลายเส้น SVG ใช้ทั้งเว็บ
  img/         รูปภาพ 73 ไฟล์
```

แก้ข้อมูลสินค้า ราคา สต็อก และลำดับตัวกรอง ได้ที่ `assets/data.js` ไฟล์เดียว

## Deploy ขึ้น Vercel

1. อัปโหลดไฟล์ทั้งหมดนี้ขึ้น GitHub repo (ลากผ่านหน้าเว็บได้ ไม่ต้องใช้คำสั่ง git)
2. Vercel → Add New → Project → เลือก repo
3. Application Preset เลือก **Other** — ไม่ต้องกรอก Build Command หรือ Output Directory
4. Deploy

## รันในเครื่อง

```bash
python3 -m http.server 8000
```

## ข้อควรรู้

- **ข้อมูลสินค้าทั้งหมดเป็นข้อมูลตัวอย่าง** ไม่ใช่ข้อมูลสินค้าจริง
- **รูปภาพสร้างด้วยโปรแกรม** ไม่ใช่ภาพถ่ายสินค้าจริง
- ภาพใบรับรอง มอก. เป็นภาพจำลองที่มีลายน้ำกำกับ ของจริงต้องใช้ไฟล์จากเอกสารของโรงงาน
- ยังไม่มีระบบชำระเงิน ตะกร้าเก็บแค่จำนวนไว้ใน sessionStorage
