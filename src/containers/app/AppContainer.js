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
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AppHeaderContainer from './AppHeaderContainer';
import LogoLoader from '../../components/LogoLoader';
import DashboardContainer from '../dashboard/DashboardContainer';
import ParticipantsContainer from '../participants/ParticipantsSearchContainer';
import Worksites from '../worksites/Worksites';
import * as AppActions from './AppActions';
import * as ParticipantsActions from '../participants/ParticipantsActions';
import * as Routes from '../../core/router/Routes';

import { ErrorMessage } from '../../components/Layout';
import {
  APP_CONTAINER_WIDTH,
} from '../../core/style/Sizes';
import { APP, STATE, PEOPLE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../core/style/Colors';

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
  background-color: ${OL.GREY38};
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
    getSentences :RequestSequence;
    initializeApplication :RequestSequence;
    logout :() => void;
    resetRequestState :(actionType :string) => void;
  },
  app :Map<*, *>,
  appSettingsByOrgId :Map<*, *>,
  getAppRequestState :RequestState;
  getParticipantsRequestState :RequestState;
  participants :List;
  people :Map;
  selectedOrganizationSettings :Map<*, *>,
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;

    actions.initializeApplication();
  }

  componentDidUpdate(prevProps :Props) {
    const { app, actions } = this.props;
    const nextOrg = app.get(APP.ORGS);
    const prevOrg = prevProps.app.get(APP.ORGS);
    if (prevOrg.size !== nextOrg.size) {
      nextOrg.keySeq().forEach((id) => {
        const selectedOrgId :UUID = id;
        const peopleEntitySetId :UUID = app.getIn(
          [APP_TYPE_FQNS.PEOPLE, APP.ENTITY_SETS_BY_ORG, selectedOrgId]
        );
        if (peopleEntitySetId) {
          actions.getSentences();
        }
      });
    }
  }

  renderDashboardContainer = () => {

    const {
      actions,
      getParticipantsRequestState,
      participants,
      people,
    } = this.props;

    const enrollment :Map = people ? people.get(PEOPLE.ENROLLMENT_BY_PARTICIPANT) : Map();
    const hoursWorked :Map = people ? people.get(PEOPLE.HOURS_WORKED) : Map();
    const infractions :Map = people ? people.get(PEOPLE.INFRACTIONS_BY_PARTICIPANT) : Map();
    const infractionCount :Map = people ? people.get(PEOPLE.INFRACTION_COUNTS_BY_PARTICIPANT) : Map();
    const sentenceTermsByParticipant :Map = people ? people.get(PEOPLE.SENTENCE_TERMS_BY_PARTICIPANT) : Map();
    return (
      <DashboardContainer
          enrollmentByParticipant={enrollment}
          getParticipantsRequestState={getParticipantsRequestState}
          hoursWorked={hoursWorked}
          infractionsByParticipant={infractions}
          infractionCount={infractionCount}
          participants={participants}
          sentenceTerms={sentenceTermsByParticipant}
          resetRequestState={actions.resetRequestState}
          {...this.props} />
    );
  }

  renderAppContent = () => {

    const {
      getAppRequestState,
      getParticipantsRequestState,
    } = this.props;

    if (getAppRequestState === RequestStates.PENDING || getParticipantsRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    if (getAppRequestState === RequestStates.FAILURE || getParticipantsRequestState === RequestStates.FAILURE) {
      return (
        <ErrorMessage>
          Sorry, something went wrong. Please try refreshing the page, or contact support if the problem persists.
        </ErrorMessage>
      );
    }

    return (
      <Switch>
        <Route exact strict path={Routes.DASHBOARD} render={this.renderDashboardContainer} />
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
    [APP.SELECTED_ORG_ID]: app.get(APP.APP_SETTINGS_ID),
    [APP.SETTINGS_BY_ORG_ID]: app.get(APP.SETTINGS_BY_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),
    getAppRequestState: app.getIn([APP.ACTIONS, APP.LOAD_APP, APP.REQUEST_STATE]),
    getParticipantsRequestState: people.getIn([PEOPLE.ACTIONS, PEOPLE.GET_PARTICIPANTS, PEOPLE.REQUEST_STATE]),
    people,
    [PEOPLE.PARTICIPANTS]: people.get(PEOPLE.PARTICIPANTS),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getSentences: ParticipantsActions.getSentences,
    initializeApplication: AppActions.initializeApplication,
    logout,
    resetRequestState: ParticipantsActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
