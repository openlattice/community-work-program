// @flow
import { Map } from 'immutable';

import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';

export const EMPTY_FIELD = '----';

export const ALL_PARTICIPANTS_COLUMNS = [
  'NAME',
  'AGE',
  'SENT. DATE',
  'SENT. END DATE',
  'STATUS',
  '# OF WARN.',
  '# OF VIO.',
  'HRS. SERVED',
  'COURT TYPE'
];

/* Sort Participant Table */

export const SORTABLE_PARTICIPANT_COLUMNS = {
  COURT_TYPE: 'court type',
  NAME: 'name',
  SENT_END_DATE: 'sent. end date',
  STATUS: 'status',
};

/* Filters */

export const FILTERS = {
  STATUS: 'Filter by: Status'
};
export const ALL = 'ALL';

/* Filter Participant Table by status */
export const STATUS_FILTER_OPTIONS = [
  {
    label: 'All',
    value: ALL,
    filter: FILTERS.STATUS,
  },
  {
    label: ENROLLMENT_STATUSES.ACTIVE,
    value: ENROLLMENT_STATUSES.ACTIVE,
    filter: FILTERS.STATUS,
  },
  {
    label: ENROLLMENT_STATUSES.ACTIVE_REOPENED,
    value: ENROLLMENT_STATUSES.ACTIVE_REOPENED,
    filter: FILTERS.STATUS,
  },
  {
    label: ENROLLMENT_STATUSES.AWAITING_CHECKIN,
    value: ENROLLMENT_STATUSES.AWAITING_CHECKIN,
    filter: FILTERS.STATUS,
  },
  {
    label: ENROLLMENT_STATUSES.AWAITING_ORIENTATION,
    value: ENROLLMENT_STATUSES.AWAITING_ORIENTATION,
    filter: FILTERS.STATUS,
  },
  {
    label: ENROLLMENT_STATUSES.CLOSED,
    value: ENROLLMENT_STATUSES.CLOSED,
    filter: FILTERS.STATUS,
  },
  {
    label: ENROLLMENT_STATUSES.COMPLETED,
    value: ENROLLMENT_STATUSES.COMPLETED,
    filter: FILTERS.STATUS,
  },
  {
    label: ENROLLMENT_STATUSES.JOB_SEARCH,
    value: ENROLLMENT_STATUSES.JOB_SEARCH,
    filter: FILTERS.STATUS,
  },
  {
    label: ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT,
    value: ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT,
    filter: FILTERS.STATUS,
  },
  {
    label: ENROLLMENT_STATUSES.SUCCESSFUL,
    value: ENROLLMENT_STATUSES.SUCCESSFUL,
    filter: FILTERS.STATUS,
  },
  {
    label: ENROLLMENT_STATUSES.UNSUCCESSFUL,
    value: ENROLLMENT_STATUSES.UNSUCCESSFUL,
    filter: FILTERS.STATUS,
  },
];

export const statusFilterDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', FILTERS.STATUS);
  map.set('enums', STATUS_FILTER_OPTIONS);
});

/* Demographics */

const generateOptions = (list :string[]) :Object[] => list.map(value => ({
  label: value,
  value
}));

export const SEX_VALUES = [
  'Female',
  'Male',
  'Unknown'
];
export const sexOptions = generateOptions(SEX_VALUES);

export const RACE_VALUES = [
  'American Indian',
  'Asian / Pacific Islander',
  'Black / African American',
  'Hispanic / Latino (Non-White)',
  'White',
  'Unknown',
  'Other Not Specified',
];
export const raceOptions = generateOptions(RACE_VALUES);
