# รายงานผลการทดสอบระบบ (System Test Report)
## โครงงาน: ระบบจัดการงานและกำหนดส่งงานสำหรับนักศึกษา (StudentHub)
### วิชา: Web Application Development and Security Testing

---

**ข้อมูลทั่วไปของเอกสาร (Document Information)**
- **ชื่อระบบ:** StudentHub — Student Assignment and Task Management System
- **รหัสเอกสาร:** STR-STUDENTHUB-2026-V1
- **วันที่จัดทำ:** 15 ตุลาคม 2569
- **เวอร์ชันเอกสาร:** 1.0 (ฉบับสมบูรณ์)
- **ประเภทการทดสอบ:** Functional Testing, Security Testing (OWASP Top 10), Data Privacy & Authorization Verification

---

## 1. บทนำและวัตถุประสงค์ (Introduction & Objectives)

### 1.1 บทนำ
เว็บแอปพลิเคชัน **StudentHub** ได้รับการพัฒนาขึ้นเพื่อแก้ปัญหาการติดตามการบ้าน งานกลุ่ม และกำหนดส่งงานของนักศึกษา โดยมุ่งเน้นการเป็นระบบที่ใช้งานได้จริง มีการเชื่อมต่อกับระบบฐานข้อมูลแบบเรียลไทม์ (Cloud Firestore) และระบบยืนยันตัวตน (Firebase Authentication) มีการแบ่งระดับสิทธิ์ผู้ใช้งานเป็น 2 บทบาทอย่างเคร่งครัด ได้แก่ นักศึกษา (Student) และ ผู้ดูแลระบบ (Admin)

### 1.2 วัตถุประสงค์ของการทดสอบ
1. **การทดสอบความถูกต้องของฟังก์ชันงาน (Functional Testing):** เพื่อยืนยันว่ากระบวนการสมัครสมาชิก เข้าสู่ระบบ ออกจากระบบ การสร้าง อ่าน แก้ไข ลบงาน (CRUD) การส่งงาน และการส่งข้อเสนอแนะ ทำงานได้ถูกต้องสมบูรณ์ตามข้อกำหนด
2. **การทดสอบความปลอดภัยและการควบคุมสิทธิ์ (Security & Authorization Testing):** เพื่อประเมินความปลอดภัยตามมาตรฐาน **OWASP Top 10** โดยเฉพาะการป้องกันช่องโหว่ Insecure Direct Object References (IDOR), Privilege Escalation, Cross-Site Scripting (XSS) และ SQL/NoSQL Injection
3. **การทดสอบการปกป้องข้อมูลส่วนบุคคล (Data Privacy & Masking):** ตรวจสอบว่าระบบมีการปกปิดอีเมลและข้อมูลส่วนบุคคลของนักศึกษาตามหลัก PDPA ในหน้าจอของผู้ดูแลระบบ
4. **การทดสอบการแสดงผลบนอุปกรณ์ที่หลากหลาย (Responsive UI Testing):** ยืนยันว่าหน้าจอเว็บแอปพลิเคชันสามารถแสดงผลและใช้งานได้ดีทั้งบนหน้าจอ Desktop, Tablet และ Mobile

---

## 2. ขอบเขตการทดสอบ (Testing Scope)

การทดสอบครอบคลุมโมดูลและหน้าจอทั้งหมด 12 หน้าของระบบ ได้แก่:
1. ระบบสมาชิกและการจัดการสิทธิ์: หน้าเข้าสู่ระบบ (Login) และ หน้าสมัครสมาชิก (Register)
2. ระบบแดชบอร์ดนักศึกษา: หน้าแดชบอร์ดหลัก (Dashboard)
3. ระบบจัดการงาน (Task Management): หน้างานของฉัน (My Tasks), หน้าดูรายละเอียดงาน (Task Details)
4. ฟอร์มการทำงานจริง (Forms): ฟอร์มเพิ่ม/แก้ไขงาน (Form 1), ฟอร์มส่งงาน (Form 2), ฟอร์มส่งข้อเสนอแนะ (Form 3)
5. ระบบโปรไฟล์และความปลอดภัยส่วนบุคคล: หน้าโปรไฟล์ (Profile)
6. ระบบบริหารจัดการสำหรับผู้ดูแลระบบ: แดชบอร์ดผู้ดูแล (Admin Dashboard), จัดการสมาชิก (User Management)
7. ระบบจัดการข้อผิดพลาดตามความปลอดภัย: หน้า 403 Forbidden และ หน้า 404 Not Found
8. การแสดงผลแบบ Responsive UI บนขนาดหน้าจอ Viewport ต่าง ๆ

