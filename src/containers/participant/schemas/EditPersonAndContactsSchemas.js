// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import {
  ADDRESS_FQNS,
  APP_TYPE_FQNS,
  CONTACT_INFO_FQNS,
  PEOPLE_FQNS
} from '../../../core/edm/constants/FullyQualifiedNames';
import { RACE_VALUES, SEX_VALUES } from '../../../core/edm/constants/DataModelConsts';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const { LOCATION_ADDRESS } = ADDRESS_FQNS;
const { ADDRESS, CONTACT_INFORMATION, PEOPLE } = APP_TYPE_FQNS;
const { EMAIL, PHONE_NUMBER } = CONTACT_INFO_FQNS;
const {
  DOB,
  ETHNICITY,
  FIRST_NAME,
  LAST_NAME,
  RACE,
  SEX,
} = PEOPLE_FQNS;

export const personSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: {
          type: 'string',
          title: 'First name',
        },
        [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: {
          type: 'string',
          title: 'Last name',
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
        },
        [getEntityAddressKey(0, PEOPLE, SEX)]: {
          type: 'string',
          title: 'Sex',
          enum: SEX_VALUES,
        },
      }
    },
  },
};

export const personUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, PEOPLE, FIRST_NAME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, PEOPLE, LAST_NAME)]: {
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
    'ui:options': { editable: true },
  },
};

export const contactsSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
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
        [getEntityAddressKey(0, ADDRESS, LOCATION_ADDRESS)]: {
          type: 'string',
          title: 'Address',
        },
      }
    },
  }
};

export const contactsUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, ADDRESS, LOCATION_ADDRESS)]: {
      classNames: 'column-span-4',
    },
    'ui:options': { editable: true },
  },
};
