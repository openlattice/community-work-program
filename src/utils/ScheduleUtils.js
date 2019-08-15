/*
 * @flow
 */

import { DateTime, Interval } from 'luxon';

import { isDefined } from './LangUtils';
import {
  DATETIME_END,
  INCIDENT_START_DATETIME,
} from '../core/edm/constants/FullyQualifiedNames';

export const getCombinedDateTime = (date :string, time :string) => {
  const datetimeString :string = date.concat(' ', time);
  const datetime = DateTime.fromSQL(datetimeString).toISO();
  return datetime;
};

export const getRegularlyRepeatingAppointments = (
  startDateTime :string,
  endDateTime :string,
  endsOnDate :string,
  units :string,
  repetitionInterval :number
) => {

  const startDateTimeObj :DateTime = DateTime.fromISO(startDateTime);
  const startTime = startDateTimeObj.toLocaleString(DateTime.TIME_24_SIMPLE);
  const endDateTimeObj :DateTime = DateTime.fromISO(endDateTime);
  const endsOnDateObj :DateTime = DateTime.fromISO(endsOnDate);

  const intervalObj :Interval = Interval.fromDateTimes(endDateTimeObj, endsOnDateObj);
  let intervalInUnitsGiven :number = intervalObj.length(units);
  console.log('intervalInUnitsGiven: ', intervalInUnitsGiven);
  if (isDefined(repetitionInterval) && repetitionInterval !== 1) {
    intervalInUnitsGiven /= repetitionInterval;
  }
  console.log('intervalInUnitsGiven: ', intervalInUnitsGiven);
  const dividedEqually :Interval[] = intervalObj.divideEqually(intervalInUnitsGiven);

  const appointmentDates = [];
  for (let i = 0; i < dividedEqually.length; i += 1) {
    const startDate = dividedEqually[i].end.toISODate();
    const startDateTimeISO = getCombinedDateTime(startDate, startTime);
    appointmentDates.push({
      [INCIDENT_START_DATETIME]: startDateTimeISO,
      [DATETIME_END]: dividedEqually[i].end.toISO()
    });
  }
  console.log('appointmentDates: ', appointmentDates);
  return appointmentDates;
};
