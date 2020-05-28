// @flow
import React, { Component } from 'react';
import { List, Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import EditAppointmentForm from './EditAppointmentForm';

import { WORKSITE_PLANS, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE } = WORKSITE_PLANS;

type Props = {
  appointment :Map;
  appointmentEKID :UUID;
  assignedWorksites :List;
  editAppointmentRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
  personName :string;
  worksitesByWorksitePlan :Map;
};

class EditAppointmentModal extends Component<Props> {

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
      assignedWorksites,
      editAppointmentRequestState,
      isOpen,
      onClose,
      personName,
      worksitesByWorksitePlan,
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
            assignedWorksites={assignedWorksites}
            isLoading={editAppointmentRequestState === RequestStates.PENDING}
            onDiscard={onClose}
            personName={personName}
            worksitesByWorksitePlan={worksitesByWorksitePlan} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  editAppointmentRequestState: state
    .getIn([STATE.WORKSITE_PLANS, ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(EditAppointmentModal);
