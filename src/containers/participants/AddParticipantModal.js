// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddParticipantForm from './AddParticipantForm';

import { PEOPLE, STATE } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, ADD_PARTICIPANT, REQUEST_STATE } = PEOPLE;


type Props = {
  isOpen :boolean;
  onClose :() => void;
  addParticipantRequestState :RequestState;
};

class AddParticipantModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { addParticipantRequestState, onClose } = this.props;
    const { addParticipantRequestState: prevSumbitState } = prevProps;
    if (addParticipantRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      isOpen,
      onClose,
      addParticipantRequestState,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Add Participant"
          viewportScrolling>
        <AddParticipantForm
            isLoading={addParticipantRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  addParticipantRequestState: state.getIn([STATE.PEOPLE, ACTIONS, ADD_PARTICIPANT, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(AddParticipantModal);
