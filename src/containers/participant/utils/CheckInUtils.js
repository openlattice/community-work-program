// @flow
import { DateTime } from 'luxon';

import { get24HourTimeFromString } from '../../../utils/ScheduleUtils';

const getTimeFormat = (timeString :string) :string => {
  if (timeString.includes('AM')) return 'hh mm a';
  if (timeString.includes('PM')) return 'h mm a';
  return 'h mm a';
};

const get24HourTimeForCheckIn = (hours :string) :Object => {
  const hoursArray :string[] = hours.split('-');
  const amPMTimeIn :string = hoursArray[0].trim();
  const amPMTimeOut :string = hoursArray[1].trim();
  const timeInFormat :string = getTimeFormat(amPMTimeIn);
  const timeOutFormat :string = getTimeFormat(amPMTimeOut);
  const timeIn :string = get24HourTimeFromString(amPMTimeIn.replace(':', ' '), timeInFormat);
  const timeOut :string = get24HourTimeFromString(amPMTimeOut.replace(':', ' '), timeOutFormat);
  return { timeIn, timeOut };
};

const getHoursScheduled = (timeIn :string, timeOut :string) :number => {
  const now :DateTime = DateTime.local();
  const timeInAsDateTime = DateTime.fromSQL(`${now.toISODate()} ${timeIn}`);
  const timeOutAsDateTime = DateTime.fromSQL(`${now.toISODate()} ${timeOut}`);
  const duration = timeOutAsDateTime.diff(timeInAsDateTime, 'hours');
  const { hours } = duration.toObject();
  if (hours) return hours;
  return 0;
};

export {
  get24HourTimeForCheckIn,
  getHoursScheduled,
  getTimeFormat,
};
