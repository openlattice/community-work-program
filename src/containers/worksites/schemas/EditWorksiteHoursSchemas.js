// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import {
  APP_TYPE_FQNS,
  DATETIME_END,
  INCIDENT_START_DATETIME,
} from '../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const { APPOINTMENT } = APP_TYPE_FQNS;

const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: 'Monday',
      properties: {
        [getEntityAddressKey(0, APPOINTMENT, INCIDENT_START_DATETIME)]: {
          type: 'string',
          title: 'Start',
        },
        [getEntityAddressKey(0, APPOINTMENT, DATETIME_END)]: {
          type: 'string',
          title: 'End',
        },
      }
    },
    [getPageSectionKey(1, 2)]: {
      type: 'object',
      title: 'Tuesday',
      properties: {
        [getEntityAddressKey(1, APPOINTMENT, INCIDENT_START_DATETIME)]: {
          type: 'string',
          title: 'Start',
        },
        [getEntityAddressKey(1, APPOINTMENT, DATETIME_END)]: {
          type: 'string',
          title: 'End',
        },
      }
    },
    [getPageSectionKey(1, 3)]: {
      type: 'object',
      title: 'Wednesday',
      properties: {
        [getEntityAddressKey(2, APPOINTMENT, INCIDENT_START_DATETIME)]: {
          type: 'string',
          title: 'Start',
        },
        [getEntityAddressKey(2, APPOINTMENT, DATETIME_END)]: {
          type: 'string',
          title: 'End',
        },
      }
    },
    [getPageSectionKey(1, 4)]: {
      type: 'object',
      title: 'Thursday',
      properties: {
        [getEntityAddressKey(3, APPOINTMENT, INCIDENT_START_DATETIME)]: {
          type: 'string',
          title: 'Start',
        },
        [getEntityAddressKey(3, APPOINTMENT, DATETIME_END)]: {
          type: 'string',
          title: 'End',
        },
      }
    },
    [getPageSectionKey(1, 5)]: {
      type: 'object',
      title: 'Friday',
      properties: {
        [getEntityAddressKey(4, APPOINTMENT, INCIDENT_START_DATETIME)]: {
          type: 'string',
          title: 'Start',
        },
        [getEntityAddressKey(4, APPOINTMENT, DATETIME_END)]: {
          type: 'string',
          title: 'End',
        },
      }
    },
    [getPageSectionKey(1, 6)]: {
      type: 'object',
      title: 'Saturday',
      properties: {
        [getEntityAddressKey(5, APPOINTMENT, INCIDENT_START_DATETIME)]: {
          type: 'string',
          title: 'Start',
        },
        [getEntityAddressKey(5, APPOINTMENT, DATETIME_END)]: {
          type: 'string',
          title: 'End',
        },
      }
    },
    [getPageSectionKey(1, 7)]: {
      type: 'object',
      title: 'Sunday',
      properties: {
        [getEntityAddressKey(6, APPOINTMENT, INCIDENT_START_DATETIME)]: {
          type: 'string',
          title: 'Start',
        },
        [getEntityAddressKey(6, APPOINTMENT, DATETIME_END)]: {
          type: 'string',
          title: 'End',
        },
      }
    },
  },
};

const uiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: false },
    [getEntityAddressKey(0, APPOINTMENT, INCIDENT_START_DATETIME)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
    [getEntityAddressKey(0, APPOINTMENT, DATETIME_END)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
  },
  [getPageSectionKey(1, 2)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: false },
    [getEntityAddressKey(1, APPOINTMENT, INCIDENT_START_DATETIME)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
    [getEntityAddressKey(1, APPOINTMENT, DATETIME_END)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
  },
  [getPageSectionKey(1, 3)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: false },
    [getEntityAddressKey(2, APPOINTMENT, INCIDENT_START_DATETIME)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
    [getEntityAddressKey(2, APPOINTMENT, DATETIME_END)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
  },
  [getPageSectionKey(1, 4)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: false },
    [getEntityAddressKey(3, APPOINTMENT, INCIDENT_START_DATETIME)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
    [getEntityAddressKey(3, APPOINTMENT, DATETIME_END)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
  },
  [getPageSectionKey(1, 5)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: false },
    [getEntityAddressKey(4, APPOINTMENT, INCIDENT_START_DATETIME)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
    [getEntityAddressKey(4, APPOINTMENT, DATETIME_END)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
  },
  [getPageSectionKey(1, 6)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: false },
    [getEntityAddressKey(5, APPOINTMENT, INCIDENT_START_DATETIME)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
    [getEntityAddressKey(5, APPOINTMENT, DATETIME_END)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
  },
  [getPageSectionKey(1, 7)]: {
    classNames: 'column-span-12 grid-container',
    'ui:options': { editable: false },
    [getEntityAddressKey(6, APPOINTMENT, INCIDENT_START_DATETIME)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
    [getEntityAddressKey(6, APPOINTMENT, DATETIME_END)]: {
      classNames: 'column-span-6',
      'ui:widget': 'TimeWidget',
    },
  }
};

export {
  schema,
  uiSchema,
};
