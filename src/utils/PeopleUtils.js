/*
 * @flow
 */
import { Map } from 'immutable';
import { formatStringValueOrValues } from './FormattingUtils';
import { PEOPLE_FQNS } from '../core/edm/constants/FullyQualifiedNames';

const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;

export const getPersonName = (person :Map<*, *>) => ((person && person
  .getIn([FIRST_NAME, 0]) && person.getIn([LAST_NAME, 0]))
  ? `${formatStringValueOrValues(person
    .getIn([FIRST_NAME, 0]))} ${formatStringValueOrValues(person.getIn([LAST_NAME, 0]))}`
  : '');
