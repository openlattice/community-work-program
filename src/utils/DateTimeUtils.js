/*
 * @flow
 */

import { DateTime } from 'luxon';

const DATE_MDY_SLASH_FORMAT :string = 'MM/DD/YYYY';
const ISO_DATE_FORMAT :string = 'YYYY-MM-DD';
const ISO_TIME_HMS_FORMAT :string = 'HH:mm:ss';
const TIME_HM_FORMAT :string = 'HH:mm';

function formatAsDate(value :string) :string {

  const valueAsDate = DateTime.fromISO(value);
  if (valueAsDate.isValid) {
    return valueAsDate.toLocaleString(DateTime.DATE_SHORT);
  }
  return '';
}

function formatAsISODate(value :string) :string {

  const valueAsDateTime = DateTime.fromISO(value);
  if (valueAsDateTime.isValid) {
    return valueAsDateTime.toISODate();
  }
  return '';
}

function formatAsTime(value :string) :string {

  const valueAsTime = DateTime.fromISO(value);
  if (valueAsTime.isValid) {
    return valueAsTime.toLocaleString(DateTime.TIME_24_SIMPLE);
  }
  return '';
}

function formatAsISOTime(value :string) :string {

  const valueAsTime = DateTime.fromISO(value);
  if (valueAsTime.isValid) {
    return valueAsTime.toISOTime();
  }
  return '';
}

function calculateAge(dateOfBirth :string) :number {

  const valueAsDate = DateTime.fromISO(dateOfBirth);
  if (valueAsDate.isValid) {
    const now = DateTime.local();
    return now.diff(valueAsDate, 'years').toFormat('y');
  }
  return -1;
}

export {
  DATE_MDY_SLASH_FORMAT,
  ISO_DATE_FORMAT,
  ISO_TIME_HMS_FORMAT,
  TIME_HM_FORMAT,
  calculateAge,
  formatAsDate,
  formatAsISODate,
  formatAsISOTime,
  formatAsTime,
};
