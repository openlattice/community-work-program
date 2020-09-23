/*
 * @flow
 */

import React, { Component } from 'react';

import { Map } from 'immutable';
import { AuthActions, AuthUtils } from 'lattice-auth';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  AppNavigationWrapper,
  LatticeLuxonUtils,
  MuiPickersUtilsProvider,
  Sizes,
  StylesProvider,
  ThemeProvider,
  lightTheme,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import {
  NavLink,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { INITIALIZE_APPLICATION, initializeApplication, switchOrganization } from './AppActions';

import AddParticipantContainer from '../participants/newparticipant/AddParticipantContainer';
import DashboardContainer from '../dashboard/DashboardContainer';
import EditWorksiteHoursForm from '../worksites/EditWorksiteHoursForm';
import EditWorksiteInfoForm from '../worksites/EditWorksiteInfoForm';
import LogoLoader from '../../components/LogoLoader';
import OpenLatticeLogo from '../../assets/images/logo_v2.png';
import ParticipantProfileContainer from '../participant/ParticipantProfileContainer';
import ParticipantsSearchContainer from '../participants/ParticipantsSearchContainer';
import PrintWorkScheduleContainer from '../workschedule/PrintWorkScheduleContainer';
import StatsContainer from '../stats/StatsContainer';
import WorkScheduleContainer from '../workschedule/WorkScheduleContainer';
import WorksiteProfile from '../worksites/WorksiteProfile';
import WorksitesContainer from '../worksites/WorksitesContainer';
import * as ParticipantsActions from '../participants/ParticipantsActions';
import * as Routes from '../../core/router/Routes';
import { ContactSupport } from '../../components/controls/index';
import { isNonEmptyString } from '../../utils/LangUtils';
import { requestIsPending } from '../../utils/RequestStateUtils';
import { APP, SHARED, STATE } from '../../utils/constants/ReduxStateConsts';

const { logout } = AuthActions;
const { APP_CONTENT_WIDTH } = Sizes;
const { SELECTED_ORG_ID } = APP;
const { ACTIONS, REQUEST_STATE } = SHARED;

type Props = {
  actions:{
    initializeApplication :RequestSequence;
    logout :() => void;
    resetRequestState :(actionType :string) => void;
    switchOrganization :RequestSequence;
  },
  app :Map;
  location :Object;
  requestStates :{
    INITIALIZE_APPLICATION :RequestState;
  };
  selectedOrganizationId :UUID;
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;

    actions.initializeApplication();
  }

  switchOrganization = (organization :Object) => {
    const { actions, selectedOrganizationId } = this.props;
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
      <Route exact strict path={Routes.ADD_PARTICIPANT} component={AddParticipantContainer} />
      <Route path={Routes.PARTICIPANT_PROFILE} component={ParticipantProfileContainer} />
      <Route path={Routes.PARTICIPANTS} component={ParticipantsSearchContainer} />
      <Route path={Routes.STATS} component={StatsContainer} />
      <Route path={Routes.DASHBOARD} component={DashboardContainer} />
      <Redirect to={Routes.DASHBOARD} />
    </Switch>
  );

  render() {
    const {
      app,
      location,
      requestStates,
      selectedOrganizationId,
    } = this.props;

    const { pathname } = location;
    const isPrintView :boolean = pathname.substring(pathname.lastIndexOf('/')) === '/print';

    const organizations :Map = app.get(APP.ORGS).map((orgMap :Map, orgId :UUID) => {
      const orgName :string = orgMap.get('title', '');
      return { id: orgId, title: orgName };
    });

    const userInfo :Object = AuthUtils.getUserInfo() || {};
    let user = null;
    if (isNonEmptyString(userInfo.name)) {
      user = userInfo.name;
    }
    else if (isNonEmptyString(userInfo.email)) {
      user = userInfo.email;
    }

    const isInitializing = requestIsPending(requestStates[INITIALIZE_APPLICATION]);

    return (
      <ThemeProvider theme={lightTheme}>
        <MuiPickersUtilsProvider utils={LatticeLuxonUtils}>
          <StylesProvider injectFirst>
            <AppContainerWrapper>
              {
                !isPrintView && (
                  <AppHeaderWrapper
                      appIcon={OpenLatticeLogo}
                      appTitle="Community Work Program"
                      logout={this.logout}
                      organizationsSelect={{
                        isLoading: isInitializing,
                        onChange: this.switchOrganization,
                        organizations,
                        selectedOrganizationId
                      }}
                      user={user}>
                    <AppNavigationWrapper>
                      <NavLink to={Routes.DASHBOARD}>Community Work Program</NavLink>
                      <NavLink to={Routes.DASHBOARD}>Dashboard</NavLink>
                      <NavLink to={Routes.PARTICIPANTS}>Participants</NavLink>
                      <NavLink to={Routes.WORKSITES}>Work Sites</NavLink>
                      <NavLink to={Routes.WORK_SCHEDULE}>Work Schedule</NavLink>
                      <NavLink to={Routes.STATS}>Stats</NavLink>
                    </AppNavigationWrapper>
                  </AppHeaderWrapper>
                )
              }
              <AppContentWrapper>
                {
                  isInitializing ? (
                    <LogoLoader
                        loadingText="Please wait..."
                        size={60} />
                  ) : (
                    this.renderAppContent()
                  )
                }
              </AppContentWrapper>
              <ContactSupport />
            </AppContainerWrapper>
          </StylesProvider>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  app: state.get(STATE.APP),
  requestStates: {
    [INITIALIZE_APPLICATION]: state.getIn([STATE.APP, ACTIONS, INITIALIZE_APPLICATION, REQUEST_STATE]),
  },
  [SELECTED_ORG_ID]: state.getIn([STATE.APP, SELECTED_ORG_ID]),
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    initializeApplication,
    logout,
    resetRequestState: ParticipantsActions.resetRequestState,
    switchOrganization,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
