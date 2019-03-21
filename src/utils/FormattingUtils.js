// @flow
import moment from 'moment';

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

export function formatDate(dateString :string, optionalFormat :?string) :string {
  if (!dateString) return '';
  const date = moment(dateString);
  if (!date || !date.isValid()) return dateString;
  const format = optionalFormat || 'MM/DD/YYYY';
  return date.format(format);
}

export function formatDateList(dateList :string[], optionalFormat :?string) :string {
  if (!dateList || (!dateList.length)) return '';
  return dateList.map(dateString => formatDate(dateString, optionalFormat)).join(', ');
}
