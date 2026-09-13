# ระบบจัดการกระแสเงินสดและสต๊อกกงสี

Monorepo: `backend` (FastAPI) + `frontend` (Next.js). ออกแบบมาให้ deploy ได้ฟรีทั้งคู่:

- **Frontend** → Vercel (ฟรี, เหมาะกับ Next.js โดยตรง)
- **Backend** → Render free tier (รัน FastAPI ได้ยาวๆ ไม่เหมือน Vercel serverless ที่ไม่เหมาะกับ DB connection แบบ persistent)
- **Database** → Neon หรือ Supabase (Postgres ฟรี, serverless-friendly)

> ทำไมไม่ใส่ backend ไว้บน Vercel ด้วยเลย? เพราะ Vercel รัน Python เป็น serverless function อายุสั้นมาก ไม่เหมาะกับ SQLAlchemy connection pool และแอปนี้ใช้งานทีเดียวตอนปิดร้าน (rapid entry) ซึ่ง Render free tier "sleep เมื่อไม่มีคนใช้" ก็รับได้สบายๆ เพราะเรียกวันละครั้ง

---

## ขั้นตอนที่ 1: เตรียม Database ฟรี (Neon)

1. สมัคร https://neon.tech (ฟรี ไม่ต้องผูกบัตร)
2. สร้าง Project ใหม่ → จะได้ Connection String ประมาณ:
   `postgresql://user:password@ep-xxx.neon.tech/shopdb?sslmode=require`
3. เก็บ connection string นี้ไว้ใช้ในขั้นตอนที่ 3

(ทางเลือกอื่น: Supabase ก็ใช้ได้เหมือนกัน วิธีตั้งค่าคล้ายกัน)

---

## ขั้นตอนที่ 2: Push ขึ้น GitHub

```bash
cd family-shop-app
git init
git add .
git commit -m "Initial commit: shop cash flow system"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

---

## ขั้นตอนที่ 3: Deploy Backend (Render)

1. เข้า https://render.com → New → Web Service → เชื่อม GitHub repo นี้
2. Render จะเจอไฟล์ `backend/render.yaml` อัตโนมัติ (Root Directory ตั้งเป็น `backend`)
   - ถ้าไม่เจอ ให้ตั้งเองด้วยมือ:
     - Root Directory: `backend`
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. ไปที่ Environment ของ service แล้วเพิ่ม env vars:
   - `DATABASE_URL` = connection string จาก Neon (ขั้นตอนที่ 1)
   - `CORS_ORIGINS` = ใส่ไว้ก่อนว่า `http://localhost:3000` (จะกลับมาแก้เป็น URL ของ Vercel ทีหลัง)
4. Deploy แล้วจะได้ URL backend เช่น `https://family-shop-api.onrender.com`
5. ทดสอบ: เปิด `https://family-shop-api.onrender.com/api/health` ต้องเห็น `{"status":"ok"}`

---

## ขั้นตอนที่ 4: Deploy Frontend (Vercel)

1. เข้า https://vercel.com → Add New Project → เลือก repo เดียวกัน
2. ตั้งค่า **Root Directory = `frontend`** (สำคัญมาก เพราะเป็น monorepo)
3. เพิ่ม Environment Variable:
   - `NEXT_PUBLIC_API_URL` = URL backend จาก Render (ขั้นตอนที่ 3 ข้อ 4)
4. กด Deploy จะได้ URL เช่น `https://family-shop.vercel.app`

---

## ขั้นตอนที่ 5: อัปเดต CORS ให้ backend อนุญาต frontend จริง

กลับไปที่ Render → Environment ของ backend → แก้ `CORS_ORIGINS` เป็น:
```
https://family-shop.vercel.app
```
แล้วกด Manual Deploy อีกครั้งเพื่อให้ env var ใหม่มีผล

---

## รันทดสอบในเครื่องตัวเอง (Local Development)

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # ถ้าไม่ตั้ง DATABASE_URL จะ fallback เป็น sqlite ไฟล์เดียวให้ทดสอบได้ทันที
uvicorn app.main:app --reload
```
เปิด http://localhost:8000/docs เพื่อทดสอบ API ผ่าน Swagger UI

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local   # ชี้ NEXT_PUBLIC_API_URL ไปที่ http://localhost:8000
npm run dev
```
เปิด http://localhost:3000

---

## โครงสร้างโปรเจกต์

```
family-shop-app/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entrypoint + CORS
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # Customer, Transaction, DebtPayment, FamilyCredit
│   │   ├── schemas.py         # Pydantic request/response models
│   │   └── routers/
│   │       ├── transactions.py
│   │       ├── customers.py
│   │       ├── family_credits.py
│   │       └── dashboard.py
│   ├── requirements.txt
│   └── render.yaml
└── frontend/
    ├── app/
    │   ├── page.tsx            # หน้าบันทึกรายรับ (rapid entry)
    │   ├── expense/page.tsx    # หน้าบันทึกรายจ่าย
    │   └── debts/page.tsx      # สมุดแปะโป้งออนไลน์
    └── lib/
        ├── api.ts              # เรียก backend API
        └── BottomNav.tsx
```

## สิ่งที่ยังไม่ได้ทำ (ต่อยอดได้)
- หน้าเพิ่ม/แก้ไขรายชื่อลูกค้าแปะโป้ง (ตอนนี้ต้องเพิ่มผ่าน `/docs` ของ backend ก่อน)
- หน้า Dashboard วิเคราะห์ cash flow (มี endpoint `/api/dashboard/daily-summary` พร้อมแล้ว รอแค่ทำ UI)
- ปุ่ม UI สำหรับ family-credits clearing (มี API พร้อมแล้วใน `family_credits.py`)
- Database migration ด้วย Alembic (ตอนนี้ใช้ `create_all` แบบ auto-create ซึ่งพอสำหรับ MVP)
