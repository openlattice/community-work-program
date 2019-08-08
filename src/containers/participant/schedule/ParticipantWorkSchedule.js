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
import { OL } from '../../../core/style/Colors';

const OuterWrapper = styled(ContainerOuterWrapper)`
  width: 100%;
`;

const RowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
`;

const MenuItem = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  color: ${props => (props.selected ? OL.GREY15 : OL.GREY02)};
  font-weight: 600;
  &:hover {
    cursor: pointer;
    color: ${OL.GREY01};
  }
`;

const scheduleViews :string[] = [
  'All',
  'Upcoming',
  'Past',
];

type Props = {
  workAppointmentsByWorksitePlan :Map;
  worksiteNamesByWorksitePlan :Map;
};

type State = {
  selectedScheduleList :string;
};

class ParticipantWorkSchedule extends Component<Props, State> {

  state = {
    selectedScheduleList: scheduleViews[1],
  };

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

  changeScheduleView = (view :string) => {
    this.setState({ selectedScheduleView: view });
  }

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
    const { selectedScheduleList } = this.state;
    return (
      <OuterWrapper>
        <RowWrapper>
          <Menu>
            {
              scheduleViews.map((view :string) => {
                const current = selectedScheduleList === view;
                return (
                  <MenuItem
                      key={view}
                      onClick={() => this.changeScheduleView(view)}
                      selected={current}>
                    {view}
                  </MenuItem>
                );
              })
            }
          </Menu>
        </RowWrapper>
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
