// @flow
import { Map, setIn } from 'immutable';
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

  let formData = {
    [getPageSectionKey(1, 1)]: {}
  };

  if (person.isEmpty()) return formData;

  const {
    [DOB]: dob,
    [ETHNICITY]: ethnicity,
    [FIRST_NAME]: firstName,
    [LAST_NAME]: lastName,
    [RACE]: race,
    [SEX]: sex,
  } = getEntityProperties(person, [DOB, ETHNICITY, FIRST_NAME, LAST_NAME, RACE, SEX]);

  formData = setIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, FIRST_NAME)], firstName);
  formData = setIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, LAST_NAME)], lastName);
  formData = setIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, DOB)], dob);
  formData = setIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, RACE)], race);
  formData = setIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, ETHNICITY)], ethnicity);
  formData = setIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, SEX)], sex);
  return formData;
};

/* eslint-disable import/prefer-default-export */
export {
  getOriginalFormData,
};
