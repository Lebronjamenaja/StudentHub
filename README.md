# StudentHub — Student Assignment and Task Management System

ระบบจัดการงานและกำหนดส่งงานสำหรับนักศึกษา (Student Assignment and Task Management System) พัฒนาขึ้นเพื่อเป็นโครงงานสำหรับวิชา **Web Application Development** และ **Security Testing** 

ระบบนี้เป็นเว็บแอปพลิเคชันที่ใช้งานได้จริง เชื่อมต่อกับฐานข้อมูล **Cloud Firestore** และระบบสมาชิก **Firebase Authentication** รองรับ 2 บทบาท (Student และ Admin) พร้อมทั้งออกแบบตามแนวทางความปลอดภัย **OWASP Top 10** และการปกป้องข้อมูลส่วนบุคคล (Data Masking) สามารถนำ Source Code ไป Deploy บน **Vercel** ได้ทันที

---

## 🌟 ฟีเจอร์หลักของระบบ (Key Features)

### 1. ระบบยืนยันตัวตนและบทบาทสมาชิก (Authentication & RBAC)
- **สมัครสมาชิก (Register)**: กำหนดสิทธิ์เริ่มต้นเป็น `Student` โดยอัตโนมัติ พร้อมมาตรวัดความแข็งแกร่งของรหัสผ่าน (Password Strength Meter)
- **เข้าสู่ระบบ (Login)**: รองรับ Email/Password และ Google Account พร้อมระบบ Rate Limiting และ Error Message ที่ปลอดภัย
- **2 บทบาทผู้ใช้งาน**:
  - **Student (นักศึกษา)**: สร้าง อ่าน แก้ไข ลบงานของตนเอง ส่งงาน ตรวจสอบกำหนดส่ง และส่งข้อเสนอแนะ
  - **Admin (ผู้ดูแลระบบ)**: ตรวจสอบสถิติภาพรวม ตรวจสอบสมาชิก และจัดการสถานะผู้ใช้ โดยอีเมลสมาชิกจะถูกปกปิด (Data Masking)

### 2. ระบบจัดการงานและกำหนดส่ง (Task CRUD & Submission)
- **CRUD ครบวงจร**: เพิ่มงาน ดูรายละเอียด แก้ไข และลบงาน พร้อมระบบ Confirm Dialog ป้องกันการลบโดยไม่ตั้งใจ
- **ตัวกรองและการค้นหา**: ค้นหาตามชื่องานและรายวิชา กรองตามสถานะ (`Pending`, `In Progress`, `Completed`) และความสำคัญ (`Low`, `Medium`, `High`)
- **การจัดเรียง**: เรียงลำดับตามวันกำหนดส่งจากใกล้ไปไกล หรือไกลไปใกล้
- **3 รูปแบบมุมมอง**:
  - **List View**: ตารางรายการแบบละเอียด
  - **Grid / Card View**: การ์ดสรุปข้อมูลที่สวยงาม
  - **Calendar View**: ปฏิทินแสดงกำหนดส่งงานรายเดือนแบบโต้ตอบได้
- **ระบบส่งงาน (Form 2)**: บันทึก URL ไฟล์งาน (Google Drive, GitHub ฯลฯ) พร้อมตรวจสอบรูปแบบ URL และบันทึกเวลาส่งจริง

### 3. ระบบข้อเสนอแนะและแจ้งปัญหา (Feedback - Form 3)
- แจ้งบั๊ก ปัญหาความปลอดภัย ขอฟีเจอร์ใหม่ หรือข้อเสนอแนะทั่วไป
- ปกปิดอีเมลผู้ส่งในมุมมอง Admin เพื่อความเป็นส่วนตัว
- ติดตามประวัติและสถานะของข้อเสนอแนะที่ตนเองเคยส่ง

### 4. แผงควบคุมสำหรับผู้ดูแลระบบ (Admin Dashboard & User Management)
- สถิติจำนวนสมาชิก งานในระบบ อัตราความสำเร็จ และวิชาที่มีการบ้านมากที่สุด
- ตารางจัดการสมาชิกพร้อม **Data Masking** (เช่น `st****@gmail.com`)
- สิทธิ์ในการระงับบัญชี (Suspended) หรือเปิดใช้งาน (Active)

---

## 📑 หน้าทั้งหมด 12 หน้า (12 Application Screens)

