// @flow
import { List, Map } from 'immutable';

import { getPersonDOB } from '../../../utils/PeopleUtils';
import { getEntityProperties } from '../../../utils/DataUtils';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../ParticipantsConstants';

const {
  ETHNICITY,
  FIRST_NAME,
  LAST_NAME,
  RACE,
  SEX,
} = PROPERTY_TYPE_FQNS;

const formatExistingPeopleData = (peopleAlreadyInEntitySet :List) => {

  const existingPeopleData :List = List().withMutations((list :List) => {
    peopleAlreadyInEntitySet.forEach((person :Map) => {
      const personMap :Map = Map().withMutations((map :Map) => {
        const personDOB :string = getPersonDOB(person);
        const {
          [ETHNICITY]: ethnicity,
          [FIRST_NAME]: firstName,
          [LAST_NAME]: lastName,
          [RACE]: race,
          [SEX]: sex
        } = getEntityProperties(person, [ETHNICITY, FIRST_NAME, LAST_NAME, RACE, SEX]);
        map.set('lastName', lastName);
        map.set('firstName', firstName);
        map.set('dob', personDOB);
        map.set('race', race.length ? race : EMPTY_FIELD);
        map.set('ethnicity', ethnicity.length ? ethnicity : EMPTY_FIELD);
        map.set('sex', sex.length ? sex : EMPTY_FIELD);
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
