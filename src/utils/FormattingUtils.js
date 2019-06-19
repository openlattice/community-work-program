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
