// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import type { RequestState } from 'redux-reqseq';

import DeleteAppointmentForm from './DeleteAppointmentForm';

import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { DELETE_APPOINTMENT } from '../assignedworksites/WorksitePlanActions';
import { SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, REQUEST_STATE } = SHARED;

type Props = {
  appointment :Object;
  appointmentEKID :UUID;
  isOpen :boolean;
  onClose :() => void;
  requestStates :{
    DELETE_APPOINTMENT :RequestState;
  };
};

class DeleteAppointmentModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { requestStates, onClose } = this.props;
    const { requestStates: prevRequestStates } = prevProps;
    if (requestIsSuccess(requestStates[DELETE_APPOINTMENT])
      && requestIsPending(prevRequestStates[DELETE_APPOINTMENT])) {
      onClose();
    }
  }

  render() {
    const {
      appointment,
      appointmentEKID,
      isOpen,
      onClose,
      requestStates,
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
            isLoading={requestIsPending(requestStates[DELETE_APPOINTMENT])}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [DELETE_APPOINTMENT]: state.getIn([STATE.WORKSITE_PLANS, ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE]),
  }
});

// $FlowFixMe
export default connect(mapStateToProps)(DeleteAppointmentModal);
