// @flow
import React, { Component } from 'react';
import type { ComponentType } from 'react';

import styled from 'styled-components';
import { Modal } from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

const ModalInnerWrapper = styled.div`
  @media only screen and (min-width: 584px) {
    width: 584px;
  }

  @media only screen and (min-width: 900px) {
    width: 900px;
  }
`;
type Props = {
  editForm :ComponentType<*>;
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
          shouldCloseOnOutsideClick={false}
          textTitle={title}
          viewportScrolling>
        <ModalInnerWrapper>
          <EditForm
              isLoading={editRequestState === RequestStates.PENDING}
              onDiscard={onClose} />
        </ModalInnerWrapper>
      </Modal>
    );
  }
}

// $FlowFixMe
export default EditNotesModal;
