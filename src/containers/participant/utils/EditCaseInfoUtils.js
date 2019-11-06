// @flow
import { List, Map, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import type { FQN } from 'lattice';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId, getFirstNeighborValue } from '../../../utils/DataUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { COURT_CHARGE_LIST, JUDGES } = APP_TYPE_FQNS;
const {
  ENTITY_KEY_ID,
  FIRST_NAME,
  LAST_NAME,
  NAME,
} = PROPERTY_TYPE_FQNS;

const getValuesFromEntityList = (entities :List, propertyList :FQN[]) => {

  const values = [];
  const labels = [];
  entities.forEach((entity :Map) => {

    let label :string = '';
    propertyList.forEach((propertyType) => {
      const backUpValue = entity.get(propertyType, '');
      const property = getFirstNeighborValue(entity, propertyType, backUpValue);
      label = label.concat(' ', property);
    });
    const entityEKID :UUID = getEntityKeyId(entity);

    labels.push(label);
    values.push(entityEKID);
  });

  return [values, labels];
};

const hydrateJudgeSchema = (schema :Object, judges :List) => {
  const [values, labels] = getValuesFromEntityList(judges, [FIRST_NAME, LAST_NAME]);
  let newSchema = setIn(
    schema,
    [
      'properties',
      getPageSectionKey(1, 1),
      'properties',
      getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID),
      'enum'
    ],
    values
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
    labels
  );

  return newSchema;
};

const hydrateChargeSchema = (schema :Object, charges :List) => {
  const [values, labels] = getValuesFromEntityList(charges, [NAME]);
  let newSchema = setIn(
    schema,
    [
      'properties',
      getPageSectionKey(1, 1),
      'items',
      'properties',
      getEntityAddressKey(-1, COURT_CHARGE_LIST, ENTITY_KEY_ID),
      'enum'
    ],
    values
  );
  newSchema = setIn(
    newSchema,
    [
      'properties',
      getPageSectionKey(1, 1),
      'items',
      'properties',
      getEntityAddressKey(-1, COURT_CHARGE_LIST, ENTITY_KEY_ID),
      'enumNames'
    ],
    labels
  );

  return newSchema;
};

export {
  getValuesFromEntityList,
  hydrateChargeSchema,
  hydrateJudgeSchema,
};
