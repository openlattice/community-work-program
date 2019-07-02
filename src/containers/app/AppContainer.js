/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { AuthActions } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter
} from 'react-router-dom';
import type { RequestSequence } from 'redux-reqseq';

import AppHeaderContainer from './AppHeaderContainer';
import DashboardContainer from '../dashboard/DashboardContainer';
import OrganizationContainer from '../organizations/OrganizationContainer';
import ParticipantProfileContainer from '../participant/ParticipantProfileContainer';
import ParticipantsSearchContainer from '../participants/ParticipantsSearchContainer';
import WorksiteContainer from '../worksite/WorksiteContainer';
import WorksitesContainer from '../worksites/WorksitesContainer';

import * as AppActions from './AppActions';
import * as ParticipantsActions from '../participants/ParticipantsActions';
import * as Routes from '../../core/router/Routes';

import {
  APP_CONTAINER_WIDTH,
} from '../../core/style/Sizes';
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
    initializeApplication :RequestSequence;
    logout :() => void;
    resetRequestState :(actionType :string) => void;
  },
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;

    actions.initializeApplication();
  }

  renderAppContent = () => (
    <Switch>
      <Route path={Routes.ORGANIZATION_PROFILE} component={OrganizationContainer} />
      <Route path={Routes.WORKSITE_PROFILE} component={WorksiteContainer} />
      <Route path={Routes.WORKSITES} component={WorksitesContainer} />
      <Route path={Routes.PARTICIPANT_PROFILE} component={ParticipantProfileContainer} />
      <Route path={Routes.PARTICIPANTS} component={ParticipantsSearchContainer} />
      <Route path={Routes.DASHBOARD} component={DashboardContainer} />
      <Redirect from={Routes.ROOT} to={Routes.DASHBOARD} />
    </Switch>
  );

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

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    initializeApplication: AppActions.initializeApplication,
    logout,
    resetRequestState: ParticipantsActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default withRouter(connect(null, mapDispatchToProps)(AppContainer));
