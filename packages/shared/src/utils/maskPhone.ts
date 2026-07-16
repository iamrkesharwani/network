export const maskPhoneNumber = (number: string): string => {
  if (number.length <= 2) return number;
  const visible = number.slice(-2);
  return `${'*'.repeat(number.length - 2)}${visible}`;
};
