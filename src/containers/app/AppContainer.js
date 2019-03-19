/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { AuthActions } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { EntityDataModelApiActions } from 'lattice-sagas';

import AppHeaderContainer from './AppHeaderContainer';
import Spinner from '../../components/spinner/Spinner';
import Dashboard from '../dashboard/Dashboard';
import ParticipantsSearchContainer from '../participants/ParticipantsSearchContainer';
import Worksites from '../worksites/Worksites';
import * as AppActions from './AppActions';
import * as Routes from '../../core/router/Routes';
import {
  APP_CONTAINER_WIDTH,
} from '../../core/style/Sizes';

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
  app :Map<*, *>,
  appSettingsByOrgId :Map<*, *>,
  selectedOrganizationSettings :Map<*, *>,
  actions:{
    getAllPropertyTypes :RequestSequence;
    loadApp :RequestSequence;
    logout :() => void;
  },
  isLoadingApp :boolean;
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;

    actions.loadApp();
    actions.getAllPropertyTypes();
  }
  }

  renderAppContent = () => {

    const { isLoadingApp } = this.props;
    if (isLoadingApp) {
      return (
        <Spinner />
      );
    }

    return (
      <Switch>
        <Route exact strict path={Routes.DASHBOARD} component={Dashboard} />
        <Route path={Routes.PARTICIPANTS} component={ParticipantsSearchContainer} />
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
  return {
    app,
    [APP.LOADING]: app.get(APP.LOADING),
    [APP.SELECTED_ORG_ID]: app.get(APP.APP_SETTINGS_ID),
    [APP.SETTINGS_BY_ORG_ID]: app.get(APP.SETTINGS_BY_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),
  };
};

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(AppActions).forEach((action :string) => {
    actions[action] = AppActions[action];
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
