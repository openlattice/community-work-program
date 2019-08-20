// @flow
import React from 'react';
import styled from 'styled-components';
import { fromJS, OrderedMap, Map } from 'immutable';
import { DataGrid, Modal } from 'lattice-ui-kit';
import { DateTime } from 'luxon';

import { getEntityProperties } from '../../../utils/DataUtils';
import {
  CHECK_IN_FQNS,
  DATETIME_END,
  DATETIME_START,
  WORKSITE_PLAN_FQNS
} from '../../../core/edm/constants/FullyQualifiedNames';

const { CHECKED_IN } = CHECK_IN_FQNS;
const { HOURS_WORKED } = WORKSITE_PLAN_FQNS;

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
  checkIn :Map;
  isOpen :boolean;
  onClose :() => void;
};

const CheckInDetailsModal = ({
  checkIn,
  isOpen,
  onClose,
} :Props) => {

  const {
    [CHECKED_IN]: checkedInBoolean,
    [DATETIME_START]: dateTimeStart,
    [DATETIME_END]: dateTimeEnd,
    [HOURS_WORKED]: hoursWorked,
  } = getEntityProperties(checkIn, [CHECKED_IN, DATETIME_END, DATETIME_START, HOURS_WORKED]);

  const checkedIn :string = checkedInBoolean ? 'Yes' : 'No';
  const date :string = DateTime.fromISO(dateTimeStart).toLocaleString(DateTime.DATE_SHORT);
  const timeIn :string = DateTime.fromISO(dateTimeStart).toLocaleString(DateTime.TIME_SIMPLE);
  const timeOut :string = DateTime.fromISO(dateTimeEnd).toLocaleString(DateTime.TIME_SIMPLE);

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
        textTitle="Check In"
        viewportScrolling>
      <ModalWrapper>
        <DataGrid
            columns={3}
            data={data}
            labelMap={labelMap} />
      </ModalWrapper>
    </Modal>
  );
};

export default CheckInDetailsModal;
