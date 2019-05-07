/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import AppHeaderContainer from './AppHeaderContainer';
import Spinner from '../../components/spinner/Spinner';
import Dashboard from '../dashboard/Dashboard';
import ParticipantsSearchContainer from '../participants/ParticipantsSearchContainer';
import WorksitesContainer from '../worksites/WorksitesContainer';
import OrganizationContainer from '../organization/OrganizationContainer';
import * as AppActions from './AppActions';
import * as Routes from '../../core/router/Routes';
import { APP_CONTAINER_WIDTH } from '../../core/style/Sizes';

// TODO: this should come from lattice-ui-kit, maybe after the next release. current version v0.1.1
const APP_CONTENT_BG :string = '#f8f8fb';

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
  initializeApplication :RequestSequence;
  isInitializingApplication :boolean;
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { initializeApplication } = this.props;
    initializeApplication();
  }

  renderAppContent = () => {

    const { isInitializingApplication } = this.props;
    if (isInitializingApplication) {
      return (
        <Spinner />
      );
    }

    return (
      <Switch>
        <Route exact strict path={Routes.DASHBOARD} component={Dashboard} />
        <Route path={Routes.PARTICIPANTS} component={ParticipantsSearchContainer} />
        <Route path={Routes.WORKSITES} component={WorksitesContainer} />
        <Route path={Routes.ORGANIZATION_PROFILE} component={OrganizationContainer} />
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

const mapStateToProps = (state :Map<*, *>) => ({
  isInitializingApplication: state.getIn(['app', 'isInitializingApplication']),
});

// $FlowFixMe
export default connect(mapStateToProps, { ...AppActions })(AppContainer);
