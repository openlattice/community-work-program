// @flow
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  IconButton,
  StyleUtils
} from 'lattice-ui-kit';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faPen, faTrash } from '@fortawesome/pro-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/pro-light-svg-icons';

import CheckInModal from '../participant/schedule/CheckInModal';
import CheckInDetailsModal from '../participant/schedule/CheckInDetailsModal';
import DeleteAppointmentModal from '../participant/schedule/DeleteAppointmentModal';
import EditAppointmentModal from '../participant/schedule/EditAppointmentModal';

import * as Routes from '../../core/router/Routes';
import { isDefined } from '../../utils/LangUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import {
  PERSON,
  STATE,
  WORKSITE_PLANS,
  WORK_SCHEDULE,
} from '../../utils/constants/ReduxStateConsts';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../core/style/Colors';
import { ButtonWrapper } from '../../components/Layout';

const { getStyleVariation } = StyleUtils;
const { CHECK_INS_BY_APPOINTMENT } = WORKSITE_PLANS;
const { PARTICIPANT } = PERSON;
const { PERSON_BY_APPOINTMENT_EKID } = WORK_SCHEDULE;
const { ENTITY_KEY_ID, FIRST_NAME, LAST_NAME } = PROPERTY_TYPE_FQNS;

const OuterWrapper = styled.div`
  width: 100%;
`;

const AppointmentCardSegment = styled(CardSegment)`
  display: flex;
  justify-content: space-between;
`;

const getColumns = getStyleVariation('columns', {
  profile: '50px 160px 160px 160px',
  schedule: '15px 130px 130px 120px 140px 130px',
});

const InnerWrapper = styled.div`
  display: grid;
  grid-template-columns: ${getColumns};
  grid-gap: 5px 30px;
  min-height: 40px;
`;

const sharedTextStyles = css`
  align-items: center;
  display: flex;
  font-size: 14px;
`;

const Text = styled.span`
  ${sharedTextStyles}
`;

const LinkAsText = styled(NavLink)`
  ${sharedTextStyles}
  color: ${OL.GREY01};
  text-decoration: none;

  &:hover {
    color: ${OL.PURPLE02};
    cursor: pointer;
  }
`;

const CheckWrapper = styled(ButtonWrapper)`
  margin: 0;
`;

const ActionButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
`;

type Props = {
  checkInsByAppointment :Map;
  participant :Map;
  personByAppointmentEKID :Map;
  result :Map;
};

const AppointmentContainer = ({
  checkInsByAppointment,
  participant,
  personByAppointmentEKID,
  result,
} :Props) => {

  const [isCheckInModalVisible, handleCheckInModalVisibility] = useState(false);
  const [isCheckInDetailsModalVisible, handleCheckInDetailsModalVisibility] = useState(false);
  const [isDeleteAppointmentModalVisible, handleDeleteAppointmentModalVisibility] = useState(false);
  const [isEditAppointmentModalVisible, handleEditAppointmentModalVisibility] = useState(false);

  const [day, setDay] = useState('');
  const [hours, setHours] = useState('');

  // use effect for editable properties
  useEffect(() => {
    const storedDay = result.get('day');
    const storedHours = result.get('hours');
    setDay(storedDay);
    setHours(storedHours);
  }, [result]);

  const personName = result.get('personName');
  const worksiteName = result.get('worksiteName');
  const courtType = result.get('courtType');

  const appointmentEKID :UUID = result.get(ENTITY_KEY_ID);
  const checkIn :Map = checkInsByAppointment.get(appointmentEKID);
  const checkedIn :boolean = isDefined(checkIn);

  let personEKID :UUID = '';
  if (isDefined(personByAppointmentEKID)) {
    personEKID = getEntityKeyId(personByAppointmentEKID.get(appointmentEKID));
  }
  if (!isDefined(personByAppointmentEKID.get(appointmentEKID)) || personByAppointmentEKID.isEmpty()) {
    personEKID = getEntityKeyId(participant);
  }

  let modalDisplayOfPersonName = personName;
  if (!personName) {
    const {
      [FIRST_NAME]: firstName,
      [LAST_NAME]: lastName
    } = getEntityProperties(participant, [FIRST_NAME, LAST_NAME]);
    modalDisplayOfPersonName = `${firstName} ${lastName}`;
  }
  const columns = personName || courtType ? 'schedule' : 'profile';
  return (
    <OuterWrapper>
      <Card>
        <AppointmentCardSegment padding="sm">
          <InnerWrapper columns={columns}>
            <Text>
              <FontAwesomeIcon icon={faCalendarAlt} size="sm" />
            </Text>
            <Text>{ day }</Text>
            {
              personName && (
                <LinkAsText
                    to={Routes.PARTICIPANT_PROFILE.replace(':participantId', personEKID)}>
                  { personName }
                </LinkAsText>
              )
            }
            <Text>{ worksiteName }</Text>
            <Text>{ hours }</Text>
            {
              courtType && (
                <Text>{ courtType }</Text>
              )
            }
          </InnerWrapper>
          <ActionButtonsWrapper>
            {
              checkedIn
                ? (
                  <CheckWrapper onClick={() => handleCheckInDetailsModalVisibility(true)}>
                    <FontAwesomeIcon icon={faCheckCircle} color={OL.PURPLE02} size="lg" />
                  </CheckWrapper>
                )
                : (
                  <Button
                      onClick={() => handleCheckInModalVisibility(true)}
                      mode="subtle">
                    Check in
                  </Button>
                )
            }
            {
              !checkedIn && (
                <ActionButtonsWrapper>
                  <IconButton
                      icon={<FontAwesomeIcon icon={faPen} color={OL.GREY04} size="sm" />}
                      mode="subtle"
                      onClick={() => handleEditAppointmentModalVisibility(true)} />
                  <IconButton
                      icon={<FontAwesomeIcon icon={faTrash} color={OL.GREY04} size="sm" />}
                      mode="subtle"
                      onClick={() => handleDeleteAppointmentModalVisibility(true)} />
                </ActionButtonsWrapper>
              )
            }
          </ActionButtonsWrapper>
        </AppointmentCardSegment>
      </Card>
      <CheckInModal
          appointment={result}
          isOpen={isCheckInModalVisible}
          onClose={() => handleCheckInModalVisibility(false)}
          personEKID={personEKID}
          personName={modalDisplayOfPersonName} />
      <CheckInDetailsModal
          appointmentEKID={appointmentEKID}
          checkIn={checkIn}
          isOpen={isCheckInDetailsModalVisible}
          onClose={() => handleCheckInDetailsModalVisibility(false)} />
      <DeleteAppointmentModal
          appointment={result}
          appointmentEKID={appointmentEKID}
          isOpen={isDeleteAppointmentModalVisible}
          onClose={() => handleDeleteAppointmentModalVisibility(false)} />
      <EditAppointmentModal
          appointment={result}
          appointmentEKID={appointmentEKID}
          isOpen={isEditAppointmentModalVisible}
          onClose={() => handleEditAppointmentModalVisibility(false)}
          personName={modalDisplayOfPersonName} />
    </OuterWrapper>
  );
};

const mapStateToProps = (state :Map) => {
  const person = state.get(STATE.PERSON);
  const worksitePlans = state.get(STATE.WORKSITE_PLANS);
  const workSchedule = state.get(STATE.WORK_SCHEDULE);
  return ({
    [CHECK_INS_BY_APPOINTMENT]: worksitePlans.get(CHECK_INS_BY_APPOINTMENT),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PERSON_BY_APPOINTMENT_EKID]: workSchedule.get(PERSON_BY_APPOINTMENT_EKID),
  });
};

// $FlowFixMe
export default connect(mapStateToProps)(AppointmentContainer);
