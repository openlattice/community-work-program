// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import EditSentenceDateForm from './EditSentenceDateForm';

import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, EDIT_SENTENCE_DATE, REQUEST_STATE } = PERSON;


type Props = {
  editSentenceDateRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
};

class AddOrientationDateModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { editSentenceDateRequestState, onClose } = this.props;
    const { editSentenceDateRequestState: prevSumbitState } = prevProps;
    if (editSentenceDateRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      editSentenceDateRequestState,
      isOpen,
      onClose,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Edit Sentence Date"
          viewportScrolling>
        <EditSentenceDateForm
            isLoading={editSentenceDateRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  editSentenceDateRequestState: state.getIn([STATE.PERSON, ACTIONS, EDIT_SENTENCE_DATE, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(AddOrientationDateModal);
