/*
 * @flow
 */

import { DateTime } from 'luxon';

import { isNonEmptyString } from './LangUtils';

const DATE_MDY_SLASH_FORMAT :string = 'MM/DD/YYYY';
const ISO_DATE_FORMAT :string = 'YYYY-MM-DD';
const ISO_TIME_HMS_FORMAT :string = 'HH:mm:ss';
const TIME_HM_FORMAT :string = 'HH:mm';

function isValidDateTimeString(value :string) :boolean {

  if (isNonEmptyString(value)) {
    const valueAsDate = DateTime.fromISO(value);
    return valueAsDate.isValid;
  }
  return false;
}

function formatAsDate(value :string) :string {

  if (isValidDateTimeString(value)) {
    const valueAsDate = DateTime.fromISO(value);
    return valueAsDate.toLocaleString(DateTime.DATE_SHORT);
  }
  return '';
}

function formatAsISODate(value :string) :string {

  if (isValidDateTimeString(value)) {
    const valueAsDate = DateTime.fromISO(value);
    return valueAsDate.toISODate();
  }
  return '';
}

function formatAsTime(value :string) :string {

  if (isValidDateTimeString(value)) {
    const valueAsDate = DateTime.fromISO(value);
    return valueAsDate.toLocaleString(DateTime.TIME_24_SIMPLE);
  }
  return '';
}

function formatAsISOTime(value :string) :string {

  if (isValidDateTimeString(value)) {
    const valueAsDate = DateTime.fromISO(value);
    return valueAsDate.toISOTime();
  }
  return '';
}

function calculateAge(dateOfBirth :string) :number {

  if (isValidDateTimeString(dateOfBirth)) {
    const valueAsDate = DateTime.fromISO(dateOfBirth);
    return valueAsDate.diffNow('years').years;
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
  isValidDateTimeString,
};
