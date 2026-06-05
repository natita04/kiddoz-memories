interface ZodiacSign {
  en: string;
  he: string;
  emoji: string;
}

export function getZodiacSign(birthdate: string): ZodiacSign {
  const date = new Date(birthdate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return { en: "Capricorn", he: "גדי", emoji: "♑" };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return { en: "Aquarius", he: "דלי", emoji: "♒" };
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20))
    return { en: "Pisces", he: "דגים", emoji: "♓" };
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
    return { en: "Aries", he: "טלה", emoji: "♈" };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
    return { en: "Taurus", he: "שור", emoji: "♉" };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
    return { en: "Gemini", he: "תאומים", emoji: "♊" };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
    return { en: "Cancer", he: "סרטן", emoji: "♋" };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22))
    return { en: "Leo", he: "אריה", emoji: "♌" };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
    return { en: "Virgo", he: "בתולה", emoji: "♍" };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
    return { en: "Libra", he: "מאזניים", emoji: "♎" };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return { en: "Scorpio", he: "עקרב", emoji: "♏" };
  return { en: "Sagittarius", he: "קשת", emoji: "♐" };
}

export function getAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function isHebrew(text: string): boolean {
  return /[֐-׿]/.test(text);
}

export function getAgeAtDate(birthdate: string, targetDate: string): string {
  const birth = new Date(birthdate);
  const target = new Date(targetDate);

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  const dayDiff = target.getDate() - birth.getDate();

  // Birthday hasn't occurred yet this month — subtract a month
  if (dayDiff < 0) months--;
  // Months went negative — borrow a year
  if (months < 0) { years--; months += 12; }
  if (years < 0) return "";

  if (years === 0 && months === 0) return "< 1m";
  if (years === 0) return `${months}m`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}m`;
}
