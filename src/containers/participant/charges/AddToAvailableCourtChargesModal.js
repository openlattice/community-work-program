// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddToAvailableCourtChargesForm from './AddToAvailableCourtChargesForm';

import { CHARGES, SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ADD_TO_AVAILABLE_COURT_CHARGES } = CHARGES;
const { ACTIONS, REQUEST_STATE } = SHARED;

type Props = {
  addChargesRequestState :RequestState;
  isOpen :boolean;
  onClose :() => void;
};

class AddToAvailableCourtChargesModal extends Component<Props> {

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
          textTitle="Create a Court Charge"
          viewportScrolling>
        <AddToAvailableCourtChargesForm />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  addChargesRequestState: state.getIn([STATE.CHARGES, ACTIONS, ADD_TO_AVAILABLE_COURT_CHARGES, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(AddToAvailableCourtChargesModal);
