// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import { withRouter } from 'react-router-dom';

import AppointmentBlock from './AppointmentBlock';
import * as Routes from '../../core/router/Routes';

import { ButtonWrapper } from '../../components/Layout';
import { TertiaryButton, TertiaryButtonLink } from '../../components/controls/index';
import { OL } from '../../utils/constants/Colors';
import { tommyAppts } from '../participants/FakeData';

const ComponentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const RowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 15px 0 20px 0;
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

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const scheduleViews = [
  'All',
  'Upcoming',
  'Past',
];

type Props = {
  person :Map;
};

type State = {
  isAppointmentModalVisible :boolean;
  selectedView :string;
};

// eslint-disable-next-line react/prefer-stateless-function
class ParticipantWorkSchedule extends Component<Props, State> {
  constructor(props :Props) {
    super(props);

    this.state = {
      isAppointmentModalVisible: false,
      selectedView: scheduleViews[1],
    };
  }

  changeView = (view :string) => {
    this.setState({ selectedView: view });
  }

  filterAppointmentList = (sortedList :List) => {
    const { selectedView } = this.state;
    let filteredList = List();
    const today = new Date().getTime();

    if (selectedView === scheduleViews[0]) {
      filteredList = sortedList;
    }
    if (selectedView === scheduleViews[1]) {
      filteredList = sortedList.filter((appt :Map) => (
        new Date(appt.get('datetimestart')).getTime() > today));
    }
    if (selectedView === scheduleViews[2]) {
      filteredList = sortedList.filter((appt :Map) => (
        new Date(appt.get('datetimestart')).getTime() < today));
    }
    return filteredList;
  }

  hideAppointmentModal = () => {
    this.setState({ isAppointmentModalVisible: false });
  }

  renderAppointmentList = () => {
    const sortedAppointmentsList = this.sortAppointmentsByDate();
    const filteredSortedList = this.filterAppointmentList(sortedAppointmentsList);
    return filteredSortedList.map(appt => (
      <AppointmentBlock
          appointment={appt}
          key={appt.get('id')} />
    ));
  }

  renderAppointmentModal = () => {
    const { person } = this.props;
    const { isAppointmentModalVisible } = this.state;
    return (
      <NewAppointmentModal
          hideModal={this.hideAppointmentModal}
          isVisible={isAppointmentModalVisible}
          person={person} />
    );
  }

  showAppointmentModal = () => {
    this.setState({ isAppointmentModalVisible: true });
  }

  sortAppointmentsByDate = () => {
    // const { person } = this.props;
    // get person's appointments
    const sortedAppointments = tommyAppts.sort((appt1, appt2) => {
      const datetime1 = appt1.get('datetimestart');
      const datetime2 = appt2.get('datetimestart');
      if (datetime1 < datetime2) {
        return -1;
      }
      if (datetime1 > datetime2) {
        return 1;
      }
      return 0;
    });
    return sortedAppointments;
  }

  render() {
    const { selectedView } = this.state;
    const { person } = this.props;
    return (
      <ComponentWrapper>
        <RowWrapper>
          <Menu>
            {
              scheduleViews.map((view :string) => {
                const current = selectedView === view;
                return (
                  <MenuItem
                      key={view}
                      onClick={() => this.changeView(view)}
                      selected={current}>
                    {view}
                  </MenuItem>
                );
              })
            }
          </Menu>
          <ButtonWrapper>
            <TertiaryButton>Print Schedule</TertiaryButton>
            <TertiaryButtonLink
                to={Routes.NEW_APPOINTMENT.replace(':subjectId', person.get('personId'))}>
              Create Appointment
            </TertiaryButtonLink>
          </ButtonWrapper>
        </RowWrapper>
        <BodyWrapper>
          { this.renderAppointmentList() }
        </BodyWrapper>
      </ComponentWrapper>
    );
  }
}

export default withRouter(ParticipantWorkSchedule);
