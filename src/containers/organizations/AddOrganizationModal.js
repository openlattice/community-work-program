// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddOrganizationForm from './AddOrganizationForm';

import { ORGANIZATIONS, STATE } from '../../utils/constants/ReduxStateConsts';

const { ACTIONS, ADD_ORGANIZATION, REQUEST_STATE } = ORGANIZATIONS;

type Props = {
  isOpen :boolean;
  onClose :() => void;
  addOrganizationRequestState :RequestState;
};

class AddOrganizationModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { addOrganizationRequestState, onClose } = this.props;
    const { addOrganizationRequestState: prevSubmitState } = prevProps;
    if (addOrganizationRequestState === RequestStates.SUCCESS
      && prevSubmitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      isOpen,
      onClose,
      addOrganizationRequestState,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Add Organization"
          viewportScrolling>
        <AddOrganizationForm
            isLoading={addOrganizationRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  addOrganizationRequestState: state.getIn([STATE.ORGANIZATIONS, ACTIONS, ADD_ORGANIZATION, REQUEST_STATE])
});

// $FlowFixMe
export default connect(mapStateToProps)(AddOrganizationModal);
