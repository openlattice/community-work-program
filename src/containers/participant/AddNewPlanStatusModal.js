// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddNewPlanStatusForm from './AddNewPlanStatusForm';

import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, ADD_NEW_ENROLLMENT_STATUS, REQUEST_STATE } = PERSON;


type Props = {
  currentStatus :string;
  isOpen :boolean;
  onClose :() => void;
  personName :string;
  addNewEnrollmentStatusState :RequestState;
};

class AddNewPlanEnrollmentStatusModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { addNewEnrollmentStatusState, onClose } = this.props;
    const { addNewEnrollmentStatusState: prevSumbitState } = prevProps;
    if (addNewEnrollmentStatusState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      currentStatus,
      isOpen,
      onClose,
      personName,
      addNewEnrollmentStatusState,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Change Enrollment Status"
          viewportScrolling>
        <AddNewPlanStatusForm
            currentStatus={currentStatus}
            isLoading={addNewEnrollmentStatusState === RequestStates.PENDING}
            onDiscard={onClose}
            personName={personName} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  addNewEnrollmentStatusState: state.getIn([STATE.PERSON, ACTIONS, ADD_NEW_ENROLLMENT_STATUS, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(AddNewPlanEnrollmentStatusModal);
