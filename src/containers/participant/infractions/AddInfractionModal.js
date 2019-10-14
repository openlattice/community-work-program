// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddInfractionForm from './AddInfractionForm';

import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, ADD_INFRACTION_EVENT, REQUEST_STATE } = PERSON;


type Props = {
  addInfractionEventRequestState :RequestState;
  currentStatus :string;
  isOpen :boolean;
  onClose :() => void;
  personEKID :UUID;
};

class AddNewPlanEnrollmentStatusModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { addInfractionEventRequestState, onClose } = this.props;
    const { addInfractionEventRequestState: prevSumbitState } = prevProps;
    if (addInfractionEventRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      addInfractionEventRequestState,
      currentStatus,
      isOpen,
      onClose,
      personEKID,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          shouldCloseOnOutsideClick={false}
          textTitle="Create Infraction Report"
          viewportScrolling>
        <AddInfractionForm
            currentStatus={currentStatus}
            isLoading={addInfractionEventRequestState === RequestStates.PENDING}
            onDiscard={onClose}
            personEKID={personEKID} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  addInfractionEventRequestState: state.getIn([STATE.PERSON, ACTIONS, ADD_INFRACTION_EVENT, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(AddNewPlanEnrollmentStatusModal);
