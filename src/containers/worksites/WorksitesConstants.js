// @flow
import { Map } from 'immutable';

/* Worksite Statuses */

export const WORKSITE_STATUSES = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

/* Filters */

export const FILTERS = {
  STATUS: 'Status'
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
    label: WORKSITE_STATUSES.ACTIVE,
    value: WORKSITE_STATUSES.ACTIVE,
    filter: FILTERS.STATUS,
  },
  {
    label: WORKSITE_STATUSES.INACTIVE,
    value: WORKSITE_STATUSES.INACTIVE,
    filter: FILTERS.STATUS,
  },
];

export const statusFilterDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', FILTERS.STATUS);
  map.set('enums', STATUS_FILTER_OPTIONS);
});

/* Worksite Info */

export const WORKSITE_INFO_CONSTS = {
  PAST: 'past',
  SCHEDULED: 'scheduled',
  TOTAL_HOURS: 'totalHours',
};
