// @flow
import { Map } from 'immutable';

import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';

export const ALL_PARTICIPANTS_COLUMNS = [
  'NAME',
  'AGE',
  'START DATE',
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
  START_DATE: 'start date',
  STATUS: 'status',
};

/* Filters */

export const FILTERS = {
  STATUS: 'status'
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
    label: ENROLLMENT_STATUSES.ACTIVE_NONCOMPLIANT,
    value: ENROLLMENT_STATUSES.ACTIVE_NONCOMPLIANT,
    filter: FILTERS.STATUS,
  },
  {
    label: ENROLLMENT_STATUSES.AWAITING_ENROLLMENT,
    value: ENROLLMENT_STATUSES.AWAITING_ENROLLMENT,
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
    label: ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT,
    value: ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT,
    filter: FILTERS.STATUS,
  },
];

export const statusFilterDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', 'Filter by: Status');
  map.set('enums', STATUS_FILTER_OPTIONS);
});
