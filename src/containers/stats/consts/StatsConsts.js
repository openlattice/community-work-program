// @flow
import { DateTime } from 'luxon';

const MONTHLY :string = 'Monthly';
const YEARLY :string = 'Yearly';
const ALL_TIME :string = 'All-time';

const TIME_FRAME_OPTIONS :Object[] = [
  { label: MONTHLY, value: MONTHLY },
  { label: YEARLY, value: YEARLY },
  { label: ALL_TIME, value: ALL_TIME }
];

const MONTHS_OPTIONS :Object[] = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const YEARS_CWP_ACTIVE :any[] = [2018, DateTime.local().year];
const numYearsActive :number = YEARS_CWP_ACTIVE[1] + 1 - YEARS_CWP_ACTIVE[0];
const YEARS :number[] = new Array(numYearsActive).fill(2018)
  .map((year :number, index :number) => year + index);

const YEARS_OPTIONS :Object[] = YEARS.map((year :number) => (
  { label: year, value: year }
));

export {
  ALL_TIME,
  MONTHLY,
  MONTHS_OPTIONS,
  TIME_FRAME_OPTIONS,
  YEARLY,
  YEARS_OPTIONS,
};
