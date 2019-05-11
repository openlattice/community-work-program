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

type Props = {
  appointments :Map;
  buttonRoute ? :string;
  printable ? :boolean;
  scheduleViews :string[];
};

type State = {
  selectedView :string;
};

class WorkSchedule extends Component<Props, State> {
  static defaultProps = {
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

  renderAppointmentList = () => {
    const { appointments } = this.props;
    const { selectedView } = this.state;
    return appointments.get(selectedView).map(appt => (
      <AppointmentBlock
          appointment={appt}
          key={appt.get('id')} />
    ));
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
