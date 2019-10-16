/*
 * @flow
 */
import { DateTime } from 'luxon';

import { EMPTY_FIELD } from '../containers/participants/ParticipantsConstants';

const DATE_MDY_SLASH_FORMAT :string = 'MM/DD/YYYY';
const ISO_DATE_FORMAT :string = 'YYYY-MM-DD';
const ISO_TIME_HMS_FORMAT :string = 'HH:mm:ss';
const TIME_HM_FORMAT :string = 'HH:mm';


function formatAsDate(value :string) :string {

  const valueAsDate = DateTime.fromISO(value);
  if (valueAsDate.isValid) {
    return valueAsDate.toLocaleString(DateTime.DATE_SHORT);
  }
  return EMPTY_FIELD;
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
    return valueAsTime.toLocaleString(DateTime.TIME_SIMPLE);
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
