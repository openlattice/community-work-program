// @flow
import {
  List,
  Map,
  removeIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties, getValuesFromEntityList } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { ARREST_CHARGE_LIST, JUDGES, PEOPLE } = APP_TYPE_FQNS;
const {
  DOB,
  ENTITY_KEY_ID,
  ETHNICITY,
  FIRST_NAME,
  LAST_NAME,
  LEVEL_STATE,
  NAME,
  OL_ID,
  PERSON_NOTES,
  RACE,
  SEX,
} = PROPERTY_TYPE_FQNS;

const hydrateSchema = (
  schema :Object,
  uiSchema :Object,
  judges :List,
  charges :List,
  existingPerson :Map,
) => {

  const [judgesValues, judgesLabels] = getValuesFromEntityList(judges, [FIRST_NAME, LAST_NAME]);
  const [chargesValues, chargesLabels] = getValuesFromEntityList(charges, [OL_ID, NAME, LEVEL_STATE]);
  let newSchema = setIn(
    schema,
    [
      'properties',
      getPageSectionKey(1, 3),
      'properties',
      getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID),
      'enum'
    ],
    judgesValues
  );
  newSchema = setIn(
    newSchema,
    [
      'properties',
      getPageSectionKey(1, 3),
      'properties',
      getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID),
      'enumNames'
    ],
    judgesLabels
  );
  newSchema = setIn(
    newSchema,
    [
      'properties',
      getPageSectionKey(1, 4),
      'items',
      'properties',
      getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID),
      'enum'
    ],
    chargesValues
  );
  newSchema = setIn(
    newSchema,
    [
      'properties',
      getPageSectionKey(1, 4),
      'items',
      'properties',
      getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID),
      'enumNames'
    ],
    chargesLabels
  );

  let newUiSchema = uiSchema;
  if (isDefined(existingPerson) && !existingPerson.isEmpty()) {
    const propertyFQNs = [LAST_NAME, FIRST_NAME, DOB, RACE, ETHNICITY, SEX];
    propertyFQNs.forEach((fqn) => {
      newUiSchema = setIn(
        newUiSchema,
        [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, fqn), 'ui:disabled'],
        true
      );
    });
    newUiSchema = removeIn(newUiSchema, [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, PERSON_NOTES)]);

    newSchema = removeIn(
      newSchema,
      [
        'properties',
        getPageSectionKey(1, 1),
        'properties',
        getEntityAddressKey(0, PEOPLE, PERSON_NOTES)
      ],
    );
  }

  return { newSchema, newUiSchema };
};

const setPersonValues = (existingPerson :Map, formData :Object, section :string) :Object => {
  let newFormData = formData;

  const entityProperties = getEntityProperties(existingPerson, [DOB, ETHNICITY, FIRST_NAME, LAST_NAME, RACE, SEX]);
  Object.entries(entityProperties).forEach(([propertyFQN, value]) => {
    newFormData = setIn(newFormData, [section, getEntityAddressKey(0, PEOPLE, propertyFQN)], value);
  });
  return newFormData;
};

export {
  hydrateSchema,
  setPersonValues,
};
