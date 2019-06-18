// @flow
import React from 'react';
import {
  Redirect,
  Route,
  Switch,
  withRouter
} from 'react-router-dom';

import DashboardContainer from '../dashboard/DashboardContainer';
import ParticipantsSearchContainer from './ParticipantsSearchContainer';
import ParticipantProfileContainer from '../participant/ParticipantProfileContainer';
import * as Routes from '../../core/router/Routes';

const ParticipantsRouter = () => (
  <Switch>
    <Route path={Routes.PARTICIPANT_PROFILE} component={ParticipantProfileContainer} />
    <Route path={Routes.PARTICIPANTS} component={ParticipantsSearchContainer} />
    <Route path={Routes.DASHBOARD} component={DashboardContainer} />
    <Redirect from={Routes.ROOT} to={Routes.DASHBOARD} />
  </Switch>
);

export default withRouter(ParticipantsRouter);
