/*
 * @flow
 */

import isNumber from 'lodash/isNumber';
import { Map, List, fromJS } from 'immutable';

import { WORKSITES } from '../../utils/constants/ReduxStateConsts';

import {
  getOrganizations,
  getOrganizationWorksites,
} from './WorksitesActions';

const INITIAL_STATE :Map<*, *> = fromJS({
  [WORKSITES.ACTIONS]: {
    [WORKSITES.GET_ORGANIZATIONS]: Map(),
    [WORKSITES.GET_ORGANIZATION_WORKSITES]: Map(),
  },
  [WORKSITES.ERRORS]: Map(),
  [WORKSITES.IS_FETCHING_ORGANIZATIONS]: false,
  [WORKSITES.IS_FETCHING_WORKSITES]: false,
  [WORKSITES.ORGANIZATIONS]: List(),
  [WORKSITES.WORKSITES_BY_ORGANIZATION]: List(),
});

export default function organizationReducer(state :Map<*, *> = INITIAL_STATE, action :Object) :Map<*, *> {

  switch (action.type) {

    case getOrganizations.case(action.type): {

      const seqAction :SequenceAction = (action :any);
      return getOrganizations.reducer(state, action, {

        REQUEST: () => state
          .setIn([WORKSITES.ACTIONS, WORKSITES.GET_ORGANIZATIONS, seqAction.id], seqAction)
          .set(WORKSITES.IS_FETCHING_ORGANIZATIONS, true),
        SUCCESS: () => {
          if (!state.hasIn([WORKSITES.ACTIONS, WORKSITES.GET_ORGANIZATIONS, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state.set(WORKSITES.ORGANIZATIONS, fromJS(value));
        },
        FAILURE: () => {
          const error = {};

          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(WORKSITES.ORGANIZATIONS, Map())
            .setIn([WORKSITES.ERRORS, WORKSITES.ORGANIZATIONS], error);
        },
        FINALLY: () => state
          .deleteIn([WORKSITES.ACTIONS, WORKSITES.GET_ORGANIZATIONS, seqAction.id])
          .set(WORKSITES.IS_FETCHING_ORGANIZATIONS, false)

      });
    }

    case getOrganizationWorksites.case(action.type): {

      const seqAction :SequenceAction = (action :any);
      return getOrganizationWorksites.reducer(state, action, {

        REQUEST: () => state
          .setIn([WORKSITES.ACTIONS, WORKSITES.GET_ORGANIZATIONS, seqAction.id], seqAction)
          .set(WORKSITES.IS_FETCHING_ORGANIZATIONS, true),
        SUCCESS: () => {
          if (!state.hasIn([WORKSITES.ACTIONS, WORKSITES.GET_ORGANIZATIONS, seqAction.id])) {
            return state;
          }

          const { value } = seqAction;
          if (value === null || value === undefined) {
            return state;
          }

          return state.set(WORKSITES.ORGANIZATIONS, fromJS(value));
        },
        FAILURE: () => {
          const error = {};

          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state
            .set(WORKSITES.ORGANIZATIONS, Map())
            .setIn([WORKSITES.ERRORS, WORKSITES.ORGANIZATIONS], error);
        },
        FINALLY: () => state
          .deleteIn([WORKSITES.ACTIONS, WORKSITES.GET_ORGANIZATIONS, seqAction.id])
          .set(WORKSITES.IS_FETCHING_ORGANIZATIONS, false)

      });
    }

    default:
      return state;
  }
}
