// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import {
  APP_TYPE_FQNS,
  DATETIME_END,
  INCIDENT_START_DATETIME
} from '../../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const {
  APPOINTMENT,
} = APP_TYPE_FQNS;

export const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        person: {
          type: 'string',
          title: 'Name',
        },
        worksite: {
          type: 'string',
          title: 'Work site',
        },
        date: {
          type: 'string',
          title: 'Date',
          format: 'date',
        },
        startTime: {
          type: 'string',
          title: 'Start time',
          format: 'time',
        },
        endTime: {
          type: 'string',
          title: 'End time',
          format: 'time',
        }
      }
    },
  },
};

export const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    person: {
      classNames: 'column-span-6',
      'ui:disabled': true,
    },
    worksite: {
      classNames: 'column-span-6',
      'ui:disabled': true,
    },
    date: {
      classNames: 'column-span-12',
    },
    startTime: {
      classNames: 'column-span-12',
    },
    endTime: {
      classNames: 'column-span-12',
    },
  },
  'ui:options': { editable: true },
};
