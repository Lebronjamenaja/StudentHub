# TEST_PLAN.md — แผนการทดสอบระบบและผลการทดสอบ
## ระบบ StudentHub — Student Assignment and Task Management System

เอกสารนี้รวบรวมแผนการทดสอบระบบและผลการทดสอบจริง (Security & Functionality Verification) เพื่อใช้ประกอบโปรเจ็กต์วิชา Web Application Development และ Security Testing

---

### ตารางสรุปผลการทดสอบ (Test Summary Matrix)

| Test Case ID | หัวข้อการทดสอบ | ประเภท | ผลการทดสอบ (Status) |
|---|---|---|---|
| **TC-01** | สมัครสมาชิก (Register) ด้วยข้อมูลที่ถูกต้อง | Functionality / Auth | **PASS** |
| **TC-02** | สมัครสมาชิก (Register) ด้วยข้อมูลไม่ถูกต้อง / อีเมลซ้ำ / รหัสผ่านสั้น | Validation / Auth | **PASS** |
| **TC-03** | เข้าสู่ระบบ (Login) และออกจากระบบ (Logout) | Functionality / Session | **PASS** |
| **TC-04** | เพิ่ม อ่าน แก้ไข และลบงาน (CRUD Operations) | Functionality / Firestore | **PASS** |
| **TC-05** | ส่งงาน (Assignment Submission) และบันทึกลิงก์ | Functionality / Form | **PASS** |
| **TC-06** | ส่งข้อเสนอแนะและแจ้งปัญหา (Feedback Submission) | Functionality / Form | **PASS** |
| **TC-07** | ตรวจสอบการปกปิดข้อมูลส่วนบุคคล (Email Data Masking) | Security / Privacy | **PASS** |
| **TC-08** | ทดสอบการป้องกัน IDOR (พยายามอ่าน/แก้ไขงานของผู้อื่น) | Security / OWASP A01 | **PASS** |
| **TC-09** | ทดสอบการป้องกัน Privilege Escalation (พยายามเข้าหน้า Admin) | Security / OWASP A01 | **PASS** |
| **TC-10** | ทดสอบการส่ง Payload Cross-Site Scripting (XSS Injections) | Security / OWASP A03 | **PASS** |
| **TC-11** | ทดสอบการส่ง Payload SQL Injection (SQLi Patterns) | Security / OWASP A03 | **PASS** |
| **TC-12** | ตรวจสอบ Input Validation และ Error Handling ไม่เปิดเผยข้อมูลภายใน | Security / Error Guard | **PASS** |

---

### รายละเอียดผลการทดสอบแต่ละกรณี (Detailed Test Cases)

#### TC-01: สมัครสมาชิกด้วยข้อมูลถูกต้อง
- **วัตถุประสงค์**: ตรวจสอบว่านักศึกษาสามารถสมัครสมาชิกใหม่ได้สำเร็จ และได้รับบทบาท Student โดยอัตโนมัติ
- **ขั้นตอนการทดสอบ**:
  1. ไปที่หน้า `/register`
  2. กรอกชื่อ-นามสกุล: `สมชาย ใจดี`
  3. กรอกอีเมล: `student.test@university.ac.th`
  4. กรอกรหัสผ่าน: `Password123!` และยืนยันรหัสผ่านตรงกัน
  5. กดปุ่ม "สมัครสมาชิก"
- **Expected Result**: บัญชีถูกสร้างใน Firebase Authentication, เอกสารถูกเขียนลง Firestore `/users/{uid}` ด้วย `role: 'student'`, `status: 'active'`, และระบบพาไปยังหน้า Dashboard อัตโนมัติ
- **Actual Result**: ระบบสร้างบัญชีสำเร็จ บันทึกลงคอลเลกชัน `users` พร้อม `role: 'student'` แสดง Toast แจ้งเตือนสีเขียว และนำทางเข้าสู่ Dashboard
- **Status**: **PASS**
- **หลักฐานประกอบ**: รหัสผ่านถูกแฮชและจัดการโดย Firebase Auth ไม่มีการจัดเก็บรหัสผ่านเป็น Plaintext ใน Firestore และตรวจสอบ `userProfile.role === 'student'`

---

#### TC-02: สมัครสมาชิกด้วยข้อมูลไม่ถูกต้อง
- **วัตถุประสงค์**: ตรวจสอบการปฏิเสธข้อมูลที่ไม่ถูกต้อง รหัสผ่านสั้น หรืออีเมลผิดรูปแบบ
- **ขั้นตอนการทดสอบ**:
  1. ไปที่หน้า `/register`
  2. ทดสอบกรอกรหัสผ่านน้อยกว่า 6 ตัวอักษร เช่น `12345`
  3. ทดสอบกรอกรหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน
  4. ทดสอบสมัครด้วยอีเมลที่มีผู้ใช้งานแล้วในระบบ
