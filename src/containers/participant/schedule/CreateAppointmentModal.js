// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CreateAppointmentForm from './CreateAppointmentForm';

import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, CREATE_WORK_APPOINTMENT, REQUEST_STATE } = PERSON;

type Props = {
  createAppointmentRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
  personEKID :UUID;
  worksites :List;
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
      worksites,
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
            personEKID={personEKID}
            worksites={worksites} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  createAppointmentRequestState: state.getIn([STATE.PERSON, ACTIONS, CREATE_WORK_APPOINTMENT, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(CreateWorkAppointmentModal);
