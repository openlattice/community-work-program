// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';
import { INFRACTIONS_CONSTS } from '../../../../core/edm/constants/DataModelConsts';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { INFRACTION_EVENT } = APP_TYPE_FQNS;
const { DATETIME_COMPLETED, NOTES, TYPE } = PROPERTY_TYPE_FQNS;

const INFRACTION_OPTIONS :string[] = [
  INFRACTIONS_CONSTS.VIOLATION,
  INFRACTIONS_CONSTS.WARNING,
];

export const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        infractionCategory: {
          type: 'string',
          title: 'Infraction category',
        },
        [getEntityAddressKey(0, INFRACTION_EVENT, DATETIME_COMPLETED)]: {
          type: 'string',
          title: 'Date of infraction',
          format: 'date',
        },
        time: {
          type: 'string',
          title: 'Time of infraction',
        },
        [getEntityAddressKey(0, INFRACTION_EVENT, TYPE)]: {
          type: 'string',
          title: 'Infraction type',
          enum: INFRACTION_OPTIONS
        },
        [getEntityAddressKey(0, INFRACTION_EVENT, NOTES)]: {
          type: 'string',
          title: 'Notes',
          format: 'textarea'
        },
      }
    },
  },
};

export const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    infractionCategory: {
      classNames: 'column-span-6',
      'ui:disabled': true,
    },
    [getEntityAddressKey(0, INFRACTION_EVENT, DATETIME_COMPLETED)]: {
      classNames: 'column-span-6',
    },
    time: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
    [getEntityAddressKey(0, INFRACTION_EVENT, TYPE)]: {
      classNames: 'column-span-6',
    },
    [getEntityAddressKey(0, INFRACTION_EVENT, NOTES)]: {
      classNames: 'column-span-12',
    },
    // 'ui:options': { editable: true },
  },
};
