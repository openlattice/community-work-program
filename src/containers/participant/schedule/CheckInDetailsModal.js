// @flow
import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { fromJS, OrderedMap, Map } from 'immutable';
import { DataGrid, Modal } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { deleteCheckIn } from '../assignedworksites/WorksitePlanActions';
import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../participants/ParticipantsConstants';
import { APP, STATE, WORKSITE_PLANS } from '../../../utils/constants/ReduxStateConsts';

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
  padding-bottom: 30px;
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
  useEffect(() => {
    if (deleteCheckInRequestState === RequestStates.SUCCESS) {
      onClose();
    }
  }, [deleteCheckInRequestState, onClose]);

  const dispatch = useDispatch();
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
      checkInToDelete: [{ entitySetId: checkInESID, entityKeyId: checkInEKID }],
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
  const date :string = DateTime.fromISO(dateTimeStart).toLocaleString(DateTime.DATE_SHORT);
  const timeIn :string = DateTime.fromISO(dateTimeStart).toLocaleString(DateTime.TIME_SIMPLE) || EMPTY_FIELD;
  const timeOut :string = DateTime.fromISO(dateTimeEnd).toLocaleString(DateTime.TIME_SIMPLE) || EMPTY_FIELD;
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
        onClose={onClose}
        onClickSecondary={removeCheckIn}
        shouldStretchButtons
        textTitle="Check-In"
        textSecondary="Remove Check-In"
        viewportScrolling>
      <ModalWrapper>
        <DataGrid
            columns={2}
            data={data}
            labelMap={labelMap} />
      </ModalWrapper>
    </Modal>
  );
};

export default CheckInDetailsModal;
