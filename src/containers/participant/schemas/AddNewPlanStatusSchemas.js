// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import { ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const { ENROLLMENT_STATUS, PROGRAM_OUTCOME } = APP_TYPE_FQNS;
const {
  DATETIME_COMPLETED,
  DESCRIPTION,
  EFFECTIVE_DATE,
  HOURS_WORKED,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const ENROLLMENT_STATUS_ENUM = Object.values(ENROLLMENT_STATUSES);

const COMPLETION_STATUSES :string[] = [
  ENROLLMENT_STATUSES.COMPLETED,
  ENROLLMENT_STATUSES.CLOSED,
  ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT,
  ENROLLMENT_STATUSES.SUCCESSFUL,
  ENROLLMENT_STATUSES.UNSUCCESSFUL
];

const ACTIVE_STATUSES :string[] = [
  ENROLLMENT_STATUSES.ACTIVE,
  ENROLLMENT_STATUSES.ACTIVE_REOPENED,
  ENROLLMENT_STATUSES.AWAITING_CHECKIN,
  ENROLLMENT_STATUSES.AWAITING_ORIENTATION,
  ENROLLMENT_STATUSES.JOB_SEARCH,
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
          title: 'CWP enrollment status',
          enum: ENROLLMENT_STATUS_ENUM,
        },
      },
      required: [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)],
      dependencies: {
        [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: {
          oneOf: [
            {
              properties: {
                [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: {
                  enum: COMPLETION_STATUSES
                },
                [getPageSectionKey(1, 2)]: {
                  type: 'object',
                  title: '',
                  properties: {
                    [getEntityAddressKey(0, PROGRAM_OUTCOME, DATETIME_COMPLETED)]: {
                      type: 'string',
                      title: 'Work program end date',
                      format: 'date',
                    },
                    [getEntityAddressKey(0, PROGRAM_OUTCOME, HOURS_WORKED)]: {
                      type: 'string',
                      title: 'Total hours completed',
                    },
                    [getEntityAddressKey(0, PROGRAM_OUTCOME, DESCRIPTION)]: {
                      type: 'string',
                      title: 'Notes on outcome',
                      format: 'textarea'
                    },
                  },
                  required: [getEntityAddressKey(0, PROGRAM_OUTCOME, DATETIME_COMPLETED)],
                },
              }
            },
            {
              properties: {
                [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: {
                  enum: ACTIVE_STATUSES
                },
                [getPageSectionKey(1, 3)]: {
                  type: 'object',
                  title: '',
                  properties: {
                    [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: {
                      type: 'string',
                      title: 'Status effective date',
                      format: 'date',
                    },
                  },
                  required: [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]
                },
              }
            }
          ]
        }
      }
    },
  }
};

export const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: {
      classNames: 'column-span-12',
    },
    [getPageSectionKey(1, 2)]: {
      classNames: 'column-span-12 grid-container',
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
    [getPageSectionKey(1, 3)]: {
      classNames: 'column-span-12 grid-container',
      [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: {
        classNames: 'column-span-12',
      }
    }
  },
};
