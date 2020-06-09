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
    newUiSchema = setIn(
      newUiSchema,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, LAST_NAME), 'ui:disabled'],
      true
    );
    newUiSchema = setIn(
      newUiSchema,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, FIRST_NAME), 'ui:disabled'],
      true
    );
    newUiSchema = setIn(
      newUiSchema,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, DOB), 'ui:disabled'],
      true
    );
    newUiSchema = setIn(
      newUiSchema,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, RACE), 'ui:disabled'],
      true
    );
    newUiSchema = setIn(
      newUiSchema,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, ETHNICITY), 'ui:disabled'],
      true
    );
    newUiSchema = setIn(
      newUiSchema,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, PEOPLE, SEX), 'ui:disabled'],
      true
    );
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
  const {
    [DOB]: dob, [ETHNICITY]: ethnicity, [FIRST_NAME]: firstName, [LAST_NAME]: lastName, [RACE]: race, [SEX]: sex
  } = getEntityProperties(existingPerson, [
    DOB,
    ETHNICITY,
    FIRST_NAME,
    LAST_NAME,
    RACE,
    SEX,
  ]);
  let newFormData = setIn(formData, [section, getEntityAddressKey(0, PEOPLE, LAST_NAME)], lastName);
  newFormData = setIn(newFormData, [section, getEntityAddressKey(0, PEOPLE, FIRST_NAME)], firstName);
  newFormData = setIn(newFormData, [section, getEntityAddressKey(0, PEOPLE, DOB)], dob);
  newFormData = setIn(newFormData, [section, getEntityAddressKey(0, PEOPLE, RACE)], race);
  newFormData = setIn(newFormData, [section, getEntityAddressKey(0, PEOPLE, ETHNICITY)], ethnicity);
  newFormData = setIn(newFormData, [section, getEntityAddressKey(0, PEOPLE, SEX)], sex);
  return newFormData;
};

export {
  hydrateSchema,
  setPersonValues,
};
