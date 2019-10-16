// @flow
import { isDefined } from '../../utils/LangUtils';

const getWorksiteStatus = (dateActive :string, dateInactive :string) :string => {

  const active :boolean = !isDefined(dateInactive) && isDefined(dateActive);
  const status :string = active ? 'Active' : 'Inactive';
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
