// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import EditPlanNotesForm from './EditPlanNotesForm';

import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE } = PERSON;


type Props = {
  editPlanNotesRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
};

class EditPlanNotesModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { editPlanNotesRequestState, onClose } = this.props;
    const { editPlanNotesRequestState: prevSumbitState } = prevProps;
    if (editPlanNotesRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      editPlanNotesRequestState,
      isOpen,
      onClose,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="CWP Notes"
          viewportScrolling>
        <EditPlanNotesForm
            isLoading={editPlanNotesRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  editPlanNotesRequestState: state.getIn([STATE.PERSON, ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(EditPlanNotesModal);
