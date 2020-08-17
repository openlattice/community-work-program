import { Set } from 'immutable';

import * as AppActions from './AppActions';

import { testShouldExportActionTypes } from '../../utils/testing/TestUtils';

const ACTION_TYPES = Set([
  'INITIALIZE_APPLICATION',
  'RESET_REQUEST_STATE',
  'SWITCH_ORGANIZATION',
]).sort();

describe('AppActions', () => {

  testShouldExportActionTypes(AppActions, ACTION_TYPES.toJS());
});
