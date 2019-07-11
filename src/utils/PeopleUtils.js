/*
 * @flow
 */
import { Map } from 'immutable';
import { getEntityProperties } from './DataUtils';
import { PEOPLE_FQNS } from '../core/edm/constants/FullyQualifiedNames';

const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;

export const getPersonName = (person :Map<*, *>) => {
  let fullName = '';
  const {
    [FIRST_NAME]: firstName,
    [LAST_NAME]: lastName
  } = getEntityProperties(person, [FIRST_NAME, LAST_NAME]);
  if (firstName && lastName) {
    fullName = `${firstName} ${lastName}`;
  }
  return fullName;
};
