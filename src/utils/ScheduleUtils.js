/*
 * @flow
 */

import { DateTime, Interval } from 'luxon';

import { isDefined } from './LangUtils';
import { DATETIME_END, INCIDENT_START_DATETIME } from '../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../containers/participants/ParticipantsConstants';

const getCombinedDateTime = (date :string, time :string) => {
  const datetimeString :string = date.concat(' ', time);
  const datetime = DateTime.fromSQL(datetimeString).toISO();
  return datetime;
};

const getRegularlyRepeatingAppointments = (
  startDateTime :string,
  endDateTime :string,
  endsOnDate :string,
  units :string,
  repetitionInterval ? :number
) => {

  const startDateTimeObj :DateTime = DateTime.fromISO(startDateTime);
  const startTime = startDateTimeObj.toLocaleString(DateTime.TIME_24_SIMPLE);
  const endDateTimeObj :DateTime = DateTime.fromISO(endDateTime);
  const endsOnDateObj :DateTime = DateTime.fromISO(endsOnDate);

  const intervalObj :Interval = Interval.fromDateTimes(endDateTimeObj, endsOnDateObj);
  let intervalInUnitsGiven :number = intervalObj.length(units);
  if (isDefined(repetitionInterval) && repetitionInterval !== 1) {
    intervalInUnitsGiven /= repetitionInterval;
  }
  const dividedEqually :Interval[] = intervalObj.divideEqually(intervalInUnitsGiven);

  const appointments = [];
  for (let i = 0; i < dividedEqually.length; i += 1) {
    const startDate = dividedEqually[i].end.toISODate();
    const startDateTimeISO = getCombinedDateTime(startDate, startTime);
    appointments.push({
      [INCIDENT_START_DATETIME]: startDateTimeISO,
      [DATETIME_END]: dividedEqually[i].end.toISO()
    });
  }

  appointments.unshift({
    [INCIDENT_START_DATETIME]: startDateTime,
    [DATETIME_END]: endDateTime
  });

  return appointments;
};

const getCustomSchedule = (
  appointmentWeekdays :number[],
  startDateTime :string,
  endDateTime :string,
  endsOnDate :string,
  units :string,
  repetitionInterval :number
) => {

  const startDateTimeObj :DateTime = DateTime.fromISO(startDateTime);
  const startDateWeekday :number = startDateTimeObj.weekday;
  const endDateTimeObj :DateTime = DateTime.fromISO(endDateTime);
  const endsOnDateObj :DateTime = DateTime.fromISO(endsOnDate);

  const daysInOrder :number[] = [1, 2, 3, 4, 5, 6, 7];
  const indexOfStartDay :number = daysInOrder.indexOf(startDateWeekday);
  const daysOrderedFromStartDay :number[] = daysInOrder.slice(indexOfStartDay)
    .concat(daysInOrder.slice(0, indexOfStartDay));

  let appointments :Object[] = [];
  if (appointmentWeekdays.includes(startDateWeekday)) {
    appointments = appointments.concat(
      getRegularlyRepeatingAppointments(
        startDateTime,
        endDateTime,
        endsOnDate,
        units,
        repetitionInterval,
      )
    );
  }

  /* call getRegularlyRepeatingAppointments() for each day of the week that is selected */
  appointmentWeekdays.forEach((day :number) => {
    if (day !== startDateWeekday) {
      const differenceInDaysFromStartDate :number = daysOrderedFromStartDay.indexOf(day);
      const startDateTimeForDayGiven :string = startDateTimeObj.plus({ days: differenceInDaysFromStartDate }).toISO();
      const endDateTimeForDayGiven :string = endDateTimeObj.plus({ days: differenceInDaysFromStartDate }).toISO();
      const endsOnDateForDayGiven :string = endsOnDateObj.minus({ days: (7 - differenceInDaysFromStartDate) }).toISO();
      const appointmentsForDayGiven :Object[] = getRegularlyRepeatingAppointments(
        startDateTimeForDayGiven,
        endDateTimeForDayGiven,
        endsOnDateForDayGiven,
        units,
        repetitionInterval,
      );
      appointments = appointments.concat(appointmentsForDayGiven);
    }
  });

  return appointments;
};

const getInfoFromTimeRange = (timeString :string) :Object => {
  const start :string = timeString.split('-')[0].trim().split(':').join(' ');
  const end :string = timeString.split('-')[1].trim().split(':').join(' ');
  return { start, end };
};

const get24HourTimeFromString = (timeString :string) :string => {
  /* https://moment.github.io/luxon/docs/manual/parsing.html#table-of-tokens */
  const inputFormat :string = 'h mm a';
  const time :DateTime = DateTime.fromFormat(timeString, inputFormat).toLocaleString(DateTime.TIME_SIMPLE);
  const timeIn24Hour :string = time.toLowerCase().split(' ').join('');
  return timeIn24Hour;
};

const getDateInISOFormat = (dateString :string) => (
  DateTime.fromFormat(dateString.split('/').join(' '), 'M d yyyy').toISODate()
);

const getCheckInDeadline = (sentenceDateTime :string) :string => {

  const sentenceDateObj :DateTime = DateTime.fromISO(sentenceDateTime);
  if (sentenceDateObj.isValid) {
    return sentenceDateObj.plus({ hours: 48 }).toLocaleString();
  }
  return EMPTY_FIELD;
};

const getSentenceEndDate = (sentenceEndDateTime :string, sentenceDateTime :string) :string => {

  const sentenceEndDateObj :DateTime = DateTime.fromISO(sentenceEndDateTime);
  if (sentenceEndDateObj.isValid) {
    return sentenceEndDateObj.toLocaleString(DateTime.DATE_SHORT);
  }
  const sentenceDateObj :DateTime = DateTime.fromISO(sentenceDateTime);
  if (sentenceDateObj.isValid) {
    return sentenceDateObj.plus({ days: 90 }).toLocaleString();
  }
  return EMPTY_FIELD;
};

export {
  get24HourTimeFromString,
  getCheckInDeadline,
  getCombinedDateTime,
  getCustomSchedule,
  getDateInISOFormat,
  getInfoFromTimeRange,
  getRegularlyRepeatingAppointments,
  getSentenceEndDate,
};
