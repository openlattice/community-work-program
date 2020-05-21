// @flow
import { ETHNICITY_VALUES, RACE_VALUES } from '../../../core/edm/constants/DataModelConsts';

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
  some of the integrated people have race/ethnicity names that aren't consistent with
  the data that gets entered in on the app. this is a collection of those alternate
  race names.
*/
const AMERICAN_INDIAN :string = RACE_VALUES[2];
const BLACK_OR_AFRICAN_AMERICAN :string = RACE_VALUES[1];

const RACE_ALIASES :Object = {
  [AMERICAN_INDIAN]: ['American Indian', 'amindian', 'I', 'Native American'],
  [BLACK_OR_AFRICAN_AMERICAN]: ['B', 'Black / African American']
};

const HISPANIC_OR_LATINO :string = ETHNICITY_VALUES[0];
const NOT_HISPANIC_OR_LATINO :string = ETHNICITY_VALUES[1];

const ETHNICITY_ALIASES :Object = {
  [HISPANIC_OR_LATINO]: ['H', 'hispanic'],
  [NOT_HISPANIC_OR_LATINO]: ['NH', 'nonhispanic']
};

const DOWNLOAD_CONSTS :Object = {
  COUNT: 'count',
  COURT_TYPE: 'courtType',
  STATUS: 'status',
  STATUSES: 'statuses',
  TOTAL: 'total',
  TOTAL_FOR_ALL_COURT_TYPES: 'Total for All Court Types',
};

export {
  DOWNLOAD_CONSTS,
  ETHNICITY_ALIASES,
  RACE_ALIASES,
  SCREEN_VIEWS,
  SCREEN_VIEWS_LIST,
};
