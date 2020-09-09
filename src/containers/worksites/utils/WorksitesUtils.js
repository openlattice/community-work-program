// @flow
import { Map } from 'immutable';

import { isDefined } from '../../../utils/LangUtils';
import { EMPTY_FIELD } from '../../participants/ParticipantsConstants';

const getWorksiteStatus = (dateActive :string, dateInactive :string) :string => {

  let status :string = EMPTY_FIELD;
  if (isDefined(dateActive) || isDefined(dateInactive)) {
    const active :boolean = dateInactive.length === 0 && dateActive.length > 0;
    status = active ? 'Active' : 'Inactive';
  }

  return status;
};

const daysOfTheWeek :string[] = [
  'MON',
  'TUES',
  'WEDS',
  'THURS',
  'FRI',
  'SAT',
  'SUN',
];

const getWeekdayTableHeaders = () :Object[] => {

  const headers = [];
  daysOfTheWeek.forEach((day :string) => {
    headers.push({
      cellStyle: {
        backgroundColor: 'white',
        color: 'black',
        fontSize: '11px',
        fontWeight: '600',
        padding: '15px 10px',
        textAlign: 'center',
      },
      key: day,
      label: day,
      sortable: false,
    });
  });
  return headers;
};

const getWeekdayTableData = (scheduleByWeekdayNumber :Map) :Object[] => ([{
  MON: scheduleByWeekdayNumber.get(1, ''),
  TUES: scheduleByWeekdayNumber.get(2, ''),
  WEDS: scheduleByWeekdayNumber.get(3, ''),
  THURS: scheduleByWeekdayNumber.get(4, ''),
  FRI: scheduleByWeekdayNumber.get(5, ''),
  SAT: scheduleByWeekdayNumber.get(6, ''),
  SUN: scheduleByWeekdayNumber.get(7, ''),
}]);

export {
  getWeekdayTableData,
  getWeekdayTableHeaders,
  getWorksiteStatus,
};
