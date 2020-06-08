// @flow
import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { fromJS, OrderedMap, Map } from 'immutable';
import { DataGrid, Modal, Spinner } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { deleteCheckIn, resetDeleteCheckInRequestState } from '../assignedworksites/WorksitePlanActions';
import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../participants/ParticipantsConstants';
import { APP, STATE, WORKSITE_PLANS } from '../../../utils/constants/ReduxStateConsts';
import { OL } from '../../../core/style/Colors';

const { CHECK_INS } = APP_TYPE_FQNS;
const {
  CHECKED_IN,
  DATETIME_END,
  DATETIME_START,
  HOURS_WORKED,
} = PROPERTY_TYPE_FQNS;
const { SELECTED_ORG_ID } = APP;
const { ACTIONS, DELETE_CHECK_IN, REQUEST_STATE } = WORKSITE_PLANS;

const labelMap :OrderedMap = OrderedMap({
  checkedIn: 'Checked in?',
  date: 'Date',
  timeIn: 'Time in',
  timeOut: 'Time out',
  hoursWorked: 'Hours worked',
});

const ModalWrapper = styled.div`
  width: 100%;
`;

const SpinnerWrapper = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const FailureMessage = styled.div`
  color: ${OL.RED01};
  margin-top: 10px;
`;

type Props = {
  appointmentEKID :UUID;
  checkIn :Map;
  isOpen :boolean;
  onClose :() => void;
};

const CheckInDetailsModal = ({
  appointmentEKID,
  checkIn,
  isOpen,
  onClose,
} :Props) => {

  const deleteCheckInRequestState :RequestState = useSelector((store :Map) => store.getIn([
    STATE.WORKSITE_PLANS,
    ACTIONS,
    DELETE_CHECK_IN,
    REQUEST_STATE
  ]));
  const dispatch = useDispatch();
  useEffect(() => {
    if (deleteCheckInRequestState === RequestStates.SUCCESS) {
      onClose();
      dispatch(resetDeleteCheckInRequestState());
    }
  }, [deleteCheckInRequestState, dispatch, onClose]);

  const checkInEKID :UUID = getEntityKeyId(checkIn);
  const orgId :UUID = useSelector((store :Map) => store.getIn([STATE.APP, SELECTED_ORG_ID], ''));
  const checkInESID :UUID = useSelector((store :Map) => store.getIn([
    STATE.APP,
    APP.ENTITY_SET_IDS_BY_ORG,
    orgId,
    CHECK_INS
  ]));
  const removeCheckIn = useCallback(
    () => dispatch(deleteCheckIn({
      checkInToDelete: [{ entitySetId: checkInESID, entityKeyIds: [checkInEKID] }],
      appointmentEKID
    })),
    [appointmentEKID, checkInEKID, checkInESID, dispatch]
  );

  const {
    [CHECKED_IN]: checkedInBoolean,
    [DATETIME_START]: dateTimeStart,
    [DATETIME_END]: dateTimeEnd,
    [HOURS_WORKED]: hoursWorked,
  } = getEntityProperties(checkIn, [CHECKED_IN, DATETIME_END, DATETIME_START, HOURS_WORKED]);

  const checkedIn :string = checkedInBoolean ? 'Yes' : 'No';

  const dateTimeStartAsDT :DateTime = DateTime.fromISO(dateTimeStart);
  const dateTimeEndAsDT :DateTime = DateTime.fromISO(dateTimeEnd);
  let timeIn :string = EMPTY_FIELD;
  let timeOut :string = EMPTY_FIELD;
  if (dateTimeStartAsDT.isValid) timeIn = dateTimeStartAsDT.toLocaleString(DateTime.TIME_SIMPLE);
  if (dateTimeEndAsDT.isValid) timeOut = dateTimeEndAsDT.toLocaleString(DateTime.TIME_SIMPLE);

  const date :string = dateTimeStartAsDT.isValid ? dateTimeStartAsDT.toLocaleString(DateTime.DATE_SHORT) : EMPTY_FIELD;
  const data :Map = fromJS({
    checkedIn,
    date,
    hoursWorked,
    timeIn,
    timeOut,
  });

  return (
    <Modal
        isVisible={isOpen}
        onClickSecondary={removeCheckIn}
        onClose={onClose}
        shouldStretchButtons
        textSecondary="Remove Check-In"
        textTitle="Check-In"
        viewportScrolling>
      <ModalWrapper>
        {
          (deleteCheckInRequestState === RequestStates.PENDING)
            && (
              <SpinnerWrapper>
                <Spinner />
              </SpinnerWrapper>
            )
        }
        {
          (deleteCheckInRequestState === RequestStates.STANDBY || deleteCheckInRequestState === RequestStates.FAILURE)
            && (
              <DataGrid
                  columns={2}
                  data={data}
                  labelMap={labelMap} />
            )
        }
        {
          (deleteCheckInRequestState === RequestStates.FAILURE)
            && (<FailureMessage>Delete failed. Please try again.</FailureMessage>)
        }
      </ModalWrapper>
    </Modal>
  );
};

export default CheckInDetailsModal;
