// @flow
import { List, Map } from 'immutable';

/* Sort Participant Table */
const sortOptions :List = List().withMutations((list :List) => {

  const name = Map().withMutations((map :Map) => {
    map.set('label', 'Name');
    map.set('default', true);
  });
  list.set(0, name);

  const startDate = Map().withMutations((map :Map) => {
    map.set('label', 'Start date');
    map.set('default', false);
  });
  list.set(1, startDate);

  const sentEndDate = Map().withMutations((map :Map) => {
    map.set('label', 'Sent. end date');
    map.set('default', false);
  });
  list.set(2, sentEndDate);

  const numberHours = Map().withMutations((map :Map) => {
    map.set('label', 'Number of hours');
    map.set('default', false);
  });
  list.set(3, numberHours);
});

const sortDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', 'Sort by');
  map.set('enums', sortOptions);
});

/* Filter Participant Table by enrollment status */

/* Filter Participant Table by start date or sentence date */

export {
  sortDropdown,
};
