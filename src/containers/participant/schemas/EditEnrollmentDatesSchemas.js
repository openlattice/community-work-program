// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import {
  APP_TYPE_FQNS,
  DATETIME_END,
  DATETIME_START,
  DIVERSION_PLAN_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const {
  DIVERSION_PLAN,
  // SENTENCE_TERM,
} = APP_TYPE_FQNS;
const { CHECK_IN_DATETIME, ORIENTATION_DATETIME } = DIVERSION_PLAN_FQNS;

export const sentenceTermSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
        // [getEntityAddressKey(0, SENTENCE_TERM, DATETIME_START)]: {
        //   type: 'string',
        //   title: 'Sentence date',
        //   format: 'date',
        // },
        // [getEntityAddressKey(0, SENTENCE_TERM, DATETIME_END)]: {
        //   type: 'string',
        //   title: 'Sentence end date',
        //   format: 'date',
        // },
      }
    },
  }
};

export const sentenceTermUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    // [getEntityAddressKey(0, SENTENCE_TERM, DATETIME_START)]: {
    //   classNames: 'column-span-4',
    // },
    // [getEntityAddressKey(0, SENTENCE_TERM, DATETIME_END)]: {
    //   classNames: 'column-span-4',
    // },
    'ui:options': { editable: true },
  },
};

export const diversionPlanSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: '',
      properties: {
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

export const diversionPlanUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, DIVERSION_PLAN, CHECK_IN_DATETIME)]: {
      classNames: 'column-span-4',
    },
    [getEntityAddressKey(0, DIVERSION_PLAN, ORIENTATION_DATETIME)]: {
      classNames: 'column-span-4',
    },
    'ui:options': { editable: true },
  },
};
