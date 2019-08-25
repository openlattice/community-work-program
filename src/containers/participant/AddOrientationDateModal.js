// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddOrientationDateForm from './AddOrientationDateForm';

import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, ADD_ORIENTATION_DATE, REQUEST_STATE } = PERSON;


type Props = {
  addOrientationDateRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
};

class AddOrientationDateModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { addOrientationDateRequestState, onClose } = this.props;
    const { addOrientationDateRequestState: prevSumbitState } = prevProps;
    if (addOrientationDateRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      addOrientationDateRequestState,
      isOpen,
      onClose,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Add Orientation Date"
          viewportScrolling>
        <AddOrientationDateForm
            isLoading={addOrientationDateRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  addOrientationDateRequestState: state.getIn([STATE.PERSON, ACTIONS, ADD_ORIENTATION_DATE, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(AddOrientationDateModal);