- **Expected Result**: ระบบปฏิเสธการส่งฟอร์ม แสดงข้อความแจ้งเตือนภาษาไทยที่เข้าใจง่าย ไม่แสดง Stack Trace
- **Actual Result**: แสดงข้อความเตือน "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" และ "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน" ตามลำดับ เมื่ออีเมลซ้ำแสดง "อีเมลนี้ถูกใช้งานในระบบแล้ว"
- **Status**: **PASS**
- **หลักฐานประกอบ**: Client-side validation ทำงานร่วมกับ Firebase Auth Error Code Mapping อย่างแม่นยำ

---

#### TC-03: เข้าสู่ระบบและออกจากระบบ
- **วัตถุประสงค์**: ตรวจสอบการจัดการ Session และความถูกต้องของกระบวนการ Authentication
- **ขั้นตอนการทดสอบ**:
  1. ไปที่หน้า `/login`
  2. กรอกอีเมลและรหัสผ่านที่ถูกต้อง
  3. ตรวจสอบการเข้าถึงหน้า Dashboard
  4. กดปุ่ม "ออกจากระบบ (Logout)" ที่เมนูโปรไฟล์
  5. พยายามเปิดหน้า Dashboard ซ้ำ
- **Expected Result**: เมื่อ Login ผ่าน จะเข้าสู่ Dashboard ได้ เมื่อ Logout แล้ว Session ถูกทำลาย และไม่สามารถเข้าถึงหน้าภายในได้ โดยจะถูก Redirect กลับไปหน้า Login
- **Actual Result**: Firebase Auth `onAuthStateChanged` สลับสถานะได้ถูกต้อง เมื่อ Logout ข้อมูล Profile ถูกเคลียร์ และ Auth Guard นำทางกลับหน้า `/login`
- **Status**: **PASS**
- **หลักฐานประกอบ**: ตรวจสอบสถานะ `currentUser === null` และ Redirect อัตโนมัติ

---

#### TC-04: เพิ่ม อ่าน แก้ไข และลบงาน (CRUD Operations)
- **วัตถุประสงค์**: ตรวจสอบการทำงานของฟังก์ชันจัดการงานของนักศึกษาใน Cloud Firestore
- **ขั้นตอนการทดสอบ**:
  1. กดปุ่ม "เพิ่มงานใหม่" กรอกชื่องาน `โครงงาน Web App`, วิชา `CS301`, กำหนดส่ง, ความสำคัญ `High`
  2. ตรวจสอบงานที่ปรากฏในหน้ารายการ (My Tasks) และบน Calendar View
  3. กดดูรายละเอียดงาน (Task Details)
  4. กดแก้ไขงาน เปลี่ยนสถานะเป็น `In Progress`
  5. กดปุ่มลบงาน และกดยืนยันใน ConfirmDialog
- **Expected Result**: ข้อมูลถูกสร้าง (Create), อ่าน (Read), แก้ไข (Update) และลบ (Delete) ออกจาก Firestore จริง และมี Modal ยืนยันก่อนลบเสมอ
- **Actual Result**: เอกสารถูกจัดการใน Firestore collection `tasks` แบบเรียลไทม์ผ่าน snapshot listener และ ConfirmDialog ป้องกันการลบโดยไม่ตั้งใจได้ 100%
- **Status**: **PASS**
- **หลักฐานประกอบ**: ทุกการเปลี่ยนแปลงมีการเรียก `setDoc`, `updateDoc`, `deleteDoc` และจัดการข้อผิดพลาดผ่าน `handleFirestoreError`

---

#### TC-05: ส่งงาน (Assignment Submission) และบันทึกข้อมูล
- **วัตถุประสงค์**: ตรวจสอบ Form 2 ในการส่ง URL การบ้านและข้อความประกอบ
- **ขั้นตอนการทดสอบ**:
  1. ไปที่หน้า "ส่งงาน" (`/submit`)
  2. เลือกงานที่ต้องการส่ง
  3. กรอก URL แหล่งเก็บงาน เช่น `https://github.com/student/web-project`
  4. กรอกข้อความประกอบการส่ง
  5. ทดสอบกรอก URL ที่ผิดรูปแบบ เช่น `not-a-valid-url`
  6. กรอก URL ที่ถูกต้องแล้วกดยืนยันการส่ง
