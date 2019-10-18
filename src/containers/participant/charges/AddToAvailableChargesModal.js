// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddToAvailableChargesForm from './AddToAvailableChargesForm';

import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, ADD_TO_AVAILABLE_CHARGES, REQUEST_STATE } = PERSON;

type Props = {
  addChargesRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
};

class AddToAvailableChargesModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { addChargesRequestState, onClose } = this.props;
    const { addChargesRequestState: prevSumbitState } = prevProps;
    if (addChargesRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      isOpen,
      onClose,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Create a Charge"
          viewportScrolling>
        <AddToAvailableChargesForm />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  addChargesRequestState: state.getIn([STATE.PERSON, ACTIONS, ADD_TO_AVAILABLE_CHARGES, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(AddToAvailableChargesModal);
