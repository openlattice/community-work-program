// @flow
import React, { Component } from 'react';
import { Modal } from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

type Props = {
  components :Object;
  editRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
  title :string;
};

class EditPlanNotesModal extends Component<Props> {

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
      components,
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
        <components.EditForm
            isLoading={editRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

// $FlowFixMe
export default EditPlanNotesModal;
