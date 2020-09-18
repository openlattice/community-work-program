// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { USA_STATES } from '../../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const {
  ADDRESS,
  CONTACT_INFORMATION,
  STAFF,
  WORKSITE,
} = APP_TYPE_FQNS;
const {
  CITY,
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  EMAIL,
  FIRST_NAME,
  FULL_ADDRESS,
  LAST_NAME,
  NAME,
  NOTES,
  PHONE_NUMBER,
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

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
          format: 'date'
        },
        [getEntityAddressKey(0, WORKSITE, DATETIME_END)]: {
          type: 'string',
          title: 'Date marked inactive',
          format: 'date'
        },
        [getEntityAddressKey(0, WORKSITE, DESCRIPTION)]: {
          type: 'string',
          title: 'Available work',
          format: 'textarea'
        },
        [getEntityAddressKey(0, WORKSITE, NOTES)]: {
          type: 'string',
          title: 'Notes',
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
    [getEntityAddressKey(0, WORKSITE, NOTES)]: {
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
      type: 'array',
      title: '',
      items: {
        type: 'object',
        properties: {
          [getEntityAddressKey(-1, STAFF, FIRST_NAME)]: {
            type: 'string',
            title: 'First name',
          },
          [getEntityAddressKey(-1, STAFF, LAST_NAME)]: {
            type: 'string',
            title: 'Last name',
          },
          [getEntityAddressKey(-1, CONTACT_INFORMATION, PHONE_NUMBER)]: {
            type: 'string',
            title: 'Phone number',
          },
          [getEntityAddressKey(-2, CONTACT_INFORMATION, EMAIL)]: {
            type: 'string',
            title: 'Email',
          },
        }
      },
      default: [{}]
    },
  },
};

const contactsUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12',
    'ui:options': {
      addButtonText: '+ Add Contact',
      orderable: false,
      addActionKey: 'addContact'
    },
    items: {
      classNames: 'grid-container',
      [getEntityAddressKey(-1, STAFF, FIRST_NAME)]: {
        classNames: 'column-span-6'
      },
      [getEntityAddressKey(-1, STAFF, LAST_NAME)]: {
        classNames: 'column-span-6'
      },
      [getEntityAddressKey(-1, CONTACT_INFORMATION, PHONE_NUMBER)]: {
        classNames: 'column-span-6'
      },
      [getEntityAddressKey(-2, CONTACT_INFORMATION, EMAIL)]: {
        classNames: 'column-span-6'
      },
      'ui:options': {
        editable: true
      }
    }
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
          title: 'Street Address',
        },
        [getEntityAddressKey(0, ADDRESS, CITY)]: {
          type: 'string',
          title: 'City',
        },
        [getEntityAddressKey(0, ADDRESS, US_STATE)]: {
          type: 'string',
          title: 'State',
          enum: USA_STATES,
        },
        [getEntityAddressKey(0, ADDRESS, ZIP)]: {
          type: 'string',
          title: 'Zip Code',
        },
      }
    }
  },
};

const addressUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, ADDRESS, FULL_ADDRESS)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, ADDRESS, CITY)]: {
      classNames: 'column-span-3',
    },
    [getEntityAddressKey(0, ADDRESS, US_STATE)]: {
      classNames: 'column-span-2',
    },
    [getEntityAddressKey(0, ADDRESS, ZIP)]: {
      classNames: 'column-span-3',
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
