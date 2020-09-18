// @flow
import { List, removeIn, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getValuesFromEntityList } from '../../../utils/DataUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { ARREST_CHARGE_LIST, MANUAL_ARREST_CHARGES, JUDGES } = APP_TYPE_FQNS;
const {
  ENTITY_KEY_ID,
  FIRST_NAME,
  LAST_NAME,
  LEVEL_STATE,
  NAME,
  OFFENSE_LOCAL_CODE,
  OFFENSE_LOCAL_DESCRIPTION,
  OL_ID,
} = PROPERTY_TYPE_FQNS;

/* eslint-disable import/prefer-default-export */
export const hydrateSchema = (
  schema :Object,
  judges :List,
  existingArrestChargesFromPSA :List,
  arrestCharges :List
) => {
  const [judgesValues, judgesLabels] = getValuesFromEntityList(judges, [FIRST_NAME, LAST_NAME]);
  const [existingChargesValues, existingChargesLabels] = getValuesFromEntityList(
    existingArrestChargesFromPSA,
    [OFFENSE_LOCAL_CODE, OFFENSE_LOCAL_DESCRIPTION]
  );
  const [arrestChargesValues, arrestChargesLabels] = getValuesFromEntityList(arrestCharges, [OL_ID, NAME, LEVEL_STATE]);
  let newSchema = setIn(
    schema,
    [
      'properties',
      getPageSectionKey(1, 1),
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
      getPageSectionKey(1, 1),
      'properties',
      getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID),
      'enumNames'
    ],
    judgesLabels
  );
  if (existingChargesValues.length && existingChargesLabels.length) {
    newSchema = setIn(
      newSchema,
      [
        'properties',
        getPageSectionKey(1, 2),
        'items',
        'properties',
        getEntityAddressKey(-1, MANUAL_ARREST_CHARGES, ENTITY_KEY_ID),
        'enum'
      ],
      existingChargesValues
    );
    newSchema = setIn(
      newSchema,
      [
        'properties',
        getPageSectionKey(1, 2),
        'items',
        'properties',
        getEntityAddressKey(-1, MANUAL_ARREST_CHARGES, ENTITY_KEY_ID),
        'enumNames'
      ],
      existingChargesLabels
    );
  }
  else {
    newSchema = removeIn(newSchema, ['properties', getPageSectionKey(1, 2)]);
  }
  newSchema = setIn(
    newSchema,
    [
      'properties',
      getPageSectionKey(1, 3),
      'items',
      'properties',
      getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID),
      'enum'
    ],
    arrestChargesValues
  );
  newSchema = setIn(
    newSchema,
    [
      'properties',
      getPageSectionKey(1, 3),
      'items',
      'properties',
      getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID),
      'enumNames'
    ],
    arrestChargesLabels
  );

  return newSchema;
};
