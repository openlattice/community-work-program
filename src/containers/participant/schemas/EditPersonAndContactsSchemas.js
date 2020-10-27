// @flow
import {
  CITY_EAK,
  EDIT_FORMS_PSK,
  EMAIL_EAK,
  FULL_ADDRESS_EAK,
  IMAGE_DATA_EAK,
  PERSON_DOB_EAK,
  PERSON_ETHNICITY_EAK,
  PERSON_FIRST_NAME_EAK,
  PERSON_LAST_NAME_EAK,
  PERSON_RACE_EAK,
  PERSON_SEX_EAK,
  PHONE_EAK,
  US_STATE_EAK,
  ZIP_EAK,
} from './SchemaConstants';

import { RACE_VALUES, SEX_VALUES, USA_STATES } from '../../../core/edm/constants/DataModelConsts';

const personSchema = {
  type: 'object',
  title: '',
  properties: {
    [EDIT_FORMS_PSK]: {
      type: 'object',
      title: '',
      properties: {
        [PERSON_FIRST_NAME_EAK]: {
          type: 'string',
          title: 'First name',
        },
        [PERSON_LAST_NAME_EAK]: {
          type: 'string',
          title: 'Last name',
        },
        [PERSON_DOB_EAK]: {
          type: 'string',
          title: 'Date of birth',
          format: 'date',
        },
        [PERSON_RACE_EAK]: {
          type: 'string',
          title: 'Race',
          enum: RACE_VALUES,
        },
        [PERSON_ETHNICITY_EAK]: {
          type: 'string',
          title: 'Ethnicity',
        },
        [PERSON_SEX_EAK]: {
          type: 'string',
          title: 'Sex',
          enum: SEX_VALUES,
        },
      }
    },
  },
};

const personUiSchema = {
  [EDIT_FORMS_PSK]: {
    classNames: 'column-span-12 grid-container',
    [PERSON_FIRST_NAME_EAK]: {
      classNames: 'column-span-4',
    },
    [PERSON_LAST_NAME_EAK]: {
      classNames: 'column-span-4',
    },
    [PERSON_DOB_EAK]: {
      classNames: 'column-span-4',
    },
    [PERSON_RACE_EAK]: {
      classNames: 'column-span-4',
    },
    [PERSON_ETHNICITY_EAK]: {
      classNames: 'column-span-4',
    },
    [PERSON_SEX_EAK]: {
      classNames: 'column-span-4',
    },
    'ui:options': { editable: true },
  },
};

const phoneSchema = {
  type: 'object',
  title: '',
  properties: {
    [EDIT_FORMS_PSK]: {
      type: 'object',
      title: '',
      properties: {
        [PHONE_EAK]: {
          type: 'string',
          title: 'Phone number',
        },
      }
    },
  }
};

const phoneUiSchema = {
  [EDIT_FORMS_PSK]: {
    classNames: 'column-span-12 grid-container',
    [PHONE_EAK]: {
      classNames: 'column-span-6',
    },
    'ui:options': { editable: true },
  },
};

const emailSchema = {
  type: 'object',
  title: '',
  properties: {
    [EDIT_FORMS_PSK]: {
      type: 'object',
      title: '',
      properties: {
        [EMAIL_EAK]: {
          type: 'string',
          title: 'Email address',
        },
      }
    },
  }
};

const emailUiSchema = {
  [EDIT_FORMS_PSK]: {
    classNames: 'column-span-12 grid-container',
    [EMAIL_EAK]: {
      classNames: 'column-span-6',
    },
    'ui:options': { editable: true },
  },
};

const addressSchema = {
  type: 'object',
  title: '',
  properties: {
    [EDIT_FORMS_PSK]: {
      type: 'object',
      title: '',
      properties: {
        [FULL_ADDRESS_EAK]: {
          type: 'string',
          title: 'Street Address',
        },
        [CITY_EAK]: {
          type: 'string',
          title: 'City',
        },
        [US_STATE_EAK]: {
          type: 'string',
          title: 'State',
          enum: USA_STATES,
        },
        [ZIP_EAK]: {
          type: 'string',
          title: 'Zip Code',
        },
      }
    }
  }
};

const addressUiSchema = {
  [EDIT_FORMS_PSK]: {
    classNames: 'column-span-12 grid-container',
    [FULL_ADDRESS_EAK]: {
      classNames: 'column-span-4',
    },
    [CITY_EAK]: {
      classNames: 'column-span-3',
    },
    [US_STATE_EAK]: {
      classNames: 'column-span-2',
    },
    [ZIP_EAK]: {
      classNames: 'column-span-3',
    },
    'ui:options': { editable: true },
  },
};

const personPhotoSchema = {
  title: '',
  type: 'object',
  properties: {
    [EDIT_FORMS_PSK]: {
      type: 'object',
      title: '',
      properties: {
        [IMAGE_DATA_EAK]: {
          type: 'string',
          format: 'data-url',
          title: 'Person photo'
        },
      }
    }
  }
};

const personPhotoUiSchema = {
  [EDIT_FORMS_PSK]: {
    classNames: 'column-span-12 grid-container',
    [IMAGE_DATA_EAK]: {
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
