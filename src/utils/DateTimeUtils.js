/*
 * @flow
 */

import differenceInYears from 'date-fns/difference_in_years';
import format from 'date-fns/format';
import isValid from 'date-fns/is_valid';

import { isNonEmptyString } from './LangUtils';

const DATE_MDY_SLASH_FORMAT :string = 'MM/DD/YYYY';
const ISO_DATE_FORMAT :string = 'YYYY-MM-DD';
const ISO_TIME_HMS_FORMAT :string = 'HH:mm:ss';
const TIME_HM_FORMAT :string = 'HH:mm';

function isValidDateTimeString(value :string) :boolean {

  if (isNonEmptyString(value)) {
    const valueAsDate :Date = new Date(value);
    return isValid(valueAsDate);
  }

  return false;
}

function formatAsDate(value :string) :string {

  if (isValidDateTimeString(value)) {
    return format(value, DATE_MDY_SLASH_FORMAT);
  }
  return '';
}

function formatAsISODate(value :string) :string {

  if (isValidDateTimeString(value)) {
    return format(value, ISO_DATE_FORMAT);
  }
  return '';
}

function formatAsTime(value :string) :string {

  if (isValidDateTimeString(value)) {
    return format(value, TIME_HM_FORMAT);
  }
  return '';
}

function formatAsISOTime(value :string) :string {

  if (isValidDateTimeString(value)) {
    return format(value, ISO_TIME_HMS_FORMAT);
  }
  return '';
}

function calculateAge(dateOfBirth :string) :number {

  if (isValidDateTimeString(dateOfBirth)) {
    return differenceInYears(new Date(), dateOfBirth);
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
