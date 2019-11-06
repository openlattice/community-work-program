// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const { DIVERSION_PLAN } = APP_TYPE_FQNS;
const {
  CHECK_IN_DATETIME,
  DATETIME_END,
  DATETIME_RECEIVED,
  ORIENTATION_DATETIME,
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
        [getEntityAddressKey(0, DIVERSION_PLAN, DATETIME_END)]: {
          type: 'string',
          title: 'Sentence end date',
          format: 'date',
        },
        [getEntityAddressKey(0, DIVERSION_PLAN, CHECK_IN_DATETIME)]: {
          type: 'string',
          title: 'Check-in date',
          format: 'date',
        },
        [getEntityAddressKey(0, DIVERSION_PLAN, ORIENTATION_DATETIME)]: {
          type: 'string',
          title: 'Orientation date',
          format: 'date',
        },
      },
    }
  }
};

export const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, DIVERSION_PLAN, DATETIME_RECEIVED)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, DIVERSION_PLAN, DATETIME_END)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, DIVERSION_PLAN, CHECK_IN_DATETIME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, DIVERSION_PLAN, ORIENTATION_DATETIME)]: {
      classNames: 'column-span-4',
    },
    'ui:options': { editable: true },
  },
};
