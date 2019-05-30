/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { AuthActions } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { EntityDataModelApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AppHeaderContainer from './AppHeaderContainer';
import LogoLoader from '../../components/LogoLoader';
import Dashboard from '../dashboard/DashboardContainer';
import ParticipantsContainer from '../participants/ParticipantsSearchContainer';
import Worksites from '../worksites/Worksites';
import * as AppActions from './AppActions';
import * as ParticipantsActions from '../participants/ParticipantsActions';
import * as Routes from '../../core/router/Routes';

import {
  APP_CONTAINER_WIDTH,
} from '../../core/style/Sizes';
import { APP, STATE, PEOPLE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

// TODO: this should come from lattice-ui-kit, maybe after the next release. current version v0.1.1
const APP_CONTENT_BG :string = '#f8f8fb';

const { getAllPropertyTypes } = EntityDataModelApiActions;
const { logout } = AuthActions;

const AppContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;
  min-width: ${APP_CONTAINER_WIDTH}px;
  padding: 0;
`;

const AppContentOuterWrapper = styled.main`
  background-color: ${APP_CONTENT_BG};
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  position: relative;
`;

const AppContentInnerWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
`;

type Props = {
  actions:{
    getAllPropertyTypes :RequestSequence;
    getParticipants :RequestSequence;
    getSentences :RequestSequence;
    loadApp :RequestSequence;
    logout :() => void;
    resetRequestState :(actionType :string) => void;
  },
  app :Map<*, *>,
  appSettingsByOrgId :Map<*, *>,
  getParticipantsRequestState :RequestState;
  isLoadingApp :boolean;
  participants :List;
  people :Map;
  selectedOrganizationSettings :Map<*, *>,
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;

    actions.loadApp();
    actions.getAllPropertyTypes();
  }

  componentDidUpdate(prevProps :Props) {
    const { app, actions } = this.props;
    const nextOrg = app.get(APP.ORGS);
    const prevOrg = prevProps.app.get(APP.ORGS);
    if (prevOrg.size !== nextOrg.size) {
      nextOrg.keySeq().forEach((id) => {
        const selectedOrgId :string = id;
        const peopleEntitySetId = app.getIn(
          [APP_TYPE_FQNS.PEOPLE.toString(), APP.ENTITY_SETS_BY_ORG, selectedOrgId]
        );
        if (peopleEntitySetId) {
          actions.getParticipants();
        }
      });
    }
  }

  renderAppContent = () => {

    const {
      actions,
      getParticipantsRequestState,
      isLoadingApp,
      participants,
      people
    } = this.props;

    if (isLoadingApp || getParticipantsRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const enrollment = people.get(PEOPLE.ENROLLMENT_BY_PARTICIPANT);
    const infractions = people.get(PEOPLE.INFRACTIONS_BY_PARTICIPANT);
    const sentences = people.get(PEOPLE.SENTENCES_BY_PARTICIPANT);
    return (
      <Switch>
        <Route
            exact strict path={Routes.DASHBOARD}
            render={props => (
              <Dashboard
                  enrollmentByParticipant={enrollment}
                  getParticipantsRequestState={getParticipantsRequestState}
                  infractionsByParticipant={infractions}
                  participants={participants}
                  sentencesByParticipant={sentences}
                  resetRequestState={actions.resetRequestState}
                  {...props} />
            )} />
        <Route path={Routes.PARTICIPANTS} component={ParticipantsContainer} />
        <Route path={Routes.WORKSITES} component={Worksites} />
        <Redirect to={Routes.DASHBOARD} />
      </Switch>
    );
  }

  render() {

    return (
      <AppContainerWrapper>
        <AppHeaderContainer />
        <AppContentOuterWrapper>
          <AppContentInnerWrapper>
            { this.renderAppContent() }
          </AppContentInnerWrapper>
        </AppContentOuterWrapper>
      </AppContainerWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const people = state.get(STATE.PEOPLE);
  return {
    app,
    [APP.LOADING]: app.get(APP.LOADING),
    [APP.SELECTED_ORG_ID]: app.get(APP.APP_SETTINGS_ID),
    [APP.SETTINGS_BY_ORG_ID]: app.get(APP.SETTINGS_BY_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),
    getParticipantsRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_PARTICIPANTS, PEOPLE.REQUEST_STATE]),
    people,
    [PEOPLE.PARTICIPANTS]: people.get(PEOPLE.PARTICIPANTS),
  };
};

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(AppActions).forEach((action :string) => {
    actions[action] = AppActions[action];
  });

  Object.keys(ParticipantsActions).forEach((action :string) => {
    actions[action] = ParticipantsActions[action];
  });

  actions.logout = logout;
  actions.getAllPropertyTypes = getAllPropertyTypes;

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
