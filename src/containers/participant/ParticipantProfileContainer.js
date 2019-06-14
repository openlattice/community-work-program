// @flow
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import type { Match } from 'react-router';

import ParticipantProfile from './ParticipantProfile';
import * as Routes from '../../core/router/Routes';

type Props = {
  match :Match;
};

const ParticipantProfileContainer = (props :Props) => {
  const {
    match: {
      params: { subjectId }
    }
  } = props;
  return (
    <Switch>
      <Route path={Routes.PARTICIPANT_PROFILE} render={() => <ParticipantProfile personEKID={subjectId} />} />
    </Switch>
  );
};

export default ParticipantProfileContainer;
