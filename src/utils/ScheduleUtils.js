/*
 * @flow
 */

import { DateTime, Interval } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  List,
  Map,
  fromJS,
  getIn,
} from 'immutable';

import { isDefined } from './LangUtils';
import { APP_TYPE_FQNS, DATETIME_END, INCIDENT_START_DATETIME } from '../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../containers/participants/ParticipantsConstants';
import { FEDERAL_HOLIDAYS } from '../containers/worksites/WorksitesConstants';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { APPOINTMENT } = APP_TYPE_FQNS;

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
  return DateTime.fromFormat(timeString, inputFormat).toLocaleString(DateTime.TIME_24_SIMPLE);
};

const getDateInISOFormat = (dateString :string) :string => (
  DateTime.fromFormat(dateString.split('/').join(' '), 'M d yyyy').toISODate()
);

const get12HourTimeFrom24HourTime = (time :string) :string => {
  const randomDate = DateTime.local().toISODate();
  const timeInDateTime :DateTime = DateTime.fromSQL(`${randomDate} ${time}`);
  return timeInDateTime.toLocaleString(DateTime.TIME_SIMPLE);
};

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

/* Worksite schedule utils */

const getRemainingDatesInYearByWeekday = () :Object => {

  const datesSortedByDays :Object = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: []
  };

  const firstDateOfMonth :string = DateTime.local().startOf('month');
  const currentYear = DateTime.local().year;

  let date = firstDateOfMonth;
  while (currentYear === date.year) {
    const { weekday } = date;
    datesSortedByDays[weekday.toString()].push(date.toISODate());
    date = date.plus({ days: 1 });
  }
  return datesSortedByDays;
};

const getEntitiesForWorksiteSchedule = (formData :Object) :Object => {

  const entityData :Object = {
    [getPageSectionKey(1, 1)]: {}
  };
  const datesInYearByWeekday :Map = fromJS(getRemainingDatesInYearByWeekday());
  let counter = 0;

  datesInYearByWeekday.forEach((listOfDatesByWeekday :List, weekdayKey :string) => {
    const weekdayKeyAsNumber :number = parseInt(weekdayKey, 10);

    listOfDatesByWeekday.forEach((weekdayDate :string) => {
      const startTime = getIn(formData, [
        getPageSectionKey(1, weekdayKeyAsNumber),
        getEntityAddressKey(weekdayKeyAsNumber - 1, APPOINTMENT, INCIDENT_START_DATETIME)
      ]);
      const endTime = getIn(formData, [
        getPageSectionKey(1, weekdayKeyAsNumber),
        getEntityAddressKey(weekdayKeyAsNumber - 1, APPOINTMENT, DATETIME_END)
      ]);
      const startDateTime = getCombinedDateTime(weekdayDate, startTime);
      const endDateTime = getCombinedDateTime(weekdayDate, endTime);
      if (isDefined(startDateTime) && isDefined(endDateTime)) {
        entityData[getPageSectionKey(1, 1)][getEntityAddressKey(
          counter,
          APPOINTMENT,
          INCIDENT_START_DATETIME
        )] = startDateTime;
        entityData[getPageSectionKey(1, 1)][getEntityAddressKey(
          counter,
          APPOINTMENT,
          DATETIME_END
        )] = endDateTime;

        counter += 1;
      }
    });
  });

  return entityData;
};

const getWorksiteScheduleFromEntities = (entities :List) :Object => {

  const scheduleData :Object = {
    [getPageSectionKey(1, 1)]: {},
    [getPageSectionKey(1, 2)]: {},
    [getPageSectionKey(1, 3)]: {},
    [getPageSectionKey(1, 4)]: {},
    [getPageSectionKey(1, 5)]: {},
    [getPageSectionKey(1, 6)]: {},
    [getPageSectionKey(1, 7)]: {},
  };

  entities.forEach((entity :Map) => {
    const startDateTime = entity.getIn([INCIDENT_START_DATETIME, 0]);
    const { weekday } :number = DateTime.fromISO(startDateTime);
    if (!Object.keys(scheduleData[getPageSectionKey(1, weekday)]).length) {
      const endDateTime = entity.getIn([DATETIME_END, 0]);
      scheduleData[getPageSectionKey(1, weekday)][getEntityAddressKey(
        weekday - 1,
        APPOINTMENT,
        INCIDENT_START_DATETIME
      )] = DateTime.fromISO(startDateTime).toLocaleString(DateTime.TIME_24_SIMPLE);
      scheduleData[getPageSectionKey(1, weekday)][getEntityAddressKey(
        weekday - 1,
        APPOINTMENT,
        DATETIME_END
      )] = DateTime.fromISO(endDateTime).toLocaleString(DateTime.TIME_24_SIMPLE);
    }
  });
  return scheduleData;
};

const getWorksiteScheduleFromFormData = (scheduleData :Object) :Map => {

  let scheduleByWeekday :Map = Map();
  let counter :number = 0;
  fromJS(scheduleData).forEach((section :Map) => {
    const startTime = getIn(section, [getEntityAddressKey(counter, APPOINTMENT, INCIDENT_START_DATETIME)]);
    const endTime = getIn(section, [getEntityAddressKey(counter, APPOINTMENT, DATETIME_END)]);
    if (isDefined(startTime) && isDefined(endTime)) {
      const readableStartTime :string = get12HourTimeFrom24HourTime(startTime);
      const readableEndTime :string = get12HourTimeFrom24HourTime(endTime);
      const times :string = `${readableStartTime} — ${readableEndTime}`;
      scheduleByWeekday = scheduleByWeekday.set(counter + 1, times);
    }
    counter += 1;
  });
  return scheduleByWeekday;
};

export {
  get24HourTimeFromString,
  getCheckInDeadline,
  getCombinedDateTime,
  getCustomSchedule,
  getDateInISOFormat,
  getEntitiesForWorksiteSchedule,
  getInfoFromTimeRange,
  getRegularlyRepeatingAppointments,
  getRemainingDatesInYearByWeekday,
  getSentenceEndDate,
  getWorksiteScheduleFromFormData,
  getWorksiteScheduleFromEntities,
};
