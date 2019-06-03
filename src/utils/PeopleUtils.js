/*
 * @flow
 */
import { Map } from 'immutable';
import { formatValue } from './FormattingUtils';
import { PEOPLE_FQNS } from '../core/edm/constants/FullyQualifiedNames';

const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;

export const getPersonName = (person :Map<*, *>) => `${formatValue(person
  .getIn([FIRST_NAME, 0]))} ${formatValue(person.getIn([LAST_NAME, 0]))}`;
