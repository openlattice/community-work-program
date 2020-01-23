// @flow
import { List, setIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { getValuesFromEntityList } from '../../../../utils/DataUtils';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const {
  ARREST_CHARGE_LIST,
  MANUAL_ARREST_CHARGES,
  COURT_CHARGE_LIST,
  JUDGES,
} = APP_TYPE_FQNS;
const {
  ENTITY_KEY_ID,
  FIRST_NAME,
  LAST_NAME,
  LEVEL_STATE,
  NAME,
  OFFENSE_LOCAL_DESCRIPTION,
  OL_ID,
} = PROPERTY_TYPE_FQNS;

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

const disableJudgeForm = (uiSchema :Object) :Object => {
  const newUiSchema = setIn(
    uiSchema,
    [
      getPageSectionKey(1, 1),
      'ui:options',
      'editable'
    ],
    false
  );
  return newUiSchema;
};

const hydrateCourtChargeSchema = (schema :Object, charges :List) => {
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

const disableChargesForm = (uiSchema :Object) :Object => { // change to handle two page sections for arrest
  const newUiSchema = setIn(
    uiSchema,
    [
      getPageSectionKey(1, 1),
      'ui:options',
      'addable'
    ],
    false
  );
  return newUiSchema;
};

const hydrateArrestChargeSchema = (schema :Object, existingCharges :List, arrestCharges :List) => {
  // const [values, labels] = getValuesFromEntityList(existingCharges, [OFFENSE_LOCAL_DESCRIPTION]);
  // let newSchema = setIn(
  //   schema,
  //   [
  //     'properties',
  //     getPageSectionKey(1, 1),
  //     'items',
  //     'properties',
  //     getEntityAddressKey(-1, MANUAL_ARREST_CHARGES, ENTITY_KEY_ID),
  //     'enum'
  //   ],
  //   values
  // );
  // newSchema = setIn(
  //   newSchema,
  //   [
  //     'properties',
  //     getPageSectionKey(1, 1),
  //     'items',
  //     'properties',
  //     getEntityAddressKey(-1, MANUAL_ARREST_CHARGES, ENTITY_KEY_ID),
  //     'enumNames'
  //   ],
  //   labels
  // );
  const [arrestValues, arrestLabels] = getValuesFromEntityList(arrestCharges, [OL_ID, NAME, LEVEL_STATE]);
  let newSchema = setIn(
    schema,
    [
      'properties',
      getPageSectionKey(1, 2),
      'items',
      'properties',
      getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID),
      'enum'
    ],
    arrestValues
  );
  newSchema = setIn(
    newSchema,
    [
      'properties',
      getPageSectionKey(1, 2),
      'items',
      'properties',
      getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID),
      'enumNames'
    ],
    arrestLabels
  );

  return newSchema;
};

export {
  disableChargesForm,
  disableJudgeForm,
  hydrateArrestChargeSchema,
  hydrateCourtChargeSchema,
  hydrateJudgeSchema,
};
