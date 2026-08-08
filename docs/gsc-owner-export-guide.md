# GSC Owner Export Guide (BuyHub)

เป้าหมาย: ได้ Performance data จริงจาก Google Search Console เพื่อรัน Ranking Opportunity Matrix  
**ห้ามแก้เว็บก่อนมีไฟล์เหล่านี้**

## ช่วงเวลาที่ต้องการ

1. **หลัก:** Last **3 months** (Search results)
2. **เสริม (ถ้า export ได้):** Last **6 months** แยกไฟล์ — ห้ามรวมกับไฟล์ 3 เดือนในครั้งเดียว

ใส่ช่วงวันที่จริงในชื่อไฟล์หรือบอกทีมตอนส่ง เช่น `2026-05-08_to_2026-08-08`

## สิ่งที่ต้องมีในทุกไฟล์

คอลัมน์อย่างน้อย:

| Field | ชื่อที่ GSC มักใช้ |
|-------|-------------------|
| Clicks | Clicks |
| Impressions | Impressions |
| CTR | CTR / Average CTR |
| Position | Position / Average position |

บวกอย่างน้อยหนึ่งในนี้ตามประเภทไฟล์:

- **Query** หรือ Top queries
- **Page** หรือ Top pages / Landing page
- **Query + Page** ในแถวเดียวกัน (ดีที่สุด)

## Export ที่ต้องการ (เรียงความสำคัญ)

### 1) Query × Page — **สำคัญที่สุด**

ใช้วิเคราะห์ cannibalization / wrong URL / Position 4–20 ต่อหน้า

ถ้า UI ปกติ export แยก Query กับ Page อย่างเดียว:

- ใช้ Google Search Console API (Search Analytics) ขอ dimension `query` + `page` หรือ
- ใช้เครื่องมือ export ที่ได้ตาราง Query×Page

ใส่ไฟล์ที่:

`docs/gsc/query-page-3m.csv`

### 2) Pages export

`docs/gsc/pages-3m.csv`

ใช้ดู Money / KEEP / Province visibility

### 3) Queries export

`docs/gsc/queries-3m.csv`

ใช้ดู demand ระดับคำค้น

## ขั้นตอนใน GSC UI (Pages / Queries)

1. เปิดทรัพย์สิน `buyhubthai.com`
2. **Performance → Search results**
3. เลือกช่วง **Last 3 months**
4. เปิดแท็บ **Queries** → Export → Download CSV → บันทึกเป็น `docs/gsc/queries-3m.csv`
5. เปิดแท็บ **Pages** → Export → Download CSV → บันทึกเป็น `docs/gsc/pages-3m.csv`
6. (ถ้ามี) Export ตารางที่มีทั้ง Query และ Page → `docs/gsc/query-page-3m.csv`

## หลังวางไฟล์แล้ว ให้รัน

```bash
node scripts/analyze-gsc-query-page.mjs --query docs/gsc/queries-3m.csv --page docs/gsc/pages-3m.csv --start YYYY-MM-DD --end YYYY-MM-DD
```

ถ้ามี Query×Page:

```bash
node scripts/analyze-gsc-query-page.mjs --query-page docs/gsc/query-page-3m.csv --query docs/gsc/queries-3m.csv --page docs/gsc/pages-3m.csv --start YYYY-MM-DD --end YYYY-MM-DD
```

สคริปต์จะสร้าง/อัปเดต:

- `docs/gsc-ranking-opportunities.json`
- `docs/gsc-ranking-opportunities.md`
- `docs/gsc-primary-query-registry.json`

## ข้อห้าม

- อย่าส่ง screenshot อย่างเดียวถ้าหลีกเลี่ยงได้ — ต้องเป็น CSV/JSON
- อย่ารวมหลายช่วงเวลาในไฟล์เดียวโดยไม่บอก
- อย่าแก้ตัวเลข/กรองเฉพาะเงินก่อนส่ง — ส่ง raw export
- Filter แนะนำตอน export: Search type = **Web**, ไม่ต้องตัด Brand ออกเอง

## สถานะปัจจุบัน

**GSC DATA NOT PROVIDED** ใน repository  
Architecture cleanup เสร็จแล้ว — รอไฟล์นี้เพื่อเปิด Implementation Gate