- **Expected Result**: ระบบปฏิเสธ URL ที่ผิดรูปแบบ และเมื่อกรอก URL ที่ถูกต้อง จะบันทึก URL, เวลาที่ส่ง (`submittedAt`), ปรับสถานะงานเป็น `Completed`
- **Actual Result**: ฟังก์ชัน `isValidHttpUrl` ตรวจสอบโปรโตคอล http/https ได้ถูกต้อง เมื่อส่งสำเร็จ สถานะงานเปลี่ยนเป็น Completed และแสดงผลในหน้า Task Details
- **Status**: **PASS**
- **หลักฐานประกอบ**: ฟิลด์ `submissionUrl`, `submissionNote`, `submittedAt` ถูกบันทึกลง Firestore พร้อมตราสัญลักษณ์ "ส่งแล้ว"

---

#### TC-06: ส่งข้อเสนอแนะและแจ้งปัญหา (Feedback)
- **วัตถุประสงค์**: ตรวจสอบ Form 3 ในการส่งความคิดเห็นและแจ้งบั๊ก
- **ขั้นตอนการทดสอบ**:
  1. ไปที่หน้า "ส่งข้อเสนอแนะ" (`/feedback`)
  2. เลือกหมวดหมู่ `bug`
  3. กรอกหัวข้อ `ปุ่มบันทึกทำงานล่าช้า`
  4. กรอกรายละเอียดขั้นตอนที่ทำให้เกิดปัญหา
  5. กดปุ่ม "ส่งข้อเสนอแนะ"
- **Expected Result**: บันทึกลงคอลเลกชัน `feedbacks` ใน Firestore โดยระบุ `userUid` ของผู้ใช้ และ Masking อีเมลก่อนบันทึก
- **Actual Result**: บันทึกข้อมูลสำเร็จ เอกสารปรากฏในประวัติข้อเสนอแนะของนักศึกษา และปรากฏในแผงควบคุมของ Admin
- **Status**: **PASS**
- **หลักฐานประกอบ**: Firestore document มีฟิลด์ `userEmailMasked` ป้องกันการรั่วไหลของอีเมลส่วนบุคคล

---

#### TC-07: ตรวจสอบการ Masking อีเมล (Data Masking)
- **วัตถุประสงค์**: ตรวจสอบว่าในหน้า Admin และตารางต่าง ๆ ไม่มีการเปิดเผยอีเมลตัวเต็มของนักศึกษา
- **ขั้นตอนการทดสอบ**:
  1. เข้าสู่ระบบด้วยบัญชี Admin
  2. ไปที่หน้า "จัดการสมาชิก & ผู้ใช้" (`/admin/users`)
  3. สังเกตคอลัมน์อีเมลในตาราง และใน Modal รายละเอียดสมาชิก
- **Expected Result**: อีเมลแสดงผลในรูปแบบ `st****@domain.com` หรือ `bu****@gmail.com`
- **Actual Result**: ฟังก์ชัน `maskEmail` ทำงานกับอีเมลทุกแถว โดยซ่อนตัวอักษรระหว่างต้นและโดเมนด้วย `****` ป้องกัน Shoulder Surfing และ Sensitive Data Exposure
- **Status**: **PASS**
- **หลักฐานประกอบ**: รหัสผ่านไม่ปรากฏ และอีเมลถูก Masking อย่างสม่ำเสมอทั้งตารางสมาชิกและตาราง Feedback

---

#### TC-08: ทดสอบการป้องกัน IDOR (Insecure Direct Object References)
- **วัตถุประสงค์**: ทดสอบว่านักศึกษา A ไม่สามารถอ่าน แก้ไข หรือลบงานของนักศึกษา B ได้ แม้จะทราบ Task ID
- **ขั้นตอนการทดสอบ**:
  1. นักศึกษา B สร้างงานขึ้นมา 1 งาน (Task ID: `task_victim_01`)
  2. นักศึกษา A ทำการ Login เข้าสู่ระบบ
  3. นักศึกษา A พยายามส่ง Request อ่านงาน `tasks/task_victim_01` หรือเปลี่ยน URL Hash เป็น `#/tasks/task_victim_01`
  4. นักศึกษา A ส่ง Payload พยายามอัปเดตหรือลบเอกสารดังกล่าว
- **Expected Result**: Cloud Firestore Security Rules บล็อกคำขอทันทีด้วยข้อผิดพลาด `PERMISSION_DENIED` เนื่องจาก `resource.data.ownerUid != request.auth.uid`
- **Actual Result**: ระบบแสดงข้อความ "ไม่พบข้อมูลงานที่ต้องการ หรือคุณไม่มีสิทธิ์เข้าถึง" และ Firestore ปฏิเสธคำขออ่าน/เขียน
- **Status**: **PASS**
- **หลักฐานประกอบ**: กฎความปลอดภัย `match /tasks/{taskId}` กำหนดเงื่อนไข `existing().ownerUid == request.auth.uid || isAdmin()`

---

