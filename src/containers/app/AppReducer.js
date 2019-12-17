/*
 * @flow
 */

import { AccountUtils } from 'lattice-auth';
import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { APP } from '../../utils/constants/ReduxStateConsts';
import { isDefined } from '../../utils/LangUtils';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  RESET_REQUEST_STATE,
  SWITCH_ORGANIZATION,
  initializeApplication,
} from './AppActions';

const {
  ACTIONS,
  ENTITY_SET_IDS_BY_ORG,
  INITIALIZE_APPLICATION,
  ORGS,
  REQUEST_STATE,
  SELECTED_ORG_ID,
  SELECTED_ORG_TITLE,
} = APP;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [APP.INITIALIZE_APPLICATION]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    }
  },
  [APP.APP]: Map(),
  [ENTITY_SET_IDS_BY_ORG]: Map(),
  [ORGS]: Map(),
  [SELECTED_ORG_ID]: '',
  [SELECTED_ORG_TITLE]: '',
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

    case SWITCH_ORGANIZATION: {
      return state
        .set(APP.SELECTED_ORG_ID, action.org.orgId)
        .set(APP.SELECTED_ORG_TITLE, action.org.title);
    }

    case initializeApplication.case(action.type): {
      const seqAction :SequenceAction = action;
      return initializeApplication.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, INITIALIZE_APPLICATION, seqAction.id], seqAction)
          .setIn([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.PENDING)
          .set(SELECTED_ORG_ID, ''),
        SUCCESS: () => {
          if (!state.hasIn([ACTIONS, INITIALIZE_APPLICATION, action.id])) {
            return state;
          }

          const { value } = action;
          if (!isDefined(value)) {
            return state;
          }

          const { app, appConfigs } = value;
          const organizations :Object = {};

          let entitySetIdsByOrg :Map = state.get(ENTITY_SET_IDS_BY_ORG);

          appConfigs.forEach((appConfig :Object) => {

            const { organization } :Object = appConfig;
            const orgId :string = organization.id;
            if (fromJS(appConfig.config).size) {
              organizations[orgId] = organization;
              if (fromJS(appConfig.config).size) {
                organizations[orgId] = organization;
                Object.values(APP_TYPE_FQNS).forEach((fqn) => {
                  entitySetIdsByOrg = entitySetIdsByOrg.setIn(
                    [orgId, fqn],
                    appConfig.config[fqn].entitySetId
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

          return state
            .set(APP.APP, app)
            .set(ENTITY_SET_IDS_BY_ORG, entitySetIdsByOrg)
            .set(ORGS, fromJS(organizations))
            .set(SELECTED_ORG_ID, selectedOrganizationId)
            .set(SELECTED_ORG_TITLE, selectedOrganizationTitle)
            .setIn([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([ACTIONS, INITIALIZE_APPLICATION, seqAction.id])
      });
    }

    default:
      return state;
  }
}
