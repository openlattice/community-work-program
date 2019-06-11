/*
 * @flow
 */

import { AccountUtils } from 'lattice-auth';
import isNumber from 'lodash/isNumber';
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { APP } from '../../utils/constants/ReduxStateConsts';
import { isDefined } from '../../utils/LangUtils';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  INITIALIZE_APPLICATION,
  RESET_REQUEST_STATE,
  initializeApplication,
} from './AppActions';

const {
  ACTIONS,
  APP_SETTINGS_ID,
  APP_TYPES,
  ENTITY_SETS_BY_ORG,
  ERRORS,
  FQN_TO_ID,
  ORGS,
  REQUEST_STATE,
  SELECTED_ORG_ID,
  SELECTED_ORG_SETTINGS,
  SELECTED_ORG_TITLE,
  SETTINGS_BY_ORG_ID,
} = APP;

const INITIAL_STATE :Map<*, *> = fromJS({

  [ACTIONS]: {
    [INITIALIZE_APPLICATION]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    }
  },
  [APP.APP]: Map(),
  [APP_SETTINGS_ID]: '',
  [APP_TYPES]: Map(),
  [ENTITY_SETS_BY_ORG]: Map(),
  [ERRORS]: {
    [INITIALIZE_APPLICATION]: Map(),
  },
  [FQN_TO_ID]: Map(),
  [ORGS]: Map(),
  [SELECTED_ORG_ID]: '',
  [SELECTED_ORG_SETTINGS]: Map(),
  [SELECTED_ORG_TITLE]: '',
  [SETTINGS_BY_ORG_ID]: Map(),
});

export default function appReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (state.has(actionType)) {
        return state.setIn([actionType, REQUEST_STATE], RequestStates.STANDBY);
      }
      return state;
    }

    case initializeApplication.case(action.type): {
      const seqAction :SequenceAction = action;
      return initializeApplication.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, INITIALIZE_APPLICATION, seqAction.id], seqAction)
          .set([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.PENDING)
          .set(SELECTED_ORG_ID, ''),
        SUCCESS: () => {
          let entitySetsByOrgId = Map();
          let fqnToIdMap = Map();
          if (!state.hasIn([ACTIONS, INITIALIZE_APPLICATION, action.id])) {
            return state;
          }

          const { value } = action;
          if (!isDefined(value)) {
            return state;
          }

          let newState :Map<*, *> = state;
          const {
            app,
            appConfigs,
            appSettingsByOrgId,
            // appTypes,
            // edm
          } = value;
          const organizations :Object = {};

          appConfigs.forEach((appConfig :Object) => {

            const { organization } :Object = appConfig;
            const orgId :string = organization.id;
            if (fromJS(appConfig.config).size) {
              organizations[orgId] = organization;
              if (fromJS(appConfig.config).size) {
                organizations[orgId] = organization;
                Object.values(APP_TYPE_FQNS).forEach((fqn) => {
                  newState = newState.setIn(
                    [fqn, ENTITY_SETS_BY_ORG, orgId],
                    appConfig.config[fqn].entitySetId
                  );
                  fqnToIdMap = fqnToIdMap.set(
                    orgId,
                    fqnToIdMap.get(orgId, Map()).set(fqn, appConfig.config[fqn].entitySetId)
                  );
                  entitySetsByOrgId = entitySetsByOrgId.set(
                    orgId,
                    entitySetsByOrgId.get(orgId, Map()).set(appConfig.config[fqn].entitySetId, fqn)
                  );
                });
              }
            }

          });
          let selectedOrganizationId :string = '';
          let selectedOrganizationTitle :string = '';
          if (fromJS(organizations).size && !selectedOrganizationId.length) {
            selectedOrganizationId = fromJS(organizations).valueSeq().getIn([0, 'id'], '');
            selectedOrganizationTitle = fromJS(organizations).valueSeq().getIn([0, 'title'], '');
          }
          const storedOrganizationId :?string = AccountUtils.retrieveOrganizationId();
          if (storedOrganizationId && organizations[storedOrganizationId]) {
            selectedOrganizationId = storedOrganizationId;
            selectedOrganizationTitle = organizations[selectedOrganizationId].title;
          }

          const appSettings = appSettingsByOrgId.get(selectedOrganizationId, Map());

          return newState
            .set(APP.APP, app)
            .set(ENTITY_SETS_BY_ORG, entitySetsByOrgId)
            .set(FQN_TO_ID, fqnToIdMap)
            .set(ORGS, fromJS(organizations))
            .set(SELECTED_ORG_ID, selectedOrganizationId)
            .set(SELECTED_ORG_TITLE, selectedOrganizationTitle)
            .set(SETTINGS_BY_ORG_ID, appSettingsByOrgId)
            .set(SELECTED_ORG_SETTINGS, appSettings)
            .set([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            error.status = axiosError.response.status;
          }

          return state.setIn([ERRORS, INITIALIZE_APPLICATION], fromJS(error));
        },
        FINALLY: () => state
          .deleteIn([ACTIONS, INITIALIZE_APPLICATION, seqAction.id])
      });
    }

    default:
      return state;
  }
}