---

## 3. สภาพแวดล้อมที่ใช้ทดสอบ (Test Environment)

| องค์ประกอบ (Component) | รายละเอียดที่ใช้ทดสอบ (Specification) |
|---|---|
| **Operating System** | Linux (Ubuntu 24.04 LTS), Windows 11, macOS Sequoia |
| **Web Browsers** | Google Chrome 130+, Mozilla Firefox 131+, Safari 18+, Microsoft Edge |
| **Mobile Viewport** | iPhone 14/15 (390x844), iPad Air (820x1180), Desktop (1920x1080) |
| **Frontend Framework** | React 19.0.1, TypeScript 5.8+, Vite 8.3.0 |
| **Styling Engine** | Tailwind CSS v4, Lucide React Icons |
| **Authentication Engine** | Firebase Authentication (Email/Password & Google OAuth) |
| **Cloud Database** | Cloud Firestore (Google Cloud Project ID: `studenthub-62716`) |
| **Security Enforcer** | Cloud Firestore Security Rules (ABAC / Zero-Trust Model) |
| **Hosting Platform** | AI Studio Cloud Run Engine & Vercel Edge Network (with `vercel.json` SPA Rewrites) |

---

## 4. รายการฟังก์ชันที่ทดสอบ (Test Features Specification)

1. **โมดูลการยืนยันตัวตน (Authentication):** ตรวจสอบฟอร์ม Register (ตรวจสอบความยาวรหัสผ่าน, ความปลอดภัย, ป้องกันอีเมลซ้ำ), Login, Logout, Session Persistence, และ Error Handling
2. **โมดูลจัดการงาน (Task CRUD):** ตรวจสอบการเพิ่มงาน (Create), การค้นหา/กรองสถานะ/ความสำคัญ/มุมมองปฏิทิน (Read), การแก้ไขข้อมูล (Update), และการลบงานพร้อม Confirm Modal (Delete)
3. **โมดูลการส่งงาน (Assignment Submission):** ตรวจสอบการเลือกงาน, การตรวจสอบรูปแบบ URL (RFC URL Validation), การบันทึกเวลาที่ส่ง และการอัปเดตสถานะเป็น เสร็จสมบูรณ์
4. **โมดูลข้อเสนอแนะ (Feedback):** ตรวจสอบการระบุหมวดหมู่บั๊ก/ฟีเจอร์/ความปลอดภัย, การบันทึกลงฐานข้อมูล, การแสดงประวัติย้อนหลัง
5. **โมดูลข้อมูลส่วนตัว (Profile):** ตรวจสอบการแก้ไขชื่อ นามสกุล, การเปลี่ยนรหัสผ่านใหม่ (Password Update)
6. **โมดูลการปกปิดข้อมูล (Data Masking):** ตรวจสอบฟังก์ชัน `maskEmail` ในหน้าตารางผู้ดูแล
7. **โมดูลควบคุมการเข้าถึง (Authorization & Access Control):** ตรวจสอบการบล็อก IDOR ในระดับ Cloud Firestore และการสกัดกั้น Student เข้าหน้า Admin นำไปสู่หน้า 403 Forbidden
8. **โมดูล Responsive UI:** ตรวจสอบ Layout, Sidebar Drawer บน Mobile, Navigation Bar, และ Cards/Tables

---

## 5. ตารางผลการทดสอบจริง (Detailed Test Execution Matrix)

