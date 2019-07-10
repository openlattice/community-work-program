// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddOrganizationForm from './AddOrganizationForm';

import { DATA, STATE } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, SUBMIT_DATA_GRAPH, REQUEST_STATE } = DATA;

type Props = {
  isOpen :boolean;
  onClose :() => void;
  submitDataGraphRequestState :RequestState;
};

class AddOrganizationModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { submitDataGraphRequestState, onClose } = this.props;
    const { submitDataGraphRequestState: prevSubmitState } = prevProps;
    if (submitDataGraphRequestState === RequestStates.SUCCESS
      && prevSubmitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      isOpen,
      onClose,
      submitDataGraphRequestState,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Add Organization"
          viewportScrolling>
        <AddOrganizationForm
            isLoading={submitDataGraphRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  submitDataGraphRequestState: state.getIn([STATE.DATA, ACTIONS, SUBMIT_DATA_GRAPH, REQUEST_STATE])
});

// $FlowFixMe
export default connect(mapStateToProps)(AddOrganizationModal);
