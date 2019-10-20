// @flow
import React, { Component } from 'react';
import { Modal } from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

type Props = {
  editForm :React.Node;
  editRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
  title :string;
};

class EditNotesModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { editRequestState, onClose } = this.props;
    const { editRequestState: prevSumbitState } = prevProps;
    if (editRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      editForm: EditForm,
      editRequestState,
      isOpen,
      onClose,
      title,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle={title}
          viewportScrolling>
        <EditForm
            isLoading={editRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

// $FlowFixMe
export default EditNotesModal;
