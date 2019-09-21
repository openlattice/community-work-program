// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  IconButton
} from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTrash } from '@fortawesome/pro-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/pro-light-svg-icons';

// import DeleteAppointmentModal from './DeleteAppointmentModal';

import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';

const DELETE_APPOINTMENT = 'isDeleteAppointmentModalVisible';

const OuterWrapper = styled.div`
  width: 100%;
`;

const InnerWrapper = styled.div`
  display: grid;
  grid-template-columns: 50px 150px 150px 150px 150px;
  grid-gap: 5px 40px;
`;

// const DateText = styled.span`
//   align-items: center;
//   display: flex;
//   font-size: 18px;
//   font-weight: 600;
//   margin-left: 20px;
// `;

const Text = styled.span`
  align-items: center;
  display: flex;
  font-size: 14px;
`;

type Props = {
  result :Map;
};

type State = {
  isCheckInDetailsModalVisible :boolean;
  isCheckInModalVisible :boolean;
  isDeleteAppointmentModalVisible :boolean;
};

class AppointmentContainer extends Component<Props, State> {

  handleShowModal = (modalName :string) => {
    this.setState({
      [modalName]: true,
    });
  }

  handleHideModal = (modalName :string) => {
    this.setState({
      [modalName]: false,
    });
  }

  render() {
    const { result } = this.props;
    // const {
    //   day,
    //   personName,
    //   worksiteName,
    //   hours,
    // } = result;
    const day = result.get('day');
    const personName = result.get('personName');
    const worksiteName = result.get('worksiteName');
    const hours = result.get('hours');

    return (
      <OuterWrapper>
        <Card>
          <CardSegment padding="lg">
            <InnerWrapper>
              <FontAwesomeIcon icon={faCalendarAlt} size="sm" />
              <Text>{ day }</Text>
              <Text>{ personName }</Text>
              <Text>{ worksiteName }</Text>
              <Text>{ hours }</Text>
            </InnerWrapper>
          </CardSegment>
        </Card>
      </OuterWrapper>
    );
  }
}

// $FlowFixMe
export default AppointmentContainer;
