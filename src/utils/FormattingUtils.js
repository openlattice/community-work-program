// @flow

export function formatValue(rawValue :string | string[]) :string {
  if (!rawValue || (!rawValue.length)) return '';
  if (typeof rawValue === 'string') {
    return rawValue || '';
  }
  return rawValue.join(', ');
}

export function formatNumericalValue(rawValue :number) :string {
  if (!rawValue === undefined) return '';
  return (rawValue).toString();
}

export const formatPhoneNumber = (rawValue :string) => {
  if (!rawValue === undefined) return '';
  const cleaned = (rawValue).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  const matchPlusOne = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  if (matchPlusOne) {
    return `(${matchPlusOne[2]}) ${matchPlusOne[3]}-${matchPlusOne[4]}`;
  }
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return null;
};
