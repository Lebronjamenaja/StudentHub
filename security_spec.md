# Security Specification & Threat Model
## StudentHub — Student Assignment and Task Management System

### 1. Data Invariants
1. **Zero-Trust Identity**: `ownerUid` on `/tasks/{taskId}` and `uid` on `/users/{userId}` MUST strictly match the authenticated user (`request.auth.uid`). Users can NEVER impersonate another user.
2. **Default Student Privilege**: Self-registration MUST strictly assign `role: 'student'` and `status: 'active'`. A user cannot self-assign `role: 'admin'`.
3. **Privilege Escalation Protection**: An ordinary student CANNOT modify their own `role` or `status`, nor can they modify another user's profile.
4. **Admin Verification**: Administrative access is determined exclusively through trusted database verification:
   - Presence in `/admins/$(request.auth.uid)` OR matching verified administrator email (`buddykung2019@gmail.com` with `email_verified == true`).
5. **Ownership Isolation (IDOR Defense)**: Students can ONLY read, update, or delete tasks where `resource.data.ownerUid == request.auth.uid`. Students cannot read or list another student's tasks.
6. **Query Enforcer**: Collection queries (`list`) on `/tasks` MUST enforce `resource.data.ownerUid == request.auth.uid` unless the requester is a verified Admin.
7. **PII Masking & Access Control**: Profile emails and student identifiers are strictly guarded at the Firestore layer. Only the profile owner or verified Admins can read `/users/{userId}`.
8. **Feedback Accountability**: Users can only create feedback tagged with their own `userUid`. Once submitted, feedback is read-only for students and triageable by admins.

---

### 2. The "Dirty Dozen" Threat Payloads (Must be Denied by Rules)

1. **Payload 1 (IDOR Read Attack)**:
   - *Target*: `GET /tasks/victim_task_999`
   - *Attacker*: Authenticated Student `attacker_uid_1`
   - *Expected*: `PERMISSION_DENIED`
2. **Payload 2 (IDOR Update/Hijack Attack)**:
   - *Target*: `UPDATE /tasks/victim_task_999`
   - *Payload*: `{"title": "Hacked Title", "ownerUid": "victim_uid_2"}`
   - *Expected*: `PERMISSION_DENIED`
3. **Payload 3 (IDOR Delete Attack)**:
   - *Target*: `DELETE /tasks/victim_task_999`
   - *Attacker*: Authenticated Student `attacker_uid_1`
   - *Expected*: `PERMISSION_DENIED`
4. **Payload 4 (Privilege Escalation on Register)**:
   - *Target*: `CREATE /users/attacker_uid_1`
   - *Payload*: `{"uid": "attacker_uid_1", "role": "admin", "displayName": "Attacker", "status": "active", "email": "evil@test.com"}`
   - *Expected*: `PERMISSION_DENIED` (role must be 'student')
5. **Payload 5 (Role Tampering via Update)**:
   - *Target*: `UPDATE /users/attacker_uid_1`
   - *Payload*: `{"role": "admin"}`
   - *Expected*: `PERMISSION_DENIED` (users cannot change their own role)
6. **Payload 6 (Admin Collection Self-Provisioning)**:
   - *Target*: `CREATE /admins/attacker_uid_1`
   - *Payload*: `{"uid": "attacker_uid_1", "email": "attacker@test.com"}`
   - *Expected*: `PERMISSION_DENIED`
7. **Payload 7 (Ghost / Shadow Fields Injection)**:
   - *Target*: `CREATE /tasks/task_evil_1`
   - *Payload*: `{"id": "task_evil_1", "ownerUid": "attacker_uid_1", "title": "Test", "subject": "CS101", "dueDate": "2026-12-31", "priority": "High", "status": "Pending", "isBackdoorActive": true}`
   - *Expected*: `PERMISSION_DENIED` (keys not allowed)
8. **Payload 8 (Large Payload / Denial of Wallet Attack)**:
   - *Target*: `CREATE /tasks/task_huge_1`
   - *Payload*: `{"id": "task_huge_1", "ownerUid": "attacker_uid_1", "title": "A".repeat(5000), "subject": "CS101", "dueDate": "2026-12-31", "priority": "High", "status": "Pending"}`
   - *Expected*: `PERMISSION_DENIED` (exceeds maxLength)
9. **Payload 9 (Unauthenticated Anonymous Task Probe)**:
   - *Target*: `GET /tasks/task_123`
   - *Attacker*: Unauthenticated (`auth == null`)
   - *Expected*: `PERMISSION_DENIED`
10. **Payload 10 (Feedback Spoofing Other User's Identity)**:
    - *Target*: `CREATE /feedbacks/fb_spoof_1`
    - *Payload*: `{"id": "fb_spoof_1", "userUid": "victim_uid_2", "title": "Bug", "category": "bug", "details": "Fake report"}`
    - *Expected*: `PERMISSION_DENIED` (`userUid` does not match `request.auth.uid`)
11. **Payload 11 (Student Attempting to Read All User Records)**:
    - *Target*: `LIST /users`
    - *Attacker*: Authenticated Student `attacker_uid_1`
    - *Expected*: `PERMISSION_DENIED` (Students can only get their own `/users/$(request.auth.uid)`)
12. **Payload 12 (Task Ownership Reassignment on Update)**:
    - *Target*: `UPDATE /tasks/my_task_1`
    - *Payload*: `{"ownerUid": "another_user_456"}`
    - *Expected*: `PERMISSION_DENIED` (`ownerUid` is immutable)
