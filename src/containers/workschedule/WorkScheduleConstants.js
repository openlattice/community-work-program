// @flow
import startCase from 'lodash/startCase';

export const timePeriods :Object = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month'
};

export const TIME_PERIOD_OPTIONS :Object[] = Object.values(timePeriods)
  .map((timePeriod :any) => ({ label: startCase(timePeriod), value: timePeriod }));
