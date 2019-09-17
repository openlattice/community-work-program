// @flow
import React, { Component } from 'react';
import { List, Map } from 'immutable';
import { Card, CardSegment } from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'lattice';

import LogoLoader from '../../../components/LogoLoader';

import { PEOPLE_FQNS, WORKSITE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';

const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const { NAME } = WORKSITE_FQNS;

type Props = {
  actions:{
    getParticipant :RequestSequence;
  };
  getParticipantRequestState :RequestState;
  participant :Map;
  workAppointmentsByWorksitePlan :Map;
  worksitesByWorksitePlan :Map;
};

type State = {
  appointments :List;
  appointmentsByWorksiteName :Map;
};

class PrintWorkScheduleContainer extends Component<Props, State> {

  state = {
    appointments: List(),
    appointmentsByWorksiteName: Map(),
  };

  componentDidMount() {
    this.setAppointments();
    this.setWorksiteNames();
  }

  setAppointments = () => {
    const { workAppointmentsByWorksitePlan } = this.props;

    const appointments :List = List().withMutations((list :List) => {

      workAppointmentsByWorksitePlan.forEach((appointmentsList :List) => {
        appointmentsList.forEach((appointment :Map) => {
          list.push(appointment);
        });
      });
    });

    this.setState({ appointments });
  }

  setWorksiteNames = () => {
    const { workAppointmentsByWorksitePlan, worksitesByWorksitePlan } = this.props;

    let appointmentsByWorksiteName :Map = Map();
    workAppointmentsByWorksitePlan.forEach((appointmentsList :Map, worksitePlanEKID :UUID) => {

      const worksite :Map = worksitesByWorksitePlan.get(worksitePlanEKID);
      const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
      appointmentsList.forEach((appointment :Map) => {
        const appointmentEKID :UUID = getEntityKeyId(appointment);
        appointmentsByWorksiteName = appointmentsByWorksiteName.set(appointmentEKID, worksiteName);
      });
    });

    this.setState({ appointmentsByWorksiteName });
  }

  render() {
    const {
      getParticipantRequestState,
      participant,
    } = this.props;

    if (getParticipantRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const {
      [FIRST_NAME]: firstName,
      [LAST_NAME]: lastName
    } = getEntityProperties(participant, [FIRST_NAME, LAST_NAME]);
    const personFullName = `${firstName} ${lastName}`;

    return (
      <Card>
        <CardSegment padding="lg" vertical>
          { personFullName }
        </CardSegment>
      </Card>
    );
  }
}

export default PrintWorkScheduleContainer;
