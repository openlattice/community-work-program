// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import EditInfractionForm from './EditInfractionForm';

import { PERSON_INFRACTIONS, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, EDIT_INFRACTION_EVENT, REQUEST_STATE } = PERSON_INFRACTIONS;


type Props = {
  editInfractionEventRequestState :RequestState;
  infractionEvent :Map;
  infractionCategory :string;
  isOpen :boolean;
  onClose :() => void;
};

class EditInfractionModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { editInfractionEventRequestState, onClose } = this.props;
    const { editInfractionEventRequestState: prevSumbitState } = prevProps;
    if (editInfractionEventRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      editInfractionEventRequestState,
      infractionEvent,
      infractionCategory,
      isOpen,
      onClose,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Edit Infraction Report"
          viewportScrolling>
        <EditInfractionForm
            infractionEvent={infractionEvent}
            infractionCategory={infractionCategory}
            isLoading={editInfractionEventRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  editInfractionEventRequestState: state.getIn([STATE.INFRACTIONS, ACTIONS, EDIT_INFRACTION_EVENT, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(EditInfractionModal);
