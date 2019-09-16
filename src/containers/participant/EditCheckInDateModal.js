// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import EditCheckInDateForm from './EditCheckInDateForm';

import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, EDIT_CHECK_IN_DATE, REQUEST_STATE } = PERSON;


type Props = {
  editCheckInDateRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
};

class EditCheckInDateModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { editCheckInDateRequestState, onClose } = this.props;
    const { editCheckInDateRequestState: prevSumbitState } = prevProps;
    if (editCheckInDateRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      editCheckInDateRequestState,
      isOpen,
      onClose,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Edit Check-in Date"
          viewportScrolling>
        <EditCheckInDateForm
            isLoading={editCheckInDateRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  editCheckInDateRequestState: state.getIn([STATE.PERSON, ACTIONS, EDIT_CHECK_IN_DATE, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(EditCheckInDateModal);
