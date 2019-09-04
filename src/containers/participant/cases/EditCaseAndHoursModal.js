// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import EditCaseAndHoursForm from './EditCaseAndHoursForm';

import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, EDIT_CASE_AND_HOURS, REQUEST_STATE } = PERSON;


type Props = {
  editCaseAndHoursRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
};

class EditCaseAndHoursModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { editCaseAndHoursRequestState, onClose } = this.props;
    const { editCaseAndHoursRequestState: prevSumbitState } = prevProps;
    if (editCaseAndHoursRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      editCaseAndHoursRequestState,
      isOpen,
      onClose,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Edit Info"
          viewportScrolling>
        <EditCaseAndHoursForm
            isLoading={editCaseAndHoursRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  editCaseAndHoursRequestState: state.getIn([STATE.PERSON, ACTIONS, EDIT_CASE_AND_HOURS, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(EditCaseAndHoursModal);
