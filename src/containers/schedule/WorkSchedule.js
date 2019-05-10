// @flow
import React, { Component } from 'react';
import { Map, List } from 'immutable';
import { withRouter } from 'react-router-dom';
import { DateTime } from 'luxon';

import AppointmentBlock from './AppointmentBlock';

import {
  ButtonWrapper,
  ContainerHeader,
  ContainerInnerWrapper,
  ContainerOuterWrapper,
  HeaderWrapper,
  Menu,
  MenuItem,
  RowWrapper
} from '../../components/Layout';
import { TertiaryButton, TertiaryButtonLink } from '../../components/controls/index';
import { isDefined } from '../../utils/LangUtils';
import { appts } from '../worksites/FakeData';

type Props = {
  appointments ? :List;
  buttonRoute ? :string;
  printable ? :boolean;
  scheduleViews :string[];
};

type State = {
  selectedView :string;
};

// eslint-disable-next-line react/prefer-stateless-function
class WorkSchedule extends Component<Props, State> {
  static defaultProps = {
    appointments: List(),
    buttonRoute: undefined,
    printable: false,
  }

  constructor(props :Props) {
    super(props);

    this.state = {
      selectedView: props.scheduleViews[1],
    };
  }

  changeView = (view :string) => {
    this.setState({ selectedView: view });
  }

  filterAppointmentList = (sortedList :List) => {
    const { selectedView } = this.state;
    const { scheduleViews } = this.props;
    let filteredList = List();
    const today = DateTime.local();

    if (selectedView === scheduleViews[0]) {
      filteredList = sortedList;
    }
    if (selectedView === scheduleViews[1]) {
      filteredList = sortedList.filter((appt :Map) => (
        DateTime.fromISO(appt.get('datetimestart')) > today
      ));
    }
    if (selectedView === scheduleViews[2]) {
      filteredList = sortedList.filter((appt :Map) => (
        DateTime.fromISO(appt.get('datetimestart')) < today
      ));
    }
    return filteredList;
  }

  filterOutPastAppointments = (apptsList :List) => {
    const today = DateTime.local();
    return apptsList.filter((appt :Map) => (
      DateTime.fromISO(appt.get('datetimestart')) > today
    ));
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

  sortAppointmentsByDate = () => {
    const sortedAppointments = appts.sort((appt1, appt2) => {
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
    const {
      buttonRoute,
      printable,
      scheduleViews
    } = this.props;
    return (
      <ContainerOuterWrapper>
        <HeaderWrapper>
          <ContainerHeader>Worksite Schedule</ContainerHeader>
        </HeaderWrapper>
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
            {
              printable ? <TertiaryButton>Print Schedule</TertiaryButton> : null
            }
            {
              isDefined(buttonRoute) ? (
                <TertiaryButtonLink
                    to={buttonRoute}>
                  Create Appointment
                </TertiaryButtonLink>
              ) : null
            }
          </ButtonWrapper>
        </RowWrapper>
        <ContainerInnerWrapper style={{ padding: '0', marginTop: '15px' }}>
          { this.renderAppointmentList() }
        </ContainerInnerWrapper>
      </ContainerOuterWrapper>
    );
  }
}

export default withRouter(WorkSchedule);
