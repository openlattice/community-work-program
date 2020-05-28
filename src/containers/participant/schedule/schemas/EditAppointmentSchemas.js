// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

const { getPageSectionKey } = DataProcessingUtils;

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
          enum: [],
          enumNames: []
        },
        date: {
          type: 'string',
          title: 'Date',
          format: 'date',
        },
        startTime: {
          type: 'string',
          title: 'Start time',
        },
        endTime: {
          type: 'string',
          title: 'End time',
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
    },
    date: {
      classNames: 'column-span-12',
    },
    startTime: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget',
      'ui:options': {
        format: 'H:mm',
        mask: '__:__',
      },
      'ui:placeholder': 'HH:MM'
    },
    endTime: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget',
      'ui:options': {
        format: 'H:mm',
        mask: '__:__',
      },
      'ui:placeholder': 'HH:MM'
    },
  },
  'ui:options': { editable: true },
};
