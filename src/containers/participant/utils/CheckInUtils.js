// @flow
import round from 'lodash/round';
import { List, Map, fromJS } from 'immutable';
import { DateTime, Duration } from 'luxon';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties, sortEntitiesByDateProperty } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { get24HourTimeFromString } from '../../../utils/ScheduleUtils';

const { DATETIME_START, HOURS_WORKED } = PROPERTY_TYPE_FQNS;

const get24HourTimeForCheckIn = (hours :string) :Object => {
  const hoursArray :string[] = hours.split('-');
  const amPMTimeIn :string = hoursArray[0].trim();
  const amPMTimeOut :string = hoursArray[1].trim();
  const timeIn :string = get24HourTimeFromString(amPMTimeIn.replace(':', ' '), 'h mm a');
  const timeOut :string = get24HourTimeFromString(amPMTimeOut.replace(':', ' '), 'h mm a');
  return { timeIn, timeOut };
};

const getHoursScheduled = (timeIn :string, timeOut :string) :number => {
  const now :DateTime = DateTime.local();
  const timeInAsDateTime = DateTime.fromSQL(`${now.toISODate()} ${timeIn}`);
  const timeOutAsDateTime = DateTime.fromSQL(`${now.toISODate()} ${timeOut}`);
  const duration = timeOutAsDateTime.diff(timeInAsDateTime, 'hours');
  const { hours } = duration.toObject();
  const roundedHours = hours ? round(hours, 2) : 0;
  return roundedHours;
};

const getWeeklyBreakdownOfHoursPerWeek = (checkIns :List) => {
  if (checkIns.isEmpty()) return List();
  const sortedCheckIns :List = sortEntitiesByDateProperty(checkIns, [DATETIME_START]);
  const { [DATETIME_START]: firstDateTime } = getEntityProperties(sortedCheckIns.first(), [DATETIME_START]);
  const { [DATETIME_START]: lastDateTime } = getEntityProperties(sortedCheckIns.last(), [DATETIME_START]);

  const hoursByWeek :List = List().withMutations((list :List) => {

    const firstWeekStartDate :string = DateTime.fromISO(firstDateTime).startOf('week').toUTC().toISO();
    const lastWeekStartDate :string = DateTime.fromISO(lastDateTime).startOf('week').toUTC().toISO();

    const weeksDuration = DateTime.fromISO(lastWeekStartDate).diff(DateTime.fromISO(firstWeekStartDate), 'weeks');
    // $FlowFixMe
    const { weeks } = weeksDuration.toObject();

    let counter = 0;
    while (counter < weeks + 1) {
      let weekStart;
      let weekEnd;
      if (list.isEmpty()) {
        weekStart = firstWeekStartDate;
        weekEnd = DateTime.fromISO(firstDateTime).endOf('week').toUTC().toISO();
      }
      else {
        const weekLongDuration = Duration.fromObject({ weeks: 1 });
        const previousWeek = list.last();
        const previousWeekStartDate = previousWeek.get('weekStart');
        weekStart = DateTime.fromISO(previousWeekStartDate).plus(weekLongDuration).toISO();
        weekEnd = DateTime.fromISO(weekStart).endOf('week').toUTC().toISO();
      }
      list.push(fromJS({ weekStart, weekEnd, hours: 0 }));
      counter += 1;
    }

    sortedCheckIns.forEach((checkIn :Map) => {
      const {
        [DATETIME_START]: checkInStart,
        [HOURS_WORKED]: checkInHours,
      } = getEntityProperties(checkIn, [DATETIME_START, HOURS_WORKED]);
      const startDateTime :DateTime = DateTime.fromISO(checkInStart);
      list.forEach((weekMap :Map, index :number) => {
        const weekStart :DateTime = DateTime.fromISO(weekMap.get('weekStart'));
        const weekEnd :DateTime = DateTime.fromISO(weekMap.get('weekEnd'));
        // $FlowFixMe
        if (startDateTime > weekStart && startDateTime < weekEnd) {
          list.setIn([index, 'hours'], list.getIn([index, 'hours']) + checkInHours);
        }
      });
    });
  });
  return hoursByWeek;
};

const doesCheckInMatchAppointment = (numHoursScheduled :number, checkIn :?Map) :boolean => {
  if (!numHoursScheduled) return false;
  if (isDefined(checkIn) && !checkIn.isEmpty()) {
    const { [HOURS_WORKED]: hoursActuallyWorked } = getEntityProperties(checkIn, [HOURS_WORKED]);
    return (numHoursScheduled).toString() === (hoursActuallyWorked).toString();
  }
  return true;
};

const getHoursForDisplay = (numHoursScheduled :number, checkIn :?Map) :string => {
  let hoursToDisplay = numHoursScheduled.toString();
  if (isDefined(checkIn) && !checkIn.isEmpty()) {
    const { [HOURS_WORKED]: hoursActuallyWorked } = getEntityProperties(checkIn, [HOURS_WORKED]);
    const hoursActuallyWorkedAsString = (hoursActuallyWorked).toString();
    if (hoursActuallyWorkedAsString !== hoursToDisplay) {
      hoursToDisplay = `${(hoursActuallyWorked).toString()} of ${hoursToDisplay}`;
    }
  }
  return hoursToDisplay;
};

export {
  doesCheckInMatchAppointment,
  get24HourTimeForCheckIn,
  getHoursForDisplay,
  getHoursScheduled,
  getWeeklyBreakdownOfHoursPerWeek,
};
