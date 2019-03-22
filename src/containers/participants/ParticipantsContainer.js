// @flow
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import ParticipantsSearchContainer from './ParticipantsSearchContainer';
import ParticipantProfile from '../participant/ParticipantProfile';

import * as Routes from '../../core/router/Routes';

const ParticipantsContainer = () => (
  <Switch>
    <Route path={Routes.PARTICIPANT_PROFILE} component={ParticipantProfile} />
    <Route component={ParticipantsSearchContainer} />
  </Switch>
);

export default ParticipantsContainer;
