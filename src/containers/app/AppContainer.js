/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  AppNavigationWrapper,
  Sizes,
} from 'lattice-ui-kit';
import { AuthActions, AuthUtils } from 'lattice-auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  NavLink,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AppHeaderContainer from './AppHeaderContainer';
import DashboardContainer from '../dashboard/DashboardContainer';
import EditWorksiteHoursForm from '../worksites/EditWorksiteHoursForm';
import EditWorksiteInfoForm from '../worksites/EditWorksiteInfoForm';
import OpenLatticeLogo from '../../assets/images/logo_v2.png';
import ParticipantProfileContainer from '../participant/ParticipantProfileContainer';
import ParticipantsSearchContainer from '../participants/ParticipantsSearchContainer';
import PrintWorkScheduleContainer from '../workschedule/PrintWorkScheduleContainer';
import WorksiteProfile from '../worksites/WorksiteProfile';
import WorksitesContainer from '../worksites/WorksitesContainer';
import WorkScheduleContainer from '../workschedule/WorkScheduleContainer';

import * as AppActions from './AppActions';
import * as ParticipantsActions from '../participants/ParticipantsActions';
import * as Routes from '../../core/router/Routes';

import { ContactSupport } from '../../components/controls/index';
import { APP_CONTAINER_WIDTH } from '../../core/style/Sizes';
import { OL } from '../../core/style/Colors';
import { APP, STATE } from '../../utils/constants/ReduxStateConsts';
import { isNonEmptyString } from '../../utils/LangUtils';

const { APP_CONTENT_WIDTH } = Sizes;
const { logout } = AuthActions;

// const AppContainerWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   height: 100%;
//   margin: 0;
//   min-width: ${APP_CONTAINER_WIDTH}px;
//   padding: 0;
// `;

// const AppContentOuterWrapper = styled.main`
//   background-color: ${OL.GREY38};
//   display: flex;
//   flex: 1 0 auto;
//   justify-content: center;
//   position: relative;
// `;
//
// const AppContentInnerWrapper = styled.div`
//   display: flex;
//   flex: 1 0 auto;
//   flex-direction: column;
//   justify-content: flex-start;
//   position: relative;
// `;

type Props = {
  actions:{
    initializeApplication :RequestSequence;
    logout :() => void;
    resetRequestState :(actionType :string) => void;
    switchOrganization :RequestSequence;
  },
  app :Map;
  initializeAppRequestState :RequestState;
  location :Object;
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;

    actions.initializeApplication();
  }

  switchOrganization = (organization :Object) => {
    const { actions, app } = this.props;
    const selectedOrganizationId = app.get(APP.SELECTED_ORG_ID);
    if (organization.value !== selectedOrganizationId) {
      actions.switchOrganization({
        orgId: organization.value,
        title: organization.label
      });
    }
  }

  logout = () => {
    const { actions } = this.props;
    actions.logout();
  }

  renderAppContent = () => (
    <Switch>
      <Route path={Routes.EDIT_WORKSITE_HOURS} component={EditWorksiteHoursForm} />
      <Route path={Routes.EDIT_WORKSITE_PROFILE_INFO} component={EditWorksiteInfoForm} />
      <Route path={Routes.WORKSITE_PROFILE} component={WorksiteProfile} />
      <Route path={Routes.PRINT_WORK_SCHEDULE} component={PrintWorkScheduleContainer} />
      <Route path={Routes.WORK_SCHEDULE} component={WorkScheduleContainer} />
      <Route path={Routes.WORKSITES} component={WorksitesContainer} />
      <Route path={Routes.PARTICIPANT_PROFILE} component={ParticipantProfileContainer} />
      <Route path={Routes.PARTICIPANTS} component={ParticipantsSearchContainer} />
      <Route path={Routes.DASHBOARD} component={DashboardContainer} />
      <Redirect to={Routes.DASHBOARD} />
    </Switch>
  );

  render() {
    const { app, initializeAppRequestState, location } = this.props;

    const { pathname } = location;
    const isPrintView :boolean = pathname.substring(pathname.lastIndexOf('/')) === '/print';

    const selectedOrg = app.get(APP.SELECTED_ORG_ID, '');
    // const orgList = app.get(APP.ORGS).entrySeq().map(([value, organization]) => {
    //   const label = organization.get('title', '');
    //   return { label, value };
    // });
    const organizations :Map = app.get(APP.ORGS).map((orgMap :Map, orgId :UUID) => {
      const orgName :string = orgMap.get('title', '');
      return { id: orgId, title: orgName };
    });
    const loading = initializeAppRequestState === RequestStates.PENDING;

    const userInfo :Object = AuthUtils.getUserInfo() || {};
    let user = null;
    if (isNonEmptyString(userInfo.name)) {
      user = userInfo.name;
    }
    else if (isNonEmptyString(userInfo.email)) {
      user = userInfo.email;
    }

    return (
      <AppContainerWrapper>
        {
          !isPrintView && (
            <AppHeaderWrapper
                appIcon={OpenLatticeLogo}
                appTitle="Community Work Program"
                logout={this.logout}
                organizationsSelect={{
                  onChange: this.switchOrganization,
                  organizations,
                }}
                user={user}>
              <AppNavigationWrapper>
                <NavLink to={Routes.DASHBOARD}>Dashboard</NavLink>
                <NavLink to={Routes.PARTICIPANTS}>Participants</NavLink>
                <NavLink to={Routes.WORKSITES}>Work Sites</NavLink>
                <NavLink to={Routes.WORK_SCHEDULE}>Work Schedule</NavLink>
              </AppNavigationWrapper>
            </AppHeaderWrapper>
          )
        }
        <AppContentWrapper contentWidth={APP_CONTENT_WIDTH}>
          { this.renderAppContent() }
        </AppContentWrapper>
      </AppContainerWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  return {
    app,
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    initializeApplication: AppActions.initializeApplication,
    logout,
    resetRequestState: ParticipantsActions.resetRequestState,
    switchOrganization: AppActions.switchOrganization,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
