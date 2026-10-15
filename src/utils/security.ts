/**
 * Security and Data Masking Utilities
 * Follows OWASP recommendations for Sensitive Data Exposure prevention
 */

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
  return input
    .trim()
    .replace(/[<>]/g, ''); // Basic defense-in-depth against raw HTML injections in UI
}

export function validatePasswordStrength(password: string): {
  score: number; // 0 to 4
  label: string;
  color: string;
  isValid: boolean;
} {
  let score = 0;
  if (!password || password.length < 6) {
    return { score: 0, label: 'สั้นเกินไป (อย่างน้อย 6 ตัวอักษร)', color: 'text-rose-500', isValid: false };
  }
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { score: 1, label: 'รหัสผ่านระดับง่าย', color: 'text-amber-500', isValid: true };
  } else if (score <= 3) {
    return { score: 2, label: 'รหัสผ่านปานกลาง', color: 'text-blue-400', isValid: true };
  } else {
    return { score: 4, label: 'รหัสผ่านปลอดภัยสูง', color: 'text-emerald-400', isValid: true };
  }
}

/**
 * Format date for Thai users with Buddhist Era (พ.ศ.) or standard readable format
 */
export function formatThaiDate(dateString: string | undefined, includeTime: boolean = false): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const yearBE = date.getFullYear() + 543;

    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${yearBE} เวลา ${hours}:${minutes} น.`;
    }

    return `${day} ${month} ${yearBE}`;
  } catch {
    return dateString;
  }
}

export function getTaskUrgency(dueDateString: string, status: string): {
  isOverdue: boolean;
  isUrgent: boolean;
  daysRemaining: number;
  badgeLabel: string;
  badgeColor: string;
} {
  if (status === 'Completed') {
    return {
      isOverdue: false,
      isUrgent: false,
      daysRemaining: 0,
      badgeLabel: 'ส่งแล้ว',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    };
  }

  const now = new Date();
  const due = new Date(dueDateString);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isOverdue: true,
      isUrgent: false,
      daysRemaining: diffDays,
      badgeLabel: `เกินกำหนด ${Math.abs(diffDays)} วัน`,
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    };
  } else if (diffDays === 0) {
    return {
      isOverdue: false,
      isUrgent: true,
      daysRemaining: 0,
      badgeLabel: 'ครบกำหนดวันนี้!',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    };
  } else if (diffDays <= 3) {
    return {
      isOverdue: false,
      isUrgent: true,
      daysRemaining: diffDays,
      badgeLabel: `เหลืออีก ${diffDays} วัน`,
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    };
  } else {
    return {
      isOverdue: false,
      isUrgent: false,
      daysRemaining: diffDays,
      badgeLabel: `เหลืออีก ${diffDays} วัน`,
      badgeColor: 'bg-slate-700/50 text-slate-300 border-slate-600/40'
    };
  }
}
