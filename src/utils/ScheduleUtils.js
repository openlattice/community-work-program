/*
 * @flow
 */
import { List, Map } from 'immutable';
import { DateTime } from 'luxon';

export const getCombinedDateTime = (date :string, time :string) => {
  const datetimeString :string = date.concat(' ', time);
  const datetime = DateTime.fromSQL(datetimeString).toISO();
  return datetime;
};
