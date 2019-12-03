// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { RACE_VALUES, SEX_VALUES, USA_STATES } from '../../../core/edm/constants/DataModelConsts';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const {
  ADDRESS,
  CONTACT_INFORMATION,
  IMAGE,
  PEOPLE,
} = APP_TYPE_FQNS;
const {
  CITY,
  DOB,
  EMAIL,
  ETHNICITY,
  FIRST_NAME,
  FULL_ADDRESS,
  IMAGE_DATA,
  LAST_NAME,
  PHONE_NUMBER,
  RACE,
  SEX,
  STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

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
      }
    },
    [getPageSectionKey(1, 2)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)]: {
          type: 'string',
          title: 'Email',
        },
      }
    },
    [getPageSectionKey(1, 3)]: {
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
    }
  }
};

export const contactsUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)]: {
      classNames: 'column-span-6',
    },
    'ui:options': { editable: true },
  },
  [getPageSectionKey(1, 2)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL)]: {
      classNames: 'column-span-6',
    },
    'ui:options': { editable: true },
  },
  [getPageSectionKey(1, 3)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, ADDRESS, FULL_ADDRESS)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, ADDRESS, CITY)]: {
      classNames: 'column-span-3',
    },
    [getEntityAddressKey(0, ADDRESS, STATE)]: {
      classNames: 'column-span-2',
    },
    [getEntityAddressKey(0, ADDRESS, ZIP)]: {
      classNames: 'column-span-3',
    },
    'ui:options': { editable: true },
  },
};

export const personPhotoSchema = {
  title: '',
  type: 'object',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, IMAGE, IMAGE_DATA)]: {
          type: 'string',
          format: 'data-url',
          title: 'Person photo'
        },
      }
    }
  }
};

export const personPhotoUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, IMAGE, IMAGE_DATA)]: {
      classNames: 'column-span-12',
      'ui:options': {
        accept: '.jpg'
      }
    }
  }
};