เกณฑ์การกำหนดสถานะ (Status Definition):
- **PASS:** ฟังก์ชันหรือมาตรการความปลอดภัยทำงานได้ถูกต้องตาม Expected Result อย่างสมบูรณ์
- **FAIL:** ฟังก์ชันทำงานผิดพลาด หรือมีช่องโหว่ความปลอดภัยที่ไม่เป็นไปตามที่กำหนด
- **BLOCKED:** การทดสอบไม่สามารถดำเนินการต่อได้เนื่องจากติดปัญหาในระบบส่วนอื่น
- **NOT TESTED:** ยังไม่ได้ทำการทดสอบจริงในรอบการประเมินนี้

---

### ตารางบันทึกการทดสอบ (Test Cases)

| Test ID | หัวข้อการทดสอบ | ขั้นตอนการทดสอบ (Steps) | ผลลัพธ์ที่คาดหวัง (Expected Result) | ผลลัพธ์ที่เกิดขึ้นจริง (Actual Result) | สถานะ (Status) |
|:---:|---|---|---|---|:---:|
| **TC-01** | สมัครสมาชิกด้วยข้อมูลถูกต้อง (Register Success) | 1. ไปที่ `/#/register`<br>2. กรอกชื่อ `สมชาย ใจดี`<br>3. กรอกอีเมลและรหัสผ่านที่ถูกต้อง<br>4. กดยืนยันการสมัคร | บัญชีถูกสร้างใน Firebase Auth, บันทึกข้อมูลลง Firestore `/users/{uid}` ด้วยบทบาท `student` และเข้าสู่ Dashboard อัตโนมัติ | บัญชีถูกสร้างสำเร็จ บันทึก `role: 'student'` แสดงแจ้งเตือนสีเขียว และนำทางไปยังหน้า Dashboard ทันที | **PASS** |
| **TC-02** | ตรวจสอบ Validation ฟอร์มสมัครสมาชิก (Register Validation) | 1. กรอกรหัสผ่านน้อยกว่า 6 ตัวอักษร<br>2. กรอกรหัสผ่านและยืนยันไม่ตรงกัน<br>3. ใช้อีเมลที่มีอยู่แล้วในระบบ | ระบบต้องปฏิเสธการส่งฟอร์ม แสดงข้อความแจ้งเตือนภาษาไทยที่ชัดเจน และไม่เกิด Unhandled Exception | แสดงข้อความเตือนความยาวรหัสผ่าน, ความไม่ตรงกันของรหัสผ่าน และเตือนอีเมลซ้ำตามลำดับอย่างถูกต้อง | **PASS** |
| **TC-03** | เข้าสู่ระบบและออกจากระบบ (Login & Logout) | 1. ไปที่ `/#/login`<br>2. กรอกอีเมลและรหัสผ่านที่ถูกต้อง<br>3. ตรวจสอบการเข้าสู่ระบบ<br>4. กดปุ่ม Logout ที่เมนูโปรไฟล์ | เข้าสู่ Dashboard ได้สำเร็จ และเมื่อ Logout แล้ว Session ต้องถูกล้าง พร้อม Redirect กลับมายังหน้า Login | Session ถูกจัดการผ่าน `onAuthStateChanged` เมื่อ Logout ข้อมูลใน State ถูกเคลียร์ และถูกส่งกลับมาหน้า Login | **PASS** |
| **TC-04** | การเพิ่มงานใหม่ (Create Task) | 1. กดปุ่ม "เพิ่มงานใหม่"<br>2. กรอกชื่องาน, รายวิชา, วันกำหนดส่ง, ความสำคัญ, สถานะ<br>3. กดบันทึก | ข้อมูลงานถูกสร้างและบันทึกลงคอลเลกชัน `tasks` ใน Cloud Firestore โดยมี `ownerUid` ตรงกับผู้ใช้ | งานถูกสร้างใน Firestore ทันที แสดง Toast แจ้งเตือนสีเขียว และรายการงานปรากฏในหน้ารายการทันที | **PASS** |
| **TC-05** | การค้นหา กรอง และสลับมุมมองงาน (Read & Filter Tasks) | 1. ค้นหาชื่องานในช่อง Search<br>2. กรองตามสถานะ และระดับความสำคัญ<br>3. สลับมุมมอง List, Grid และ Calendar | แสดงเฉพาะงานที่ตรงตามเงื่อนไข ปฏิทินแสดงงานตรงตามวันกำหนดส่ง และนับจำนวนถูกต้อง | ตัวกรองทำงานแบบเรียลไทม์ ปฏิทินรายเดือนแสดงสีตามระดับความสำคัญ สามารถคลิกดูงานได้ทุกรายการ | **PASS** |
| **TC-06** | การแก้ไขข้อมูลงาน (Update Task) | 1. กดปุ่มแก้ไขที่รายการงาน<br>2. ปรับเปลี่ยนชื่องานและสถานะเป็น `In Progress`<br>3. กดบันทึกการแก้ไข | ข้อมูลงานใน Cloud Firestore ได้รับการอัปเดต พร้อมบันทึกเวลา `updatedAt` | ข้อมูลในหน้ารายละเอียดและหน้ารายการอัปเดตทันทีแบบ Real-time Snapshot | **PASS** |
| **TC-07** | การลบงานและ Confirmation Modal (Delete Task) | 1. กดปุ่มลบงานที่รายการงาน<br>2. ตรวจสอบ Modal ยืนยัน<br>3. กดยืนยันการลบ | ระบบแสดงหน้าต่างยืนยัน และเมื่อกดยืนยัน เอกสารจะถูกลบออกจาก Firestore อย่างถาวร | Modal แสดงคำเตือนชัดเจน เมื่องานถูกลบจะหายไปจากรายการทันที และมี Toast แจ้งผล | **PASS** |
| **TC-08** | การส่งงานและตรวจสอบ URL (Assignment Submission) | 1. ไปที่ `/#/submit`<br>2. เลือกงานที่ต้องการส่ง<br>3. ทดสอบกรอก URL ผิด เช่น `abc`<br>4. กรอก URL ที่ถูกต้อง เช่น `https://github.com/...`<br>5. กดยืนยันส่งงาน | ระบบต้องบล็อก URL ที่ผิดรูปแบบ และเมื่อกรอก URL ถูกต้อง จะปรับสถานะงานเป็น `Completed` พร้อมบันทึกเวลา | ฟังก์ชัน `isValidHttpUrl` ดักจับ URL ผิดได้ถูกต้อง เมื่อส่งผ่าน สถานะงานเปลี่ยนเป็นเสร็จสมบูรณ์ทันที | **PASS** |
| **TC-09** | การส่งข้อเสนอแนะและแจ้งบั๊ก (Feedback Form) | 1. ไปที่ `/#/feedback`<br>2. เลือกหมวดหมู่ `bug`<br>3. กรอกหัวข้อและรายละเอียด<br>4. กดส่งข้อเสนอแนะ | บันทึกข้อเสนอแนะลงคอลเลกชัน `/feedbacks` ใน Firestore โดยระบุ `userUid` และ Masking อีเมล | ข้อมูลถูกบันทึกลง Firestore สำเร็จ ปรากฏในประวัติของนักศึกษา และแสดงในหน้า Admin Dashboard | **PASS** |
| **TC-10** | การจัดการโปรไฟล์และเปลี่ยนรหัสผ่าน (Profile & Password Update) | 1. ไปที่ `/#/profile`<br>2. แก้ไขชื่อ-นามสกุลแล้วกดบันทึก<br>3. กรอกรหัสผ่านใหม่และยืนยัน<br>4. กดเปลี่ยนรหัสผ่าน | ชื่อที่แสดงในระบบอัปเดต และรหัสผ่านใน Firebase Authentication ถูกเปลี่ยนเป็นรหัสใหม่สำเร็จ | ชื่อโปรไฟล์อัปเดตทันที รหัสผ่านถูกอัปเดตผ่าน Firebase Auth และทดสอบล็อกอินด้วยรหัสใหม่ได้ | **PASS** |
| **TC-11** | การปกปิดข้อมูลส่วนบุคคล (Email Data Masking) | 1. เข้าสู่ระบบด้วยบัญชี Admin<br>2. ไปที่ `/#/admin-users` และ `/#/admin-dashboard`<br>3. ตรวจสอบคอลัมน์อีเมล | อีเมลสมาชิกต้องแสดงในรูปแบบปกปิด เช่น `st****@domain.com` หรือ `bu****@gmail.com` | อีเมลสมาชิกทั้งหมดในตารางและ Modal รายละเอียดถูก Masking ด้วย `maskEmail` อย่างถูกต้อง | **PASS** |
| **TC-12** | การป้องกัน IDOR (Insecure Direct Object References) | 1. นักศึกษา A พยายามเข้าถึงงานของนักศึกษา B ด้วย URL `#/tasks/{b_task_id}`<br>2. ส่งคำขอลบงานของผู้อื่น | Cloud Firestore Rules ต้องปฏิเสธคำขอด้วย `PERMISSION_DENIED` และหน้าเว็บแจ้งว่าไม่มีสิทธิ์ | ระบบไม่อนุญาตให้อ่านหรือแก้ไขงานของผู้อื่น และแสดงข้อความแจ้งเตือนอย่างปลอดภัย | **PASS** |
| **TC-13** | การป้องกัน Privilege Escalation และสิทธิ Admin (Authorization Guard) | 1. ล็อกอินด้วยบัญชี Student<br>2. พิมพ์ URL ตรงไปที่ `/#/admin-dashboard` หรือ `/#/admin-users` | ระบบต้องไม่อนุญาตให้เข้าถึง และนำทางไปยังหน้า `403 Forbidden` ทันที | ระบบตรวจสอบสิทธิ์ผ่าน Router Guard และ Security Rules นำทางไปหน้า **403 Forbidden** ทันที | **PASS** |
| **TC-14** | การป้องกัน Cross-Site Scripting (XSS Attack Payload) | 1. กรอกชื่องานเป็น `<script>alert('XSS')</script>`<br>2. กรอกคำอธิบายเป็น `<img src=x onerror=alert(1)>` | โค้ด HTML/JS ต้องไม่ถูกประมวลผลเป็นสคริปต์ และแสดงผลเป็นข้อความธรรมดา | React Virtual DOM Escape ข้อความ และฟังก์ชัน `sanitizeText` กรองแท็กออก ไม่มี Alert รัน | **PASS** |
| **TC-15** | การป้องกัน SQL/NoSQL Injection Payload | 1. ในช่องค้นหาและฟอร์ม กรอก `' OR '1'='1` หรือ `admin' --`<br>2. ส่งคำขอบันทึก | ระบบต้องไม่ล่ม ไม่เกิดข้อผิดพลาดด้านไวยากรณ์ และไม่เปิดเผยข้อมูลส่วนอื่น | ระบบประมวลผลเป็นสตริงธรรมดา ไม่มีข้อผิดพลาดทางไวยากรณ์ และ Firestore ปลอดจาก SQL Injection | **PASS** |
| **TC-16** | การแสดงผลและการตอบสนองของหน้าจอ (Responsive UI) | 1. ทดสอบเปิดบน Desktop (1920px)<br>2. ทดสอบบน Tablet (768px)<br>3. ทดสอบบน Mobile (375px) | เลย์เอาต์ปรับตัวอัตโนมัติ มี Mobile Drawer สำหรับเมนู และตารางสามารถเลื่อนดูได้ไม่ล้นจอ | Sidebar ปรับเป็น Hamburger Menu บนจอเล็ก ฟอร์มและการ์ดจัดเรียงเป็น 1 คอลัมน์สมบูรณ์ | **PASS** |
| **TC-17** | การกู้คืนรหัสผ่านผ่านระบบอีเมลภายนอก (Forgot Password via SMTP) | 1. ส่งคำขอรีเซ็ตรหัสผ่านไปยังอีเมลภายนอกผ่าน SMTP Server | ผู้ใช้ได้รับอีเมลลิงก์กู้คืนรหัสผ่านจาก Mail Server | ปัจจุบันระบบใช้การเปลี่ยนรหัสผ่านในหน้า Profile ขณะเข้าสู่ระบบ ยังไม่มีการต่อ SMTP ภายนอก | **NOT TESTED** |
| **TC-18** | การทดสอบรองรับปริมาณการใช้งานพร้อมกันสูง (Concurrency Stress Test) | 1. จำลองผู้ใช้งานพร้อมกัน 2,000 Concurrent Requests ด้วยเครื่องมือยิงโหลด | ระบบตอบสนองในเวลาต่ำกว่า 2 วินาทีโดยไม่มี Request หลุด | ยังไม่ได้ทำการทดสอบยิงโหลดขนาดใหญ่ในสภาพแวดล้อม Production (ทดสอบระดับ Functional/Security) | **NOT TESTED** |

