// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import DeleteAppointmentForm from './DeleteAppointmentForm';

import { WORKSITE_PLANS, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE } = WORKSITE_PLANS;

type Props = {
  appointment :Object;
  appointmentEKID :UUID;
  deleteAppointmentRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
};

class DeleteAppointmentModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { deleteAppointmentRequestState, onClose } = this.props;
    const { deleteAppointmentRequestState: prevSumbitState } = prevProps;
    if (deleteAppointmentRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      appointment,
      appointmentEKID,
      deleteAppointmentRequestState,
      isOpen,
      onClose,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Delete Appointment"
          viewportScrolling>
        <DeleteAppointmentForm
            appointment={appointment}
            appointmentEKID={appointmentEKID}
            isLoading={deleteAppointmentRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  deleteAppointmentRequestState: state.getIn([STATE.WORKSITE_PLANS, ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(DeleteAppointmentModal);
