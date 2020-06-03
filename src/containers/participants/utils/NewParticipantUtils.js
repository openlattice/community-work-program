// @flow
import { List, Map } from 'immutable';

import { getPersonDOB, getPersonFullName } from '../../../utils/PeopleUtils';

const formatExistingPeopleData = (peopleAlreadyInEntitySet :List) => {

  const existingPeopleData :List = List().withMutations((list :List) => {
    peopleAlreadyInEntitySet.forEach((person :Map) => {
      const personMap :Map = Map().withMutations((map :Map) => {
        const personName :string = getPersonFullName(person);
        const personDOB :string = getPersonDOB(person);
        map.set('name', personName);
        map.set('dob', personDOB);
        map.set('entity', person);
      });
      list.push(personMap);
    });
  });

  return existingPeopleData;
};

/* eslint-disable import/prefer-default-export */
export {
  formatExistingPeopleData,
};
