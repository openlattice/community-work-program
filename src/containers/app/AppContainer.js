/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { AuthActions } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import type { RequestSequence } from 'redux-reqseq';

import AppHeaderContainer from './AppHeaderContainer';
import DashboardContainer from '../dashboard/DashboardContainer';
import ParticipantsContainer from '../participants/ParticipantsSearchContainer';
import Worksites from '../worksites/Worksites';
import * as AppActions from './AppActions';
import * as ParticipantsActions from '../participants/ParticipantsActions';
import * as Routes from '../../core/router/Routes';

import {
  APP_CONTAINER_WIDTH,
} from '../../core/style/Sizes';
import { APP, STATE } from '../../utils/constants/ReduxStateConsts';
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

  renderAppContent = () => (
    <Switch>
      <Route exact strict path={Routes.DASHBOARD} component={DashboardContainer} />
      <Route exact strict path={Routes.PARTICIPANTS} component={ParticipantsContainer} />
      <Route path={Routes.WORKSITES} component={Worksites} />
      <Redirect to={Routes.DASHBOARD} />
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

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  return {
    app,
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