---

## 6. หลักฐานประกอบการทดสอบ (Test Evidence)

### 6.1 หลักฐานกฎความปลอดภัย Cloud Firestore Security Rules (Zero-Trust ABAC)
กฎความปลอดภัยถูกออกแบบให้ Deny-by-Default และตรวจสอบสิทธิ์ผ่าน UID จริง:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. ปิดกั้นการเข้าถึงทั้งหมดเป็นค่าเริ่มต้น (Default Deny)
    match /{document=**} {
      allow read, write: if false;
    }

    // 2. ป้องกัน IDOR ในคอลเลกชันงาน (Tasks)
    match /tasks/{taskId} {
      allow get: if isSignedIn() && (existing().ownerUid == request.auth.uid || isAdmin());
      allow list: if isSignedIn() && (resource.data.ownerUid == request.auth.uid || isAdmin());
      allow create: if isSignedIn() && isValidId(taskId) && isValidTask(incoming()) 
                     && incoming().ownerUid == request.auth.uid;
      allow update: if isSignedIn() && isValidTask(incoming()) 
                     && ((existing().ownerUid == request.auth.uid && incoming().ownerUid == existing().ownerUid) || isAdmin());
      allow delete: if isSignedIn() && (existing().ownerUid == request.auth.uid || isAdmin());
    }

    // 3. ป้องกันการเข้าถึงรายชื่อสมาชิกทั้งหมด (ห้าม Student อ่านรายชื่อคนอื่น)
    match /users/{userId} {
      allow get: if isOwner(userId) || isAdmin();
      allow list: if isAdmin(); // Student ไม่สามารถ List สมาชิกได้
      allow create: if isOwner(userId) && isValidUserProfile(incoming()) 
                     && incoming().role == 'student' && incoming().status == 'active';
    }
  }
}
```

### 6.2 หลักฐานฟังก์ชัน Data Masking ป้องกัน Sensitive Data Exposure
```typescript
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) {
    return '***@***.***';
  }
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart.charAt(0)}****@${domain}`;
  }
  const visiblePrefix = localPart.slice(0, 2);
  return `${visiblePrefix}****@${domain}`;
}
```
*ผลลัพธ์การทดสอบ:* อีเมล `student1@demo.edu` แสดงผลเป็น `st****@demo.edu` และ `buddykung2019@gmail.com` แสดงผลเป็น `bu****@gmail.com` ทั้งในตารางและ Modal รายละเอียด

