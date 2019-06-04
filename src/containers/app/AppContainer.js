/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { AuthActions } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AppHeaderContainer from './AppHeaderContainer';
import Spinner from '../../components/spinner/Spinner';
import Dashboard from '../dashboard/Dashboard';
import ParticipantsSearchContainer from '../participants/ParticipantsSearchContainer';
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
    getSentences :RequestSequence;
    initializeApplication :RequestSequence;
    logout :() => void;
  },
  isLoadingApp :boolean;
  participants :List;
  people :Map;
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
  const people = state.get(STATE.PEOPLE);
  return {
    app,
    [APP.LOADING]: app.get(APP.LOADING),
    [APP.SELECTED_ORG_ID]: app.get(APP.APP_SETTINGS_ID),
    [APP.SETTINGS_BY_ORG_ID]: app.get(APP.SETTINGS_BY_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),
    people,
    [PEOPLE.PARTICIPANTS]: people.get(PEOPLE.PARTICIPANTS),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getSentences: ParticipantsActions.getSentences,
    initializeApplication: AppActions.initializeApplication,
    logout,
    resetRequestState: AppActions.resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
