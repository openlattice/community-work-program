// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CheckInForm from './CheckInForm';

import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, CREATE_WORK_APPOINTMENTS, REQUEST_STATE } = PERSON;

type Props = {
  appointment :Map;
  checkInForAppointmentState :RequestState;
  isOpen :boolean;
  onClose :() => void;
};

class CheckInModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { checkInForAppointmentState, onClose } = this.props;
    const { checkInForAppointmentState: prevSumbitState } = prevProps;
    if (checkInForAppointmentState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      appointment,
      checkInForAppointmentState,
      isOpen,
      onClose,
    } = this.props;

    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Check In Participant"
          viewportScrolling>
        <CheckInForm
            appointment={appointment}
            isLoading={checkInForAppointmentState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  checkInForAppointmentState: state.getIn([STATE.PERSON, ACTIONS, CREATE_WORK_APPOINTMENTS, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(CheckInModal);