1. **Login** (`/#/login`): เข้าสู่ระบบด้วยอีเมลหรือ Google พร้อมปุ่มทดสอบบัญชีตัวอย่าง
2. **Register** (`/#/register`): สมัครสมาชิกใหม่พร้อมรหัสผ่านที่ปลอดภัย
3. **Dashboard** (`/#/dashboard`): ภาพรวมงาน สถิติความก้าวหน้า และงานด่วนที่ต้องส่งเร็ว ๆ นี้
4. **My Tasks** (`/#/tasks`): หน้ารายการงานทั้งหมด ค้นหา กรอง จัดเรียง สลับมุมมอง List/Grid/Calendar
5. **Task Details** (`/#/tasks/:id`): หน้ารายละเอียดงานแบบเต็ม ลิงก์ส่งงาน และปุ่มจัดการ
6. **Assignment Submission** (`/#/submit`): ฟอร์มส่งงานและลิงก์ พร้อมตรวจสอบ URL
7. **Feedback** (`/#/feedback`): ฟอร์มส่งความคิดเห็นและแจ้งปัญหา พร้อมประวัติการส่ง
8. **Profile** (`/#/profile`): ข้อมูลโปรไฟล์ แก้ไขชื่อ และเปลี่ยนรหัสผ่าน
9. **Admin Dashboard** (`/#/admin-dashboard`): ภาพรวมสถิติทั้งระบบสำหรับผู้ดูแล
10. **User Management** (`/#/admin-users`): ตารางจัดการสมาชิกพร้อมการ Masking ข้อมูล
11. **403 Forbidden** (`/#/403`): หน้าแจ้งเตือนกรณีไม่มีสิทธิ์เข้าถึงตามนโยบาย Zero-Trust
12. **404 Not Found** (`/#/404`): หน้าแจ้งเตือนกรณีไม่พบ URL ที่ต้องการ

---

## 🛡️ มาตรการความปลอดภัย (Security Implementations)

1. **Zero-Trust Cloud Firestore Rules**:
   - ปิดการเข้าถึงทั้งหมดเป็นค่าเริ่มต้น (`match /{document=**} { allow read, write: if false; }`)
   - ตรวจสอบความเป็นเจ้าของข้อมูลผ่าน `request.auth.uid` ในทุกการกระทำ ป้องกันช่องโหว่ **IDOR**
   - ห้ามไม่ให้นักศึกษาสามารถอ่านรายชื่อสมาชิกทั้งหมด (`allow list: if isAdmin();`)
2. **ป้องกัน Privilege Escalation**:
   - การสมัครสมาชิกใหม่บังคับ `role: 'student'` ใน Security Rules
   - ไม่สามารถเปลี่ยนแปลงบทบาทของตนเองผ่าน Client ได้
3. **ป้องกัน XSS & SQLi**:
   - ฟังก์ชัน `sanitizeText` กรองแท็ก HTML อันตราย
   - React JSX Virtual DOM ทำการ Auto-Escaping ก่อนเรนเดอร์ทุกจุด
   - Cloud Firestore เป็น NoSQL Parameterized Model ที่ปลอดภัยจาก SQL Injection
4. **Data Masking & Privacy (PDPA)**:
   - ตาราง Admin แสดงอีเมลแบบ Masking เช่น `st****@gmail.com`
   - รหัสผ่านถูกแฮชโดย Firebase Auth ห้ามบันทึกเป็น Plaintext

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Authentication**: Firebase Authentication (Email/Password & Google Sign-in)
- **Database**: Cloud Firestore
- **Security**: Cloud Firestore Security Rules (ABAC / Zero-Trust)
- **Deployment**: Vercel (`vercel.json` SPA Routing Configured)

---

## 🚀 ขั้นตอนการติดตั้งและรันในเครื่อง (Local Development)

### 1. โคลนโปรเจ็กต์และติดตั้ง Dependencies
```bash
git clone <repository-url>
cd studenthub
npm install
```

### 2. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` ไปเป็น `.env`:
```bash
cp .env.example .env
```
(ในสภาพแวดล้อม AI Studio ระบบจะอ่านการตั้งค่าจาก `firebase-applet-config.json` ให้โดยอัตโนมัติ สำหรับการ Deploy นอกระบบให้ระบุค่า Config ของ Firebase ใน `.env`)

### 3. รัน Development Server
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่ `http://localhost:3000`

### 4. ตรวจสอบโค้ดและการ Build
```bash
npm run lint    # ตรวจสอบ TypeScript Type Safety
npm run build   # ทดสอบการ Build สำหรับ Production
```

---

## ☁️ ขั้นตอนการ Deploy บน Vercel

1. **อัปโหลด Source Code ขึ้น GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete StudentHub application"
   git branch -M main
   git remote add origin https://github.com/your-username/studenthub.git
   git push -u origin main
   ```

2. **เชื่อมต่อโปรเจ็กต์บน Vercel**:
   - เข้าสู่ระบบ [Vercel](https://vercel.com)
   - กดปุ่ม **"Add New..."** -> **"Project"**
   - เลือก GitHub Repository `studenthub` ที่เพิ่งอัปโหลด
   - การตั้งค่า Framework: Vercel จะตรวจจับเป็น **Vite** โดยอัตโนมัติ
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **ตั้งค่า Environment Variables บน Vercel**:
   - ในหน้าการตั้งค่าโปรเจ็กต์ของ Vercel ไปที่แถบ **Environment Variables**
   - นำค่าจาก `firebase-applet-config.json` หรือ Firebase Console มาใส่:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_DATABASE_ID`