### 6.3 หลักฐานการกรองข้อมูล Injection & URL Validation
```typescript
export function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeText(input: string): string {
  if (!input) return '';
  return input.trim().replace(/[<>]/g, '');
}
```

---

## 7. ปัญหาที่พบและแนวทางแก้ไข (Issues Encountered & Mitigations)

| ลำดับ | ปัญหาที่ตรวจพบ (Issue / Defect) | สาเหตุที่แท้จริง (Root Cause) | แนวทางการแก้ไขและผลลัพธ์ (Mitigation & Result) |
|:---:|---|---|---|
| **1** | การล็อกอินด้วยบัญชีทดสอบในตอนแรกไม่สำเร็จ (แสดงข้อความ "ไม่สามารถเข้าสู่ระบบได้") | 1. โปรเจ็กต์ Firebase ที่สร้างใหม่ยังไม่มีบัญชีทดสอบในระบบ<br>2. ตัวเลือก Email/Password ใน Firebase Console ยังไม่ได้ถูกเปิดใช้งานเป็นค่าเริ่มต้น | ปรับปรุงระบบให้มีการแจ้งเตือนที่ชัดเจน พร้อมลิงก์ตรงไปยังหน้าตั้งค่า Firebase Console และสร้างบัญชีผู้ใช้งานผ่านฟอร์ม Register จริง ทำให้ระบบยืนยันตัวตนสำเร็จ 100% |
| **2** | การค้นหาและสลับการแสดงผลแบบปฏิทินแสดงผลผิดเพี้ยนเมื่อรูปแบบวันที่ไม่ตรงกัน | วันที่จัดเก็บในบาง Record มีทั้ง Date Format (YYYY-MM-DD) และ ISO String | ปรับปรุงให้ฟังก์ชันตัดสตริงเฉพาะส่วนวันเดือนปี (`dueDate.split('T')[0]`) ทำให้ปฏิทินสามารถจับคู่งานและจัดหมวดหมู่งานได้อย่างแม่นยำทุกกรณี |
| **3** | การรีเฟรชหน้าเว็บบน Vercel เกิดข้อผิดพลาด HTTP 404 Not Found | เว็บเป็นแบบ Single Page Application (SPA) เมื่อผู้ใช้กด Refresh ที่ Route ย่อย เว็บเซิร์ฟเวอร์จะหาไฟล์ HTML ไม่พบ | สร้างไฟล์ `vercel.json` กำหนดคำสั่ง `rewrites` ให้ส่งคำขอทั้งหมดกลับมาที่ `/index.html` พร้อมแนบ Security Headers ป้องกัน Clickjacking และ MIME Sniffing |
| **4** | ความเสี่ยงที่นักศึกษาจะส่งสิทธิ์ `role: 'admin'` มาเองในขณะสมัครสมาชิก | ข้อมูลที่ส่งมาจาก Client อาจถูกดัดแปลงผ่าน HTTP Interceptor (เช่น Burp Suite หรือ Postman) | กำหนด Security Rules ในระดับ Cloud Firestore ให้ตรวจสอบว่าเอกสารใหม่ต้องมี `incoming().role == 'student'` เท่านั้น หากเป็นค่าอื่นจะถูกปฏิเสธทันที |

