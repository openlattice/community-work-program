// @flow
import { Map } from 'immutable';

import {
  COURT_TYPES,
  ENROLLMENT_STATUSES,
  RACE_VALUES,
  SEX_VALUES,
} from '../../core/edm/constants/DataModelConsts';

const generateOptions = (list :string[]) :Object[] => list.map((value :string) => ({
  label: value,
  value
}));

const EMPTY_FIELD = '----';

const ALL_PARTICIPANTS_COLUMNS = [
  '',
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

const SORTABLE_PARTICIPANT_COLUMNS = {
  COURT_TYPE: 'court type',
  NAME: 'name',
  SENT_END_DATE: 'sent. end date',
  STATUS: 'status',
};

/* Filters */

const FILTERS = {
  COURT_TYPE: 'Court Type',
  STATUS: 'Status',
};
const ALL = 'ALL';

/* Filter Participant Table by status */
const STATUS_FILTER_OPTIONS = [
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

const statusFilterDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', FILTERS.STATUS);
  map.set('enums', STATUS_FILTER_OPTIONS);
});

const COMPLETION_STATUSES = [
  ENROLLMENT_STATUSES.CLOSED,
  ENROLLMENT_STATUSES.COMPLETED,
  ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT,
  ENROLLMENT_STATUSES.SUCCESSFUL,
  ENROLLMENT_STATUSES.UNSUCCESSFUL,
];

/* Options lists */
const sexOptions :Object[] = generateOptions(SEX_VALUES);
const raceOptions :Object[] = generateOptions(RACE_VALUES);
const courtTypeOptions :Object[] = generateOptions(COURT_TYPES);

/* Filter Participant Table by court type */
courtTypeOptions.unshift({ label: 'All', value: ALL });
const COURT_TYPE_FILTER_OPTIONS :Object[] = courtTypeOptions
  .map((courtType :Object) => {
    const courtTypeFilter = courtType;
    courtTypeFilter.filter = FILTERS.COURT_TYPE;
    return courtTypeFilter;
  })
  .sort((courtTypeA :Object, courtTypeB :Object) => {
    if (courtTypeA.label < courtTypeB.label) return -1;
    if (courtTypeA.label > courtTypeB.label) return 1;
    return 0;
  });

const courtTypeFilterDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', FILTERS.COURT_TYPE);
  map.set('enums', COURT_TYPE_FILTER_OPTIONS);
});

export {
  ALL,
  ALL_PARTICIPANTS_COLUMNS,
  COMPLETION_STATUSES,
  COURT_TYPE_FILTER_OPTIONS,
  EMPTY_FIELD,
  FILTERS,
  SORTABLE_PARTICIPANT_COLUMNS,
  STATUS_FILTER_OPTIONS,
  courtTypeFilterDropdown,
  courtTypeOptions,
  generateOptions,
  raceOptions,
  sexOptions,
  statusFilterDropdown,
};
