// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  COURT_TYPES,
  ETHNICITY_VALUES,
  RACE_VALUES,
  SEX_VALUES,
  USA_STATES,
} from '../../../core/edm/constants/DataModelConsts';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const {
  ADDRESS,
  CHARGE_EVENT,
  CONTACT_INFORMATION,
  COURT_CHARGE_LIST,
  DIVERSION_PLAN,
  JUDGES,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
} = APP_TYPE_FQNS;
const {
  CASE_NUMBER_TEXT,
  CITY,
  COURT_CASE_TYPE,
  DATETIME_COMPLETED,
  DATETIME_RECEIVED,
  DOB,
  EMAIL,
  ENTITY_KEY_ID,
  ETHNICITY,
  FIRST_NAME,
  FULL_ADDRESS,
  LAST_NAME,
  PERSON_NOTES,
  PHONE_NUMBER,
  RACE,
  REQUIRED_HOURS,
  SEX,
  STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

export const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: {
          type: 'string',
          title: 'Last name',
        },
        [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: {
          type: 'string',
          title: 'First name',
        },
        [getEntityAddressKey(0, PEOPLE, DOB)]: {
          type: 'string',
          title: 'Date of birth',
          format: 'date',
        },
        [getEntityAddressKey(0, PEOPLE, RACE)]: {
          type: 'string',
          title: 'Race',
          enum: RACE_VALUES,
        },
        [getEntityAddressKey(0, PEOPLE, ETHNICITY)]: {
          type: 'string',
          title: 'Ethnicity',
          enum: ETHNICITY_VALUES,
        },
        [getEntityAddressKey(0, PEOPLE, SEX)]: {
          type: 'string',
          title: 'Sex',
          enum: SEX_VALUES,
        },
        [getEntityAddressKey(0, PEOPLE, PERSON_NOTES)]: {
          type: 'string',
          title: 'Profile Notes',
          format: 'textarea'
        },
      }
    },
    [getPageSectionKey(1, 2)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)]: {
          type: 'string',
          title: 'Phone number',
        },
        [getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)]: {
          type: 'string',
          title: 'Email',
        },
        [getEntityAddressKey(0, ADDRESS, FULL_ADDRESS)]: {
          type: 'string',
          title: 'Street Address',
        },
        [getEntityAddressKey(0, ADDRESS, CITY)]: {
          type: 'string',
          title: 'City',
        },
        [getEntityAddressKey(0, ADDRESS, STATE)]: {
          type: 'string',
          title: 'State',
          enum: USA_STATES,
        },
        [getEntityAddressKey(0, ADDRESS, ZIP)]: {
          type: 'string',
          title: 'Zip Code',
        },
      }
    },
    [getPageSectionKey(1, 3)]: {
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
    [getPageSectionKey(1, 4)]: {
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
    [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, DOB)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, RACE)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, ETHNICITY)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, SEX)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, PERSON_NOTES)]: {
      classNames: 'column-span-12'
    }
  },
  [getPageSectionKey(1, 2)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, ADDRESS, FULL_ADDRESS)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, ADDRESS, CITY)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, ADDRESS, STATE)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, ADDRESS, ZIP)]: {
      classNames: 'column-span-4',
    },
  },
  [getPageSectionKey(1, 3)]: {
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
  [getPageSectionKey(1, 4)]: {
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
