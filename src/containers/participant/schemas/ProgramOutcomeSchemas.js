// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const { ENROLLMENT_STATUS, PROGRAM_OUTCOME } = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  DESCRIPTION,
  HOURS_WORKED,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const ENROLLMENT_STATUS_OPTIONS = [
  ENROLLMENT_STATUSES.CLOSED,
  ENROLLMENT_STATUSES.COMPLETED,
  ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT,
  ENROLLMENT_STATUSES.SUCCESSFUL,
  ENROLLMENT_STATUSES.UNSUCCESSFUL,
];

export const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: {
          type: 'string',
          title: 'Result',
          enum: ENROLLMENT_STATUS_OPTIONS,
        },
        [getEntityAddressKey(0, PROGRAM_OUTCOME, DATETIME_COMPLETED)]: {
          type: 'string',
          title: 'Date Completed',
          format: 'date',
        },
        [getEntityAddressKey(0, PROGRAM_OUTCOME, HOURS_WORKED)]: {
          type: 'string',
          title: 'Total Hours Worked',
        },
        [getEntityAddressKey(0, PROGRAM_OUTCOME, DESCRIPTION)]: {
          type: 'string',
          title: 'Notes',
          format: 'textarea',
        },
      },
    }
  }
};

export const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    'ui:options': { editable: true },
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: {
      classNames: 'column-span-12',
    },
    [getEntityAddressKey(0, PROGRAM_OUTCOME, DATETIME_COMPLETED)]: {
      classNames: 'column-span-12',
    },
    [getEntityAddressKey(0, PROGRAM_OUTCOME, HOURS_WORKED)]: {
      classNames: 'column-span-12',
    },
    [getEntityAddressKey(0, PROGRAM_OUTCOME, DESCRIPTION)]: {
      classNames: 'column-span-12',
    },
  },
};
