// @flow
import React from 'react';
import { Map } from 'immutable';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import type { Match } from 'react-router';

import ParticipantProfile from './ParticipantProfile';
import PrintWorkScheduleContainer from './print/PrintWorkScheduleContainer';
import EditPersonAndContactsForm from './EditPersonAndContactsForm';
import * as Routes from '../../core/router/Routes';

import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';

const {
  ADDRESS,
  EMAIL,
  PARTICIPANT,
  PHONE,
  WORK_APPOINTMENTS_BY_WORKSITE_PLAN,
  WORKSITES_BY_WORKSITE_PLAN
} = PERSON;

type Props = {
  address :Map;
  email :Map;
  match :Match;
  participant :Map;
  phone :Map;
  workAppointmentsByWorksitePlan :Map;
  worksitesByWorksitePlan :Map;
};

const ParticipantProfileContainer = (props :Props) => {
  const {
    address,
    email,
    match: {
      params: { subjectId: personEKID }
    },
    participant,
    phone,
    workAppointmentsByWorksitePlan,
    worksitesByWorksitePlan,
  } = props;
  return (
    <Switch>
      <Route
          path={Routes.EDIT_PARTICIPANT}
          render={() => (
            <EditPersonAndContactsForm
                address={address}
                email={email}
                participant={participant}
                phone={phone} />
          )} />
      <Route
          path={Routes.PRINT_PARTICIPANT_SCHEDULE}
          render={() => (
            <PrintWorkScheduleContainer
                participant={participant}
                workAppointmentsByWorksitePlan={workAppointmentsByWorksitePlan}
                worksitesByWorksitePlan={worksitesByWorksitePlan} />
          )} />
      <Route path={Routes.PARTICIPANT_PROFILE} render={() => <ParticipantProfile personEKID={personEKID} />} />
    </Switch>
  );
};

const mapStateToProps = (state :Map<*, *>) => {
  const person = state.get(STATE.PERSON);
  return {
    [ADDRESS]: person.get(ADDRESS),
    [EMAIL]: person.get(EMAIL),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PHONE]: person.get(PHONE),
    [WORK_APPOINTMENTS_BY_WORKSITE_PLAN]: person.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN),
    [WORKSITES_BY_WORKSITE_PLAN]: person.get(WORKSITES_BY_WORKSITE_PLAN),
  };
};

// $FlowFixMe
export default connect(mapStateToProps)(ParticipantProfileContainer);
