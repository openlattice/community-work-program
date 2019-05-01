/*
 * @flow
 */

import isNumber from 'lodash/isNumber';
import { Map, fromJS } from 'immutable';

import { ORGANIZATION } from '../../utils/constants/ReduxStateConsts';

import {
  getOrganization,
} from './OrganizationActions';

const INITIAL_STATE :Map<*, *> = fromJS({
  [ORGANIZATION.ACTIONS]: {
    [ORGANIZATION.GET_ORGANIZATION]: Map(),
  },
  [ORGANIZATION.ERRORS]: Map(),
  [ORGANIZATION.IS_FETCHING_ORGANIZATION]: false,
  [ORGANIZATION.SELECTED_ORGANIZATION]: Map(),
});

export default function organizationReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case getOrganization.case(action.type): {
      const seqAction :SequenceAction = (action :any);
      return getOrganization.reducer(state, action, {

        REQUEST: () => state
          .setIn([ORGANIZATION.ACTIONS, ORGANIZATION.GET_ORGANIZATION, seqAction.id], seqAction)
          .set(ORGANIZATION.IS_FETCHING_ORGANIZATION, true),
        SUCCESS: () => {
          if (!state.hasIn([ORGANIZATION.ACTIONS, ORGANIZATION.GET_ORGANIZATION, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state.set(ORGANIZATION.SELECTED_ORGANIZATION, fromJS(value));
        },
        FAILURE: () => {
          const error = {};

          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(ORGANIZATION.SELECTED_ORGANIZATION, Map())
            .setIn([ORGANIZATION.ERRORS, ORGANIZATION.GET_ORGANIZATION], error);
        },
        FINALLY: () => state
          .deleteIn([ORGANIZATION.ACTIONS, ORGANIZATION.GET_ORGANIZATION, seqAction.id])
          .set(ORGANIZATION.IS_FETCHING_ORGANIZATION, false)

      });
    }

    default:
      return state;
  }
}
