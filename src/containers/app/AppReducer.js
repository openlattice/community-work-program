/*
 * @flow
 */

import { Models } from 'lattice';
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
  initializeApplication,
  loadApp,
} from './AppActions';

const { FullyQualifiedName } = Models;

const getEntityTypePropertyTypes = (edm :Object, entityTypeId :string) :Object => {
  const propertyTypesMap :Object = {};
  edm.entityTypes[entityTypeId].properties.forEach((propertyTypeId :string) => {
    propertyTypesMap[propertyTypeId] = edm.propertyTypes[propertyTypeId];
  });
  return propertyTypesMap;
};

const INITIAL_STATE :Map<*, *> = fromJS({

  [INITIALIZE_APPLICATION]: { error: false },
  isInitializingApplication: false,

  [APP.ACTIONS]: {
    [APP.LOAD_APP]: Map(),
  },
  [APP.APP]: Map(),
  [APP.APP_TYPES]: Map(),
  [APP.ENTITY_SETS_BY_ORG]: Map(),
  [APP.ERRORS]: {
    [APP.LOAD_APP]: Map(),
  },
  [APP.FQN_TO_ID]: Map(),
  [APP.LOADING]: true,
  [APP.ORGS]: Map(),
  [APP.SELECTED_ORG_ID]: '',
  [APP.SELECTED_ORG_TITLE]: '',
  [APP.APP_SETTINGS_ID]: '',
  [APP.SETTINGS_BY_ORG_ID]: Map(),
  [APP.SELECTED_ORG_SETTINGS]: Map(),
});

export default function appReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case initializeApplication.case(action.type): {
      return initializeApplication.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state
            .set('isInitializingApplication', true)
            .setIn([INITIALIZE_APPLICATION, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([INITIALIZE_APPLICATION, seqAction.id]);

          if (!storedSeqAction) {
            return state;
          }

          const { value } = storedSeqAction;
          if (value === null || !isDefined(value)) {
            return state;
          }

          // TODO: do something with "value"
          return state;
        },
        FAILURE: () => {

          const seqAction :SequenceAction = action;
          const error = {};
          const { value: axiosError } = seqAction;
          if (axiosError && axiosError.response && isNumber(axiosError.response.status)) {
            // for now, we only care about the HTTP status code. we can get more fancy later on.
            error.status = axiosError.response.status;
          }

          // TODO: there's probably a significantly better way of handling errors
          return state.setIn([INITIALIZE_APPLICATION, 'error'], fromJS(error));
        },
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state
            .set('isInitializingApplication', false)
            .deleteIn([INITIALIZE_APPLICATION, seqAction.id]);
        }
      });
    }

    case loadApp.case(action.type): {
      const seqAction :SequenceAction = action;
      return loadApp.reducer(state, action, {
        REQUEST: () => state
          .set(APP.LOADING, true)
          .set(APP.SELECTED_ORG_ID, '')
          .setIn([APP.ACTIONS, APP.LOAD_APP, action.id], fromJS(seqAction)),
        SUCCESS: () => {
          let entitySetsByOrgId = Map();
          let fqnToIdMap = Map();
          if (!state.hasIn([APP.ACTIONS, APP.LOAD_APP, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || !isDefined(value)) {
            return state;
          }

          let newState :Map<*, *> = state;
          const {
            app,
            appConfigs,
            appSettingsByOrgId,
            appTypes,
            edm
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
                  const fqnString = fqn.toString();
                  newState = newState.setIn(
                    [fqnString, APP.ENTITY_SETS_BY_ORG, orgId],
                    appConfig.config[fqnString].entitySetId
                  );
                  fqnToIdMap = fqnToIdMap.set(
                    orgId,
                    fqnToIdMap.get(orgId, Map()).set(fqnString, appConfig.config[fqnString].entitySetId)
                  );
                  entitySetsByOrgId = entitySetsByOrgId.set(
                    orgId,
                    entitySetsByOrgId.get(orgId, Map()).set(appConfig.config[fqnString].entitySetId, fqnString)
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

          appTypes.forEach((appType :Object) => {
            const appTypeFqn :string = FullyQualifiedName.toString(appType.type.namespace, appType.type.name);
            const propertyTypes = getEntityTypePropertyTypes(edm, appType.entityTypeId);
            const primaryKeys = edm.entityTypes[appType.entityTypeId].key;
            newState = newState
              .setIn([appTypeFqn, APP.PROPERTY_TYPES], fromJS(propertyTypes))
              .setIn([appTypeFqn, APP.PRIMARY_KEYS], fromJS(primaryKeys));
          });

          const appSettings = appSettingsByOrgId.get(selectedOrganizationId, Map());

          return newState
            .set(APP.APP, app)
            .set(APP.ENTITY_SETS_BY_ORG, entitySetsByOrgId)
            .set(APP.FQN_TO_ID, fqnToIdMap)
            .set(APP.ORGS, fromJS(organizations))
            .set(APP.SELECTED_ORG_ID, selectedOrganizationId)
            .set(APP.SELECTED_ORG_TITLE, selectedOrganizationTitle)
            .set(APP.SETTINGS_BY_ORG_ID, appSettingsByOrgId)
            .set(APP.SELECTED_ORG_SETTINGS, appSettings);
        },
        FINALLY: () => state
          .set(APP.LOADING, false)
          .deleteIn([APP.ACTIONS, APP.LOAD_APP, action.id]),
      });
    }

    default:
      return state;
  }
}
