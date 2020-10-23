// @flow
import set from 'lodash/set';
import { Map } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { PEOPLE } = APP_TYPE_FQNS;
const {
  DOB,
  ETHNICITY,
  FIRST_NAME,
  LAST_NAME,
  RACE,
  SEX,
} = PROPERTY_TYPE_FQNS;

const getOriginalFormData = (person :Map) => {
  const formData = {
    [getPageSectionKey(1, 1)]: {}
  };
  if (person.isEmpty()) return formData;
  const personValues = getEntityProperties(person, [DOB, ETHNICITY, FIRST_NAME, LAST_NAME, RACE, SEX]);
  Object.entries(personValues).forEach(([fqn, value]) => {
    set(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, fqn)], value);
  });
  return formData;
};

/* eslint-disable import/prefer-default-export */
export {
  getOriginalFormData,
};
