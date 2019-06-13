// @flow
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import DashboardContainer from '../dashboard/DashboardContainer';
import ParticipantsSearchContainer from './ParticipantsSearchContainer';
import ParticipantProfileContainer from '../participant/ParticipantProfileContainer';
import * as Routes from '../../core/router/Routes';

const ParticipantsRouter = () => (
  <Switch>
    <Route path={Routes.PARTICIPANT_PROFILE} component={ParticipantProfileContainer} />
    <Route path={Routes.DASHBOARD} component={DashboardContainer} />
    <Route path={Routes.PARTICIPANTS} component={ParticipantsSearchContainer} />
  </Switch>
);

export default ParticipantsRouter;
