// @flow
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import type { Match } from 'react-router';

import ParticipantProfile from './ParticipantProfile';
import PrintWorkScheduleContainer from './print/PrintWorkScheduleContainer';
import * as Routes from '../../core/router/Routes';

type Props = {
  match :Match;
};

const ParticipantProfileContainer = (props :Props) => {
  const {
    match: {
      params: { subjectId: personEKID }
    }
  } = props;
  return (
    <Switch>
      <Route path={Routes.PRINT_PARTICIPANT_SCHEDULE} component={PrintWorkScheduleContainer} />
      <Route path={Routes.PARTICIPANT_PROFILE} render={() => <ParticipantProfile personEKID={personEKID} />} />
    </Switch>
  );
};

export default ParticipantProfileContainer;
