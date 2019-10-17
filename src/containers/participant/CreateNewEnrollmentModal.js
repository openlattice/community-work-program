// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CreateNewEnrollmentForm from './CreateNewEnrollmentForm';

import { PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, CREATE_NEW_ENROLLMENT, REQUEST_STATE } = PEOPLE;


type Props = {
  createNewEnrollmentRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
};

class CreateNewEnrollmentModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { createNewEnrollmentRequestState, onClose } = this.props;
    const { createNewEnrollmentRequestState: prevSumbitState } = prevProps;
    if (createNewEnrollmentRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      createNewEnrollmentRequestState,
      isOpen,
      onClose,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Create New Enrollment in CWP"
          viewportScrolling>
        <CreateNewEnrollmentForm
            isLoading={createNewEnrollmentRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  createNewEnrollmentRequestState: state.getIn([STATE.PEOPLE, ACTIONS, CREATE_NEW_ENROLLMENT, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(CreateNewEnrollmentModal);
