// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const { ARREST_CHARGE_LIST } = APP_TYPE_FQNS;
const { LEVEL_STATE, NAME, OL_ID } = PROPERTY_TYPE_FQNS;

export const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, ARREST_CHARGE_LIST, OL_ID)]: {
          type: 'string',
          title: 'Statute no.',
        },
        [getEntityAddressKey(0, ARREST_CHARGE_LIST, NAME)]: {
          type: 'string',
          title: 'Description',
        },
        [getEntityAddressKey(0, ARREST_CHARGE_LIST, LEVEL_STATE)]: {
          type: 'string',
          title: 'Level (shorthand)',
        },
      }
    },
  },
};

export const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, ARREST_CHARGE_LIST, OL_ID)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, ARREST_CHARGE_LIST, NAME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, ARREST_CHARGE_LIST, LEVEL_STATE)]: {
      classNames: 'column-span-4',
    },
    'ui:options': { editable: true },
  },
};
