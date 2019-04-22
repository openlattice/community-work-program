// @flow
import { List, Map } from 'immutable';

const statusFilterOptions :List = List().withMutations((list :List) => {

  const allStatuses = Map().withMutations((map :Map) => {
    map.set('label', 'All');
    map.set('default', true);
  });
  list.set(0, allStatuses);

  const active = Map().withMutations((map :Map) => {
    map.set('label', 'Active');
    map.set('default', false);
  });
  list.set(1, active);

  const inactive = Map().withMutations((map :Map) => {
    map.set('label', 'Inactive');
    map.set('default', false);
  });
  list.set(2, inactive);
});

const statusDropdown :Map = Map().withMutations((map :Map) => {
  map.set('title', 'Status');
  map.set('enums', statusFilterOptions);
});

export {
  statusFilterOptions,
  statusDropdown,
};
