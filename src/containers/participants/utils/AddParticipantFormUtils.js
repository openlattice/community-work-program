// @flow
import { List, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getValuesFromEntityList } from '../../../utils/DataUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { ARREST_CHARGE_LIST, JUDGES } = APP_TYPE_FQNS;
const {
  ENTITY_KEY_ID,
  FIRST_NAME,
  LAST_NAME,
  LEVEL_STATE,
  NAME,
  OL_ID,
} = PROPERTY_TYPE_FQNS;

/* eslint-disable import/prefer-default-export */
export const hydrateSchema = (schema :Object, judges :List, charges :List) => {
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

  return newSchema;
};
