// @flow
import { isDefined } from '../../utils/LangUtils';
import { EMPTY_FIELD } from '../participants/ParticipantsConstants';

const getWorksiteStatus = (dateActive :string, dateInactive :string) :string => {

  let status :string = EMPTY_FIELD;
  if (isDefined(dateActive) || isDefined(dateInactive)) {
    const active :boolean = dateInactive.length === 0 && dateActive.length > 0;
    status = active ? 'Active' : 'Inactive';
  }

  return status;
};

const getWeekdayTableHeaders = () => {

  const daysOfTheWeek :string[] = [
    'MON',
    'TUES',
    'WEDS',
    'THURS',
    'FRI',
    'SAT',
    'SUN',
  ];
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

export {
  getWeekdayTableHeaders,
  getWorksiteStatus,
};
