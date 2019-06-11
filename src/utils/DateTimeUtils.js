/*
 * @flow
 */

import { DateTime, Duration } from 'luxon';
import { Map } from 'immutable';
import { SENTENCE_FQNS } from '../core/edm/constants/FullyQualifiedNames';

const {
  INCARCERATION_YEARS,
  INCARCERATION_MONTHS,
  INCARCERATION_DAYS
} = SENTENCE_FQNS;

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

function calculateAge(value :string) :number {

  const dateOfBirth = DateTime.fromISO(value);
  if (dateOfBirth.isValid) {
    const age = dateOfBirth
      .until(DateTime.local())
      .toDuration(['years', 'months', 'days', 'hours']);
    return age.years;
  }
  return -1;
}

function convertSentenceToHours(sentence :Map) :number {

  const duration = Duration.fromObject({
    years: sentence.getIn([INCARCERATION_YEARS, 0]),
    months: sentence.getIn([INCARCERATION_MONTHS, 0]),
    days: sentence.getIn([INCARCERATION_DAYS, 0]),
  });
  return duration.toFormat('h');
}

export {
  DATE_MDY_SLASH_FORMAT,
  ISO_DATE_FORMAT,
  ISO_TIME_HMS_FORMAT,
  TIME_HM_FORMAT,
  calculateAge,
  convertSentenceToHours,
  formatAsDate,
  formatAsISODate,
  formatAsISOTime,
  formatAsTime,
};
