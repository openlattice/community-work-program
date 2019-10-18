// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CreateAppointmentForm from './CreateAppointmentForm';

import { PARTICIPANT_SCHEDULE, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, CREATE_WORK_APPOINTMENTS, REQUEST_STATE } = PARTICIPANT_SCHEDULE;

type Props = {
  createAppointmentRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
  personEKID :UUID;
};

class CreateWorkAppointmentModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { createAppointmentRequestState, onClose } = this.props;
    const { createAppointmentRequestState: prevSumbitState } = prevProps;
    if (createAppointmentRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      createAppointmentRequestState,
      isOpen,
      onClose,
      personEKID,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Create Work Schedule"
          viewportScrolling>
        <CreateAppointmentForm
            isLoading={createAppointmentRequestState === RequestStates.PENDING}
            onDiscard={onClose}
            personEKID={personEKID} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  createAppointmentRequestState: state
    .getIn([STATE.PARTICIPANT_SCHEDULE, ACTIONS, CREATE_WORK_APPOINTMENTS, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(CreateWorkAppointmentModal);
