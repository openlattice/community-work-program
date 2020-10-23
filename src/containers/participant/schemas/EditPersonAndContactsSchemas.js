// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { RACE_VALUES, SEX_VALUES, USA_STATES } from '../../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

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
  US_STATE,
  ZIP,
} = PROPERTY_TYPE_FQNS;

const personSchema = {
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

const personUiSchema = {
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

const phoneSchema = {
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
  }
};

const phoneUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER)]: {
      classNames: 'column-span-6',
    },
    'ui:options': { editable: true },
  },
};

const emailSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, CONTACT_INFORMATION, EMAIL)]: {
          type: 'string',
          title: 'Email address',
        },
      }
    },
  }
};

const emailUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, CONTACT_INFORMATION, EMAIL)]: {
      classNames: 'column-span-6',
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
  }
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

const personPhotoSchema = {
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

const personPhotoUiSchema = {
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

export {
  addressSchema,
  addressUiSchema,
  emailSchema,
  emailUiSchema,
  personPhotoSchema,
  personPhotoUiSchema,
  personSchema,
  personUiSchema,
  phoneSchema,
  phoneUiSchema,
};
