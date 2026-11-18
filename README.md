# COTTO LiFE — ต้นแบบเว็บไซต์สำหรับ User Test

ต้นแบบ 3 หน้าสำหรับใช้สัมภาษณ์ผู้ใช้ เป็นเว็บ static ล้วน ไม่มี build step

## หน้าในต้นแบบ

| ไฟล์ | หน้า |
|---|---|
| `index.html` | หน้าแรก |
| `list.html?cat=tile` | รายการสินค้า — กระเบื้อง |
| `list.html?cat=sanitary` | รายการสินค้า — สุขภัณฑ์ |
| `list.html?cat=accessory` | รายการสินค้า — อุปกรณ์ห้องน้ำ |
| `detail.html?s=<ซีรีส์>` | หน้าสินค้า เช่น `detail.html?s=carrara` |
| `detail.html?sku=<รหัส>` | หน้าสินค้าเจาะจงรุ่น เช่น `detail.html?sku=C02237` (สถานะสินค้าหมด) |

## โครงไฟล์

```
index.html, list.html, detail.html   หน้าเว็บ
assets/
  app.css      ส่วนกลาง (header, footer, ปุ่ม, ตัวแปรสี)
  home.css     หน้าแรก
  list.css     หน้ารายการสินค้า
  detail.css   หน้าสินค้า
  app.js       header / footer / การ์ดสินค้า / ตะกร้า / toast
  data.js      ข้อมูลสินค้าทั้งหมด + นิยามตัวกรองและการเรียงลำดับ
  icons.js     ชุดไอคอนลายเส้น (SVG) ใช้ทั้งเว็บ
  img/         รูปภาพ 73 ไฟล์
tools/         ไม่ถูก deploy — สคริปต์สร้างรูปและชุดทดสอบ
```

## Deploy ขึ้น Vercel

1. push โฟลเดอร์นี้ขึ้น GitHub repo
2. Vercel → Add New → Project → เลือก repo
3. Framework Preset เลือก **Other** — ไม่ต้องกรอก Build Command หรือ Output Directory
4. Deploy

`.vercelignore` กัน `tools/` ไม่ให้ถูกอัปโหลด

## รันในเครื่อง

```bash
python3 -m http.server 8000
# เปิด http://localhost:8000
```

เปิดไฟล์ `.html` ตรง ๆ ด้วย `file://` ก็ทำงานได้เหมือนกัน

## ข้อควรรู้

- **ข้อมูลสินค้าทั้งหมดเป็นข้อมูลตัวอย่าง** ไม่ใช่ข้อมูลสินค้าจริง แก้ได้ที่ `assets/data.js`
- **รูปภาพสร้างด้วยโปรแกรม** (`tools/gen_images.py`) ไม่ใช่ภาพถ่ายสินค้าจริง
- ภาพใบรับรอง มอก. เป็นภาพจำลองที่มีลายน้ำกำกับ ของจริงต้องใช้ไฟล์จากเอกสารของโรงงาน
- ยังไม่มีระบบชำระเงิน ตะกร้าเก็บแค่จำนวนไว้ใน sessionStorage

## ชุดทดสอบ

```bash
npm i playwright-core
node tools/test_list.js     # หน้ารายการสินค้า
node tools/test_detail.js   # หน้าสินค้า
node tools/test_nav.js      # การเชื่อมระหว่างหน้า
```
