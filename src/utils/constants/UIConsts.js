// @flow
import { List, Map } from 'immutable';

import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
/* Dashboard */

export const NEW_PARTICIPANTS_COLUMNS = ['NAME', 'SENT. DATE', 'ENROLL. DEADLINE', 'REQ. HRS.'];
export const PENDING_PARTICIPANTS_COLUMNS = ['NAME', 'SENT. DATE', 'REQ. HRS.'];
export const VIOLATIONS_WATCH_COLUMNS = ['NAME', '# OF VIO.', 'HRS. SERVED'];

/* Participants */

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

export const SORTABLE_PARTICIPANT_COLUMNS = {
  COURT_TYPE: 'court type',
  NAME: 'name',
  SENT_END_DATE: 'sent. end date',
  START_DATE: 'start date',
  STATUS: 'status',
};

/* Sort Participant Table */
export const SORT_OPTIONS :List = List().withMutations((list :List) => {

  const startDate = Map().withMutations((map :Map) => {
    map.set('label', 'Start date');
    map.set('default', false);
  });
  list.set(0, startDate);

  const sentEndDate = Map().withMutations((map :Map) => {
    map.set('label', 'Sent. end date');
    map.set('default', false);
  });
  list.set(1, sentEndDate);

  const name = Map().withMutations((map :Map) => {
    map.set('label', 'Name');
    map.set('default', false);
  });
  list.set(2, name);

  const status = Map().withMutations((map :Map) => {
    map.set('label', 'Status');
    map.set('default', true);
  });
  list.set(3, status);

  const courtType = Map().withMutations((map :Map) => {
    map.set('label', 'Court type');
    map.set('default', false);
  });
  list.set(4, courtType);
});

export const sortDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', 'Sort by');
  map.set('enums', SORT_OPTIONS);
});

/* Filters */

export const FILTERS = {
  STATUS: 'status'
};
export const ALL = 'ALL';

/* Filter Participant Table by status */

export const statusFilterOptions :List = List().withMutations((list :List) => {

  const all = Map().withMutations((map :Map) => {
    map.set('label', 'All');
    map.set('default', true);
    map.set('filter', FILTERS.STATUS);
  });
  list.set(0, all);

  const active = Map().withMutations((map :Map) => {
    map.set('label', ENROLLMENT_STATUSES.ACTIVE);
    map.set('default', false);
    map.set('filter', FILTERS.STATUS);
  });
  list.set(1, active);

  const activeNoncompliant = Map().withMutations((map :Map) => {
    map.set('label', ENROLLMENT_STATUSES.ACTIVE_NONCOMPLIANT);
    map.set('default', false);
    map.set('filter', FILTERS.STATUS);
  });
  list.set(2, activeNoncompliant);

  const awaitingEnrollment = Map().withMutations((map :Map) => {
    map.set('label', ENROLLMENT_STATUSES.AWAITING_ENROLLMENT);
    map.set('default', false);
    map.set('filter', FILTERS.STATUS);
  });
  list.set(3, awaitingEnrollment);

  const closed = Map().withMutations((map :Map) => {
    map.set('label', ENROLLMENT_STATUSES.CLOSED);
    map.set('default', false);
    map.set('filter', FILTERS.STATUS);
  });
  list.set(4, closed);

  const completed = Map().withMutations((map :Map) => {
    map.set('label', ENROLLMENT_STATUSES.COMPLETED);
    map.set('default', false);
    map.set('filter', FILTERS.STATUS);
  });
  list.set(5, completed);

  const removedNoncompliant = Map().withMutations((map :Map) => {
    map.set('label', ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT);
    map.set('default', false);
    map.set('filter', FILTERS.STATUS);
  });
  list.set(6, removedNoncompliant);

});

export const statusFilterDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', 'Status');
  map.set('enums', statusFilterOptions);
});
