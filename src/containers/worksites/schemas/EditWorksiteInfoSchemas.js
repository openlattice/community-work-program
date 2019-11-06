// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import {
  ADDRESS_FQNS,
  APP_TYPE_FQNS,
  CONTACT_INFO_FQNS,
  PEOPLE_FQNS,
  WORKSITE_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const { FULL_ADDRESS } = ADDRESS_FQNS;
const {
  ADDRESS,
  CONTACT_INFORMATION,
  STAFF,
  WORKSITE,
} = APP_TYPE_FQNS;
const { EMAIL, PHONE_NUMBER } = CONTACT_INFO_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  NAME,
} = WORKSITE_FQNS;

const worksiteSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, WORKSITE, NAME)]: {
          type: 'string',
          title: 'Work site name',
        },
        [getEntityAddressKey(0, WORKSITE, DATETIME_START)]: {
          type: 'string',
          title: 'Date first active',
        },
        [getEntityAddressKey(0, WORKSITE, DATETIME_END)]: {
          type: 'string',
          title: 'Date marked inactive',
        },
        [getEntityAddressKey(0, WORKSITE, DESCRIPTION)]: {
          type: 'string',
          title: 'Available work',
          format: 'textarea'
        },
      }
    },
  },
};

const worksiteUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, WORKSITE, NAME)]: {
      classNames: 'column-span-4'
    },
    [getEntityAddressKey(0, WORKSITE, DATETIME_START)]: {
      classNames: 'column-span-4'
    },
    [getEntityAddressKey(0, WORKSITE, DATETIME_END)]: {
      classNames: 'column-span-4'
    },
    [getEntityAddressKey(0, WORKSITE, DESCRIPTION)]: {
      classNames: 'column-span-12'
    },
    'ui:options': { editable: true },
  },
};

const contactsSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: 'Contact name',
      properties: {
        [getEntityAddressKey(0, STAFF, FIRST_NAME)]: {
          type: 'string',
          title: 'First name',
        },
        [getEntityAddressKey(0, STAFF, LAST_NAME)]: {
          type: 'string',
          title: 'Last name',
        },
      }
    },
    [getPageSectionKey(1, 2)]: {
      type: 'object',
      title: 'Contact methods',
      properties: {
        [getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)]: {
          type: 'string',
          title: 'Phone number',
        },
        [getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)]: {
          type: 'string',
          title: 'Email',
        },
      }
    },
  },
};

const contactsUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, STAFF, FIRST_NAME)]: {
      classNames: 'column-span-6'
    },
    [getEntityAddressKey(0, STAFF, LAST_NAME)]: {
      classNames: 'column-span-6'
    },
    'ui:options': { editable: true },
  },
  [getPageSectionKey(1, 2)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)]: {
      classNames: 'column-span-6'
    },
    [getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)]: {
      classNames: 'column-span-6'
    },
    'ui:options': { editable: true },
  },
};

const addressSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, ADDRESS, FULL_ADDRESS)]: {
          type: 'string',
          title: 'Full address',
        },
      }
    }
  },
};

const addressUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, ADDRESS, FULL_ADDRESS)]: {
      classNames: 'column-span-6'
    },
    'ui:options': { editable: true },
  },
};

export {
  addressSchema,
  addressUiSchema,
  contactsSchema,
  contactsUiSchema,
  worksiteSchema,
  worksiteUiSchema,
};