#### TC-09: ทดสอบการป้องกัน Privilege Escalation (พยายามเข้าหน้า Admin)
- **วัตถุประสงค์**: ตรวจสอบว่านักศึกษาทั่วไปไม่สามารถเข้าถึงหน้า Admin หรือฟังก์ชันผู้ดูแลได้
- **ขั้นตอนการทดสอบ**:
  1. เข้าสู่ระบบด้วยบัญชีบทบาท Student
  2. พยายามพิมพ์ URL Hash โดยตรงเป็น `#/admin-dashboard` หรือ `#/admin-users`
  3. ตรวจสอบว่ามีแถบเมนู Admin แสดงหรือไม่
- **Expected Result**: เมนู Admin ถูกซ่อน และหากพยายามเข้าถึงโดยตรง ระบบจะสกัดกั้นและนำทางไปยังหน้า `403 Forbidden` ทันที
- **Actual Result**: ระบบตัดสิทธิ์และแสดงหน้า **HTTP 403 — ACCESS FORBIDDEN** อธิบายสาเหตุทางความปลอดภัยชัดเจน
- **Status**: **PASS**
- **หลักฐานประกอบ**: ตรวจสอบทั้ง Router Guard และ Firestore Rules (`match /users/{userId} { allow list: if isAdmin(); }`)

---

#### TC-10: ทดสอบการส่ง Payload Cross-Site Scripting (XSS)
- **วัตถุประสงค์**: ทดสอบการป้องกันการฉีดโค้ด JavaScript อันตรายลงในฟิลด์ข้อความ
- **ขั้นตอนการทดสอบ**:
  1. ในฟอร์มเพิ่มงาน กรอกชื่องานเป็น `<script>alert('XSS')</script>`
  2. กรอกคำอธิบายเป็น `<img src=x onerror=alert(document.cookie)>`
  3. บันทึกและดูผลการแสดงผลในหน้ารายละเอียดและตาราง
- **Expected Result**: สคริปต์ไม่ถูกรัน ฟังก์ชัน `sanitizeText` กรองแท็ก `<>` ออก และ React ทำการ Escape ข้อมูลก่อน Render สู่ DOM อัตโนมัติ
- **Actual Result**: สคริปต์ไม่ถูกประมวลผล แสดงผลเป็นข้อความตัวหนังสือธรรมดา ไม่มี Alert เด้งขึ้นมา
- **Status**: **PASS**
- **หลักฐานประกอบ**: React JSX Auto-Escaping ร่วมกับ `sanitizeText` ป้องกันการโจมตี Stored XSS ได้สมบูรณ์

---

#### TC-11: ทดสอบการส่ง Payload SQL Injection (SQLi)
- **วัตถุประสงค์**: ทดสอบการส่งข้อความที่มีรูปแบบ SQL Injection ในช่องค้นหาและฟอร์ม
- **ขั้นตอนการทดสอบ**:
  1. ในช่องค้นหางาน กรอก `' OR '1'='1` หรือ `admin' --` หรือ `UNION SELECT * FROM users`
  2. ในฟอร์มส่งงานและฟอร์ม Feedback กรอกสตริง SQL ดังกล่าว
- **Expected Result**: ระบบไม่พัง การค้นหาทำงานแบบ Exact Substring Matching และ Firestore ใช้ NoSQL Document Reference Model ซึ่งไม่มี SQL Interpreter
- **Actual Result**: ข้อมูลถูกค้นหาอย่างปลอดภัย ไม่มีข้อผิดพลาดทางไวยากรณ์ ไม่มีการรั่วไหลของข้อมูลตารางอื่น
- **Status**: **PASS**
- **หลักฐานประกอบ**: Cloud Firestore SDK เป็น Parameterized NoSQL API ไม่ได้รับผลกระทบจาก SQL Syntax Injection

---

#### TC-12: ตรวจสอบ Input Validation และ Error Handling
- **วัตถุประสงค์**: ตรวจสอบว่าระบบมี Error Message ที่เป็นมิตร และไม่เปิดเผยข้อมูลโครงสร้างภายใน
- **ขั้นตอนการทดสอบ**:
  1. ทดสอบส่งข้อมูลที่เกินขีดจำกัด (เช่น ชื่องานเกิน 200 ตัวอักษร)
  2. ทดสอบกรอกรหัสผ่านผิดซ้ำหลายครั้ง
- **Expected Result**: แสดง Error Message ภาษาไทยที่กระชับ ชัดเจน ไม่แสดง Stack Trace, API Key, หรือ Database Schema สู่ผู้ใช้
- **Actual Result**: ทุกข้อผิดพลาดถูกแปลงเป็นข้อความภาษาไทยสุภาพ ปลอดภัย และบันทึก Log เฉพาะที่จำเป็น
- **Status**: **PASS**
- **หลักฐานประกอบ**: ฟังก์ชัน `handleFirestoreError` และการจัดการ Error ใน `AuthContext.tsx`
