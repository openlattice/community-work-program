// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  CHARGE_FQNS,
  DATETIME,
  DATETIME_COMPLETED,
  DIVERSION_PLAN_FQNS,
  ENTITY_KEY_ID,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { COURT_TYPES } from '../../../core/edm/constants/DataModelConsts';
import { CustomSelectWidget } from '../../../components/controls/index';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const {
  COURT_CHARGE_LIST,
  DIVERSION_PLAN,
  JUDGES,
  MANUAL_CHARGED_WITH,
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
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'array',
      title: '',
      items: {
        type: 'object',
        properties: {
          [getEntityAddressKey(-1, COURT_CHARGE_LIST, ENTITY_KEY_ID)]: {
            type: 'string',
            title: 'Court charge',
            enum: [],
            enumNames: [],
          },
          [getEntityAddressKey(-1, MANUAL_CHARGED_WITH, DATETIME)]: {
            type: 'string',
            title: 'Date charged',
            format: 'date',
          },
        },
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
      orderable: false,
    },
    items: {
      classNames: 'grid-container',
      'ui:options': {
        creatable: true,
        editable: true
      },
      [getEntityAddressKey(-1, COURT_CHARGE_LIST, ENTITY_KEY_ID)]: {
        classNames: 'column-span-8',
        'ui:widget': CustomSelectWidget,
      },
      [getEntityAddressKey(-1, MANUAL_CHARGED_WITH, DATETIME)]: {
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
