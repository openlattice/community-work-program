// @flow
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import ParticipantProfile from './ParticipantProfile';
import * as Routes from '../../core/router/Routes';

const ParticipantProfileContainer = () => (
  <Switch>
    <Route path={Routes.PARTICIPANT_PROFILE} component={ParticipantProfile} />
  </Switch>
);

export default ParticipantProfileContainer;
