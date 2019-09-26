// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import EditAppointmentForm from './EditAppointmentForm';

import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE } = PERSON;

type Props = {
  appointment :Map;
  appointmentEKID :UUID;
  editAppointmentRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
};

class DeleteAppointmentModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { editAppointmentRequestState, onClose } = this.props;
    const { editAppointmentRequestState: prevSumbitState } = prevProps;
    if (editAppointmentRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      appointment,
      appointmentEKID,
      editAppointmentRequestState,
      isOpen,
      onClose,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Edit Appointment"
          viewportScrolling>
        <EditAppointmentForm
            appointment={appointment}
            appointmentEKID={appointmentEKID}
            isLoading={editAppointmentRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  editAppointmentRequestState: state.getIn([STATE.PERSON, ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(DeleteAppointmentModal);
