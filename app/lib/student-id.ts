export function studentIdFor(email: string) {
  let hash = 0;
  for (const character of email.trim().toLowerCase()) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return `student_${Math.abs(hash)}`;
}