---

## 8. สรุปผลการทดสอบ (Summary of Results)

จากการทดสอบระบบ **StudentHub** ตามแผนการทดสอบทั้งหมด ผลลัพธ์สรุปได้ดังนี้:

### 8.1 สถิติผลการทดสอบ (Test Statistics)
- **จำนวน Test Cases ทั้งหมด:** 18 กรณี
- **ผ่านการทดสอบ (PASS):** 16 กรณี (**88.89%** ของเคสทั้งหมด / **100%** ของเคสที่อยู่ในขอบเขตหลัก)
- **ไม่ผ่านการทดสอบ (FAIL):** 0 กรณี (**0.00%**)
- **ติดขัด/ระงับชั่วคราว (BLOCKED):** 0 กรณี (**0.00%**)
- **ยังไม่ได้ทดสอบ (NOT TESTED):** 2 กรณี (**11.11%** ได้แก่ การส่งอีเมล Forgot Password ผ่าน SMTP จริง และ Load Stress Testing ระดับองค์กร)

### 8.2 สรุปความเห็นของผู้ประเมินระบบ
ระบบ **StudentHub** ผ่านเกณฑ์การประเมินทั้งในแง่ของฟังก์ชันการใช้งาน ความถูกต้องของข้อมูลบนฐานข้อมูลจริง และมาตรการด้านความปลอดภัยตามมาตรฐานสากล OWASP:
1. ข้อมูลทั้งหมดถูกจัดเก็บบน **Cloud Firestore (Project ID: `studenthub-62716`)** จริง ไม่มีการใช้ LocalStorage หรือ Mock Data แทนฐานข้อมูล
2. ระบบป้องกันช่องโหว่ **IDOR** และ **Privilege Escalation** ได้อย่างสมบูรณ์แบบด้วย Cloud Firestore Security Rules
3. มีการปกปิดข้อมูลส่วนบุคคล (**Data Masking**) อย่างสม่ำเสมอในทุกจุดที่เกี่ยวข้อง
4. ระบบมีความพร้อมสำหรับการนำไปใช้งานจริง (Production Readiness) และสามารถ Deploy ขึ้น **Vercel** ได้ทันทีโดยไม่พบปัญหา SPA Routing

---
*ลงชื่อผู้ทดสอบและจัดทำรายงาน*  
**ทีมพัฒนาระบบ StudentHub**  
วิชา Web Application Development and Security Testing
