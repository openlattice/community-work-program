// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import DeleteAppointmentForm from './DeleteAppointmentForm';

import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE } = PERSON;

type Props = {
  appointment :Object;
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
            isLoading={deleteAppointmentRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  deleteAppointmentRequestState: state.getIn([STATE.PERSON, ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(DeleteAppointmentModal);
