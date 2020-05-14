// @flow
import { RACE_VALUES } from '../../../core/edm/constants/DataModelConsts';

const SCREEN_VIEWS = {
  COURT_TYPE: 'Court Type',
  WORK_SITES: 'Work Sites',
  DEMOGRAPHICS: 'Demographics',
  CHARGES: 'Charges'
};

// to get rid of flow errors
const SCREEN_VIEWS_LIST :string[] = [
  SCREEN_VIEWS.COURT_TYPE,
  SCREEN_VIEWS.WORK_SITES,
  SCREEN_VIEWS.DEMOGRAPHICS,
  SCREEN_VIEWS.CHARGES,
];

/*
  some of the integrated people have race names that aren't consistent with
  the data that gets entered in on the app. this is a collection of those alternate
  race names.
*/
const AMERICAN_INDIAN :string = RACE_VALUES[2];
const BLACK_OR_AFRICAN_AMERICAN :string = RACE_VALUES[1];

const ALTERNATE_RACE_NAMES :Object = {
  [AMERICAN_INDIAN]: ['American Indian', 'amindian', 'Native American'],
  [BLACK_OR_AFRICAN_AMERICAN]: ['Black / African American']
};

export {
  ALTERNATE_RACE_NAMES,
  SCREEN_VIEWS,
  SCREEN_VIEWS_LIST,
};
