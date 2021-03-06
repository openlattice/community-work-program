/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled, { css } from 'styled-components';
import { faCalendarAlt } from '@fortawesome/pro-light-svg-icons';
import {
  faCheckCircle,
  faExclamationCircle,
  faPen,
  faTrash,
} from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  Colors,
  IconButton,
  StyleUtils
} from 'lattice-ui-kit';
import { DataUtils, useGoToRoute } from 'lattice-utils';
import { connect } from 'react-redux';
import type { UUID } from 'lattice';

import CheckInDetailsModal from '../participant/schedule/CheckInDetailsModal';
import CheckInModal from '../participant/schedule/CheckInModal';
import DeleteAppointmentModal from '../participant/schedule/DeleteAppointmentModal';
import EditAppointmentModal from '../participant/schedule/EditAppointmentModal';
import * as Routes from '../../core/router/Routes';
import { ButtonWrapper } from '../../components/Layout';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import {
  PERSON,
  STATE,
  WORKSITE_PLANS,
  WORK_SCHEDULE,
} from '../../utils/constants/ReduxStateConsts';
import { get24HourTimeForCheckIn, getHoursForDisplay, getHoursScheduled } from '../participant/utils/CheckInUtils';

const { getStyleVariation } = StyleUtils;
const { getPropertyValue } = DataUtils;
const { NEUTRAL, PURPLE, YELLOW } = Colors;
const { CHECK_INS_BY_APPOINTMENT, WORKSITES_BY_WORKSITE_PLAN, WORKSITE_PLAN_EKID_BY_APPOINTMENT_EKID } = WORKSITE_PLANS;
const { PARTICIPANT } = PERSON;
const { PERSON_BY_APPOINTMENT_EKID } = WORK_SCHEDULE;
const {
  ENTITY_KEY_ID,
  FIRST_NAME,
  HOURS_WORKED,
  LAST_NAME,
} = PROPERTY_TYPE_FQNS;

const CheckedInIcon = (
  <FontAwesomeIcon icon={faCheckCircle} color={PURPLE.P300} size="lg" />
);

const ExclamationIcon = (
  <FontAwesomeIcon icon={faExclamationCircle} color={YELLOW.Y300} size="lg" />
);

const OuterWrapper = styled.div`
  width: 100%;
`;

const AppointmentCardSegment = styled(CardSegment)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const getColumns = getStyleVariation('columns', {
  profile: '50px 130px 130px 130px 100px',
  schedule: '15px 100px 130px 100px 140px 60px 100px',
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
  worksitePlanEKIDByAppointmentEKID :Map;
  worksitesByWorksitePlan :Map;
};

const AppointmentContainer = ({
  checkInsByAppointment,
  participant,
  personByAppointmentEKID,
  result,
  worksitePlanEKIDByAppointmentEKID,
  worksitesByWorksitePlan,
} :Props) => {

  const [isCheckInModalVisible, handleCheckInModalVisibility] = useState(false);
  const [isCheckInDetailsModalVisible, handleCheckInDetailsModalVisibility] = useState(false);
  const [isDeleteAppointmentModalVisible, handleDeleteAppointmentModalVisibility] = useState(false);
  const [isEditAppointmentModalVisible, handleEditAppointmentModalVisibility] = useState(false);

  const [day, setDay] = useState('');
  const [hours, setHours] = useState('');
  const [numHours, setNumHours] = useState(0);

  // use effect for editable properties
  useEffect(() => {
    const storedDay = result.get('day');
    const storedHours = result.get('hours');
    const { timeIn, timeOut } = get24HourTimeForCheckIn(result.get('hours'));
    const hoursScheduled = getHoursScheduled(timeIn, timeOut);
    setDay(storedDay);
    setHours(storedHours);
    setNumHours(hoursScheduled);
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
  const assignedWorksites :List = worksitesByWorksitePlan.valueSeq().toList();

  let checkedInSymbol = CheckedInIcon;
  const numberHoursWorked = getPropertyValue(checkIn, [HOURS_WORKED, 0]);
  if (numberHoursWorked === 0) {
    checkedInSymbol = ExclamationIcon;
  }
  const hoursToDisplay = getHoursForDisplay(numHours, checkIn);

  const worksitePlanEKID :UUID = worksitePlanEKIDByAppointmentEKID.get(appointmentEKID, '');

  const goToParticipantProfile = useGoToRoute(
    Routes.PARTICIPANT_PROFILE.replace(':participantId', personEKID)
  );
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
                <Button
                    onClick={goToParticipantProfile}
                    size="small"
                    variant="text">
                  { personName }
                </Button>
              )
            }
            <Text>{ worksiteName }</Text>
            <Text>{ hours }</Text>
            <Text>{ `${hoursToDisplay} hrs` }</Text>
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
                    { checkedInSymbol }
                  </CheckWrapper>
                )
                : (
                  <Button
                      color="primary"
                      onClick={() => handleCheckInModalVisibility(true)}
                      variant="text">
                    Check in
                  </Button>
                )
            }
            {
              !checkedIn && (
                <ActionButtonsWrapper>
                  <IconButton onClick={() => handleEditAppointmentModalVisibility(true)}>
                    <FontAwesomeIcon icon={faPen} color={NEUTRAL.N500} />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteAppointmentModalVisibility(true)}>
                    <FontAwesomeIcon icon={faTrash} color={NEUTRAL.N500} />
                  </IconButton>
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
          onClose={() => handleCheckInDetailsModalVisibility(false)}
          worksitePlanEKID={worksitePlanEKID} />
      <DeleteAppointmentModal
          appointment={result}
          appointmentEKID={appointmentEKID}
          isOpen={isDeleteAppointmentModalVisible}
          onClose={() => handleDeleteAppointmentModalVisibility(false)} />
      <EditAppointmentModal
          appointment={result}
          appointmentEKID={appointmentEKID}
          assignedWorksites={assignedWorksites}
          isOpen={isEditAppointmentModalVisible}
          onClose={() => handleEditAppointmentModalVisibility(false)}
          personEKID={personEKID}
          personName={modalDisplayOfPersonName}
          worksitesByWorksitePlan={worksitesByWorksitePlan} />
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
    [WORKSITES_BY_WORKSITE_PLAN]: worksitePlans.get(WORKSITES_BY_WORKSITE_PLAN),
    [WORKSITE_PLAN_EKID_BY_APPOINTMENT_EKID]: worksitePlans.get(WORKSITE_PLAN_EKID_BY_APPOINTMENT_EKID),
  });
};

// $FlowFixMe
export default connect(mapStateToProps)(AppointmentContainer);
