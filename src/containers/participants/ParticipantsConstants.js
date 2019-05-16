// @flow
import { List, Map } from 'immutable';

/* Sort Participant Table */
const sortOptions :List = List().withMutations((list :List) => {

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

const sortDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', 'Sort by');
  map.set('enums', sortOptions);
});

/* Filters */

const STATUS = 'status';

/* Filter Participant Table by status */

const statusFilterOptions :List = List().withMutations((list :List) => {

  const all = Map().withMutations((map :Map) => {
    map.set('label', 'All');
    map.set('default', true);
    map.set('filter', STATUS);
  });
  list.set(0, all);

  const active = Map().withMutations((map :Map) => {
    map.set('label', 'Active');
    map.set('default', false);
    map.set('filter', STATUS);
  });
  list.set(1, active);

  const activeNoncompliant = Map().withMutations((map :Map) => {
    map.set('label', 'Active — noncompliant');
    map.set('default', false);
    map.set('filter', STATUS);
  });
  list.set(2, activeNoncompliant);

  const awaitingEnrollment = Map().withMutations((map :Map) => {
    map.set('label', 'Awaiting enrollment');
    map.set('default', false);
    map.set('filter', STATUS);
  });
  list.set(3, awaitingEnrollment);

  const closed = Map().withMutations((map :Map) => {
    map.set('label', 'Closed');
    map.set('default', false);
    map.set('filter', STATUS);
  });
  list.set(4, closed);

  const completed = Map().withMutations((map :Map) => {
    map.set('label', 'Completed');
    map.set('default', false);
    map.set('filter', STATUS);
  });
  list.set(5, completed);

  const removedNoncompliant = Map().withMutations((map :Map) => {
    map.set('label', 'Removed — noncompliant');
    map.set('default', false);
    map.set('filter', STATUS);
  });
  list.set(6, removedNoncompliant);

});

const statusFilterDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', 'Status');
  map.set('enums', statusFilterOptions);
});

export {
  sortDropdown,
  statusFilterDropdown,
};
