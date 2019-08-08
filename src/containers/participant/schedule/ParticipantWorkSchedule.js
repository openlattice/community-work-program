// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { faCalendarTimes } from '@fortawesome/pro-light-svg-icons';
import {
  Card,
  CardSegment,
  IconSplash,
} from 'lattice-ui-kit';

import AppointmentBlock from '../../../components/schedule/AppointmentBlock';

import { ContainerOuterWrapper } from '../../../components/Layout';
import { getEntityKeyId, sortEntitiesByDateProperty } from '../../../utils/DataUtils';
import { INCIDENT_START_DATETIME } from '../../../core/edm/constants/FullyQualifiedNames';

const OuterWrapper = styled(ContainerOuterWrapper)`
  width: 100%;
`;

type Props = {
  workAppointmentsByWorksitePlan :Map;
  worksiteNamesByWorksitePlan :Map;
};

type State = {
};

class ParticipantWorkSchedule extends Component<Props, State> {

  createWorksiteNameByAppointmentMap = () => {
    const { workAppointmentsByWorksitePlan, worksiteNamesByWorksitePlan } = this.props;
    const worksiteNamesByAppointmentEKID = Map().withMutations((map :Map) => {
      workAppointmentsByWorksitePlan.forEach((apptList :List, worksitePlanEKID :UUID) => {
        apptList.forEach((appt :Map) => {
          const apptEKID :UUID = getEntityKeyId(appt);
          const apptWorksiteName = worksiteNamesByWorksitePlan.get(worksitePlanEKID);
          map.set(apptEKID, apptWorksiteName);
        });
      });
    });
    return worksiteNamesByAppointmentEKID;
  }

  sortAppointmentsByDate = (appointments :List) => (
    sortEntitiesByDateProperty(appointments, [INCIDENT_START_DATETIME])
  );

  renderAppointmentList = () => {
    const { workAppointmentsByWorksitePlan } = this.props;

    const worksiteNamesByAppointmentEKID = this.createWorksiteNameByAppointmentMap();
    const appointments :List = workAppointmentsByWorksitePlan
      .valueSeq()
      .toList()
      .flatten(1);
    const sortedAppointments :List = this.sortAppointmentsByDate(appointments);

    return sortedAppointments.map((appointment :Map) => {
      const appointmentEKID = getEntityKeyId(appointment);
      const worksiteName :string = worksiteNamesByAppointmentEKID.get(appointmentEKID);
      return (
        <AppointmentBlock
            key={appointmentEKID}
            appointment={appointment}
            worksiteName={worksiteName} />
      );
    });
  }

  render() {
    const { workAppointmentsByWorksitePlan } = this.props;
    return (
      <OuterWrapper>
        {
          workAppointmentsByWorksitePlan.isEmpty()
            ? (
              <Card>
                <CardSegment>
                  <IconSplash
                      caption="No Appointments Scheduled"
                      icon={faCalendarTimes}
                      size="3x" />
                </CardSegment>
              </Card>
            )
            : this.renderAppointmentList()
        }
      </OuterWrapper>
    );
  }
}

export default ParticipantWorkSchedule;
