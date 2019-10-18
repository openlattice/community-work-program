// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, CHARGE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const { COURT_CHARGE_LIST } = APP_TYPE_FQNS;
const { NAME, OL_ID } = CHARGE_FQNS;

export const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, COURT_CHARGE_LIST, OL_ID)]: {
          type: 'string',
          title: 'Statute no.',
        },
        [getEntityAddressKey(0, COURT_CHARGE_LIST, NAME)]: {
          type: 'string',
          title: 'Description',
        },
      }
    },
  },
};

export const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, COURT_CHARGE_LIST, OL_ID)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, COURT_CHARGE_LIST, NAME)]: {
      classNames: 'column-span-8',
    },
    'ui:options': { editable: true },
  },
};
