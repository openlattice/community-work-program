// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { COURT_TYPES } from '../../../core/edm/constants/DataModelConsts';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const {
  CHARGE_EVENT,
  COURT_CHARGE_LIST,
  DIVERSION_PLAN,
  JUDGES,
  MANUAL_PRETRIAL_COURT_CASES,
} = APP_TYPE_FQNS;
const {
  CASE_NUMBER_TEXT,
  COURT_CASE_TYPE,
  DATETIME_COMPLETED,
  DATETIME_RECEIVED,
  ENTITY_KEY_ID,
  REQUIRED_HOURS,
} = PROPERTY_TYPE_FQNS;

export const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, DIVERSION_PLAN, DATETIME_RECEIVED)]: {
          type: 'string',
          title: 'Sentence date',
          format: 'date',
        },
        [getEntityAddressKey(0, DIVERSION_PLAN, REQUIRED_HOURS)]: {
          type: 'number',
          title: 'Required hours',
        },
        [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, COURT_CASE_TYPE)]: {
          type: 'string',
          title: 'Court type',
          enum: COURT_TYPES
        },
        [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)]: {
          type: 'string',
          title: 'Docket number',
        },
        [getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)]: {
          type: 'string',
          title: 'Judge',
          enum: [],
          enumNames: [],
        }
      }
    },
    [getPageSectionKey(1, 2)]: {
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
          [getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)]: {
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

export const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, DIVERSION_PLAN, DATETIME_RECEIVED)]: {
      classNames: 'column-span-6'
    },
    [getEntityAddressKey(0, DIVERSION_PLAN, REQUIRED_HOURS)]: {
      classNames: 'column-span-6'
    },
    [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, COURT_CASE_TYPE)]: {
      classNames: 'column-span-4'
    },
    [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)]: {
      classNames: 'column-span-4'
    },
    [getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)]: {
      classNames: 'column-span-4',
    },
  },
  [getPageSectionKey(1, 2)]: {
    classNames: 'column-span-12',
    'ui:options': {
      addButtonText: '+ Add Charge',
      orderable: false,
      addActionKey: 'addCharge'
    },
    items: {
      classNames: 'grid-container',
      [getEntityAddressKey(-1, COURT_CHARGE_LIST, ENTITY_KEY_ID)]: {
        classNames: 'column-span-8',
      },
      [getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)]: {
        classNames: 'column-span-4',
      },
    },
  }
};