4. **เพิ่ม Authorized Domains ใน Firebase Console**:
   - ไปที่ Firebase Console -> **Authentication** -> **Settings** -> **Authorized domains**
   - กดเพิ่มโดเมนของ Vercel เช่น `your-studenthub-app.vercel.app` เพื่อให้สามารถ Login ได้อย่างถูกต้อง

5. **กด Deploy**:
   - Vercel จะทำกระบวนการ Build และสร้าง Production URL ให้คุณพร้อมใช้งานได้ทันที
   - ด้วยการตั้งค่าใน `vercel.json` เมื่อผู้ใช้ Refresh หน้าใน SPA Routing จะไม่เกิดปัญหา 404 อย่างแน่นอน

---

## 📂 โครงสร้างโปรเจ็กต์ (Project Structure)

```
├── .env.example                  # เทมเพลตตัวแปรสภาพแวดล้อม
├── firestore.rules               # กฎความปลอดภัย Cloud Firestore (Zero-Trust ABAC)
├── firebase-blueprint.json       # โมเดลโครงสร้างข้อมูล Intermediate Representation
├── firebase-applet-config.json   # คอนฟิกการเชื่อมต่อ Firebase
├── vercel.json                   # การตั้งค่า SPA Rewrites และ Security Headers บน Vercel
├── TEST_PLAN.md                  # แผนการทดสอบและผลการทดสอบทั้ง 12 กรณี
├── SYSTEM_TEST_REPORT.md         # รายงานสรุปผลการทดสอบความปลอดภัย OWASP
├── src/
│   ├── components/
│   │   ├── common/ConfirmModal.tsx    # หน้าต่างยืนยันก่อนลบข้อมูล
│   │   ├── layout/Navbar.tsx          # แถบเมนูด้านบน
│   │   ├── layout/Sidebar.tsx         # แถบเมนูด้านข้างแยกตามสิทธิ์
│   │   └── tasks/
│   │       ├── CalendarView.tsx       # ปฏิทินกำหนดส่งงาน
│   │       └── TaskModal.tsx          # ฟอร์มที่ 1: เพิ่มและแก้ไขงาน
│   ├── contexts/
│   │   ├── AuthContext.tsx            # ระบบยืนยันตัวตน ซิงก์โปรไฟล์ และสิทธิ์ Admin
│   │   ├── TaskContext.tsx            # ระบบ CRUD งาน และส่งงาน
│   │   └── ToastContext.tsx           # ระบบแจ้งเตือน Notification Toast
│   ├── pages/
│   │   ├── Login.tsx                  # หน้าเข้าสู่ระบบ
│   │   ├── Register.tsx               # หน้าสมัครสมาชิกใหม่
│   │   ├── Dashboard.tsx              # หน้าแดชบอร์ดนักศึกษา
│   │   ├── MyTasks.tsx                # หน้ารายการงานของฉัน
│   │   ├── TaskDetails.tsx            # หน้ารายละเอียดงาน
│   │   ├── SubmissionPage.tsx         # หน้าส่งงาน (ฟอร์มที่ 2)
│   │   ├── FeedbackPage.tsx           # หน้าส่งข้อเสนอแนะ (ฟอร์มที่ 3)
│   │   ├── ProfilePage.tsx            # หน้าโปรไฟล์และเปลี่ยนรหัสผ่าน
│   │   ├── AdminDashboard.tsx         # หน้าแดชบอร์ดผู้ดูแลระบบ
│   │   ├── UserManagement.tsx         # หน้าจัดการสมาชิกและ Data Masking
│   │   ├── ForbiddenPage.tsx          # หน้า 403 Forbidden
│   │   └── NotFoundPage.tsx           # หน้า 404 Not Found
│   ├── utils/
│   │   └── security.ts                # ฟังก์ชัน Data Masking, Date Formatter, URL Check
│   ├── types/
│   │   └── index.ts                   # Type Definitions ทั้งหมด
│   ├── lib/
│   │   └── firebase.ts                # Firebase Initialization และ Error Handler
│   ├── App.tsx                        # Router และ Component หลัก
│   └── main.tsx                       # Entry Point
```

---

## 🧑‍💻 บัญชีสำหรับทดสอบระบบ (Test Accounts)

- **Student Account (นักศึกษา)**:
  - อีเมล: `student1@demo.edu` (หรือกดสมัครสมาชิกใหม่ได้ทันที)
  - รหัสผ่าน: `Student123!`
- **Admin Account (ผู้ดูแลระบบ)**:
  - อีเมล: `buddykung2019@gmail.com`
  - รหัสผ่าน: `Admin123!`
  *(สามารถกดเลือกบัญชีทดสอบด่วนได้ที่หน้า Login)*
