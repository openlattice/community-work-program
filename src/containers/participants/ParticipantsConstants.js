// @flow
import { List, Map } from 'immutable';

/* Sort Participant Table */
const sortOptions :List = List().withMutations((list :List) => {

  const startDate = Map().withMutations((map :Map) => {
    map.set('label', 'Start date');
    map.set('default', true);
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
});

const sortDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', 'Sort by');
  map.set('enums', sortOptions);
});

/* Filter Participant Table by enrollment status */

/* Filter Participant Table by start date or sentence date */

/* Participant Status */
const participantStatuses = [
  {
    value: '',
    label: 'Active',
  },
  {
    value: '',
    label: 'Noncompliant - active',
  },
  {
    value: '',
    label: 'Awaiting enrollment',
  },
  {
    value: '',
    label: 'Closed',
  },
  {
    value: '',
    label: 'Completed',
  },
  {
    value: '',
    label: 'Noncompliant - removed',
  },
];

export {
  sortDropdown,
  participantStatuses,
};
