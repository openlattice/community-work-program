/*
 * @flow
 */

import React, { Component } from 'react';

import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import DeleteInfractionForm from './DeleteInfractionForm';

import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, DELETE_INFRACTION_EVENT, REQUEST_STATE } = PERSON;

type Props = {
  deleteInfractionEventRequestState :RequestState;
  infractionEventEKID :UUID;
  isOpen :boolean;
  onClose :() => void;
};

class DeleteAppointmentModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { deleteInfractionEventRequestState, onClose } = this.props;
    const { deleteInfractionEventRequestState: prevSumbitState } = prevProps;
    if (deleteInfractionEventRequestState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
    }
  }

  render() {
    const {
      deleteInfractionEventRequestState,
      infractionEventEKID,
      isOpen,
      onClose,
    } = this.props;
    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Delete Infraction Report"
          viewportScrolling>
        <DeleteInfractionForm
            infractionEventEKID={infractionEventEKID}
            isLoading={deleteInfractionEventRequestState === RequestStates.PENDING}
            onDiscard={onClose} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  deleteInfractionEventRequestState: state.getIn([STATE.PERSON, ACTIONS, DELETE_INFRACTION_EVENT, REQUEST_STATE]),
});

// $FlowFixMe
export default connect(mapStateToProps)(DeleteAppointmentModal);
