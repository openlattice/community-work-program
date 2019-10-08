// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  CHARGE_FQNS,
  DATETIME_COMPLETED,
  DIVERSION_PLAN_FQNS,
  ENTITY_KEY_ID,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { COURT_TYPES } from '../../../core/edm/constants/DataModelConsts';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const {
  CHARGE_EVENT,
  DIVERSION_PLAN,
  JUDGES,
  MANUAL_COURT_CHARGES,
  MANUAL_PRETRIAL_COURT_CASES,
} = APP_TYPE_FQNS;
const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;
const { REQUIRED_HOURS } = DIVERSION_PLAN_FQNS;
const { CHARGE_LEVEL, OFFENSE_CHARGE_DESCRIPTION } = CHARGE_FQNS;

export const judgeSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)]: {
          type: 'string',
          title: 'Judge',
          enum: [],
          enumNames: [],
        }
      }
    },
  },
};

export const judgeUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)]: {
      classNames: 'column-span-4',
    },
    'ui:options': { editable: true },
  },
};

export const caseSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, COURT_CASE_TYPE)]: {
          type: 'string',
          title: 'Court type',
          enum: COURT_TYPES
        },
        [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)]: {
          type: 'string',
          title: 'Docket number',
        },
      }
    },
  }
};

export const caseUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, COURT_CASE_TYPE)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)]: {
      classNames: 'column-span-4',
    },
    'ui:options': { editable: true },
  },
};

export const chargeSchema = {
  definitions: {
    charges: {
      type: 'object',
      properties: {
        [getEntityAddressKey(0, MANUAL_COURT_CHARGES, OFFENSE_CHARGE_DESCRIPTION)]: {
          type: 'string',
          title: 'Charge',
        },
        [getEntityAddressKey(0, MANUAL_COURT_CHARGES, CHARGE_LEVEL)]: {
          type: 'string',
          title: 'Charge level',
        },
        [getEntityAddressKey(0, CHARGE_EVENT, DATETIME_COMPLETED)]: {
          type: 'string',
          title: 'Date charged',
          format: 'date',
        },
      },
      required: [
        getEntityAddressKey(0, MANUAL_COURT_CHARGES, OFFENSE_CHARGE_DESCRIPTION),
        getEntityAddressKey(0, CHARGE_EVENT, DATETIME_COMPLETED)
      ]
    }
  },
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'array',
      title: '',
      items: {
        $ref: '#/definitions/charges'
      },
      default: [{}]
    },
  }
};

export const chargeUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12',
    'ui:options': {
      addButtonText: '+ Add Charge',
      editable: true,
      orderable: false,
    },
    items: {
      classNames: 'column-span-12 grid-container',
      [getEntityAddressKey(0, MANUAL_COURT_CHARGES, OFFENSE_CHARGE_DESCRIPTION)]: {
        classNames: 'column-span-4',
      },
      [getEntityAddressKey(0, MANUAL_COURT_CHARGES, CHARGE_LEVEL)]: {
        classNames: 'column-span-4',
      },
      [getEntityAddressKey(0, CHARGE_EVENT, DATETIME_COMPLETED)]: {
        classNames: 'column-span-4',
      },
    },
  },
};

export const requiredHoursSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, DIVERSION_PLAN, REQUIRED_HOURS)]: {
          type: 'number',
          title: 'Required hours',
        },
      }
    },
  }
};

export const requiredHoursUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, DIVERSION_PLAN, REQUIRED_HOURS)]: {
      classNames: 'column-span-4',
    },
    'ui:options': { editable: true },
  },
};
