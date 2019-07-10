/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ORGANIZATIONS } from '../../utils/constants/ReduxStateConsts';
import {
  addOrganization,
  getOrganizations,
} from './OrganizationsActions';

const {
  ACTIONS,
  ADD_ORGANIZATION,
  ERRORS,
  GET_ORGANIZATIONS,
  REQUEST_STATE,
  ORGANIZATIONS_LIST,
} = ORGANIZATIONS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_ORGANIZATION]: Map(),
    [GET_ORGANIZATIONS]: Map(),
  },
  [ERRORS]: {
    [ADD_ORGANIZATION]: Map(),
    [GET_ORGANIZATIONS]: Map(),
  },
  [ORGANIZATIONS_LIST]: List(),
});

export default function organizationsReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case addOrganization.case(action.type): {

      return addOrganization.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_ORGANIZATION, action.id], fromJS(action))
          .setIn([ACTIONS, ADD_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, ADD_ORGANIZATION, action.id])) {
            return state;
          }

          return state
            .setIn([ACTIONS, ADD_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_ORGANIZATION, action.id]),
      });
    }

    case getOrganizations.case(action.type): {

      return getOrganizations.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ORGANIZATIONS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ORGANIZATIONS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ORGANIZATIONS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(ORGANIZATIONS_LIST, value)
            .setIn([ACTIONS, GET_ORGANIZATIONS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;
          return state
            .set(ORGANIZATIONS_LIST, List())
            .setIn([ERRORS, GET_ORGANIZATIONS], value)
            .setIn([ACTIONS, GET_ORGANIZATIONS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_ORGANIZATIONS, action.id])
      });
    }

    default:
      return state;
  }
}
