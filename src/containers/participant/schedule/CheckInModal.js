// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CheckInForm from './CheckInForm';

import { resetCheckInRequestState } from '../assignedworksites/WorksitePlanActions';
import { WORKSITE_PLANS, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE } = WORKSITE_PLANS;

type Props = {
  actions :{
    resetCheckInRequestState :() => { type :string };
  };
  appointment :Map;
  checkInForAppointmentState :RequestState;
  isOpen :boolean;
  onClose :() => void;
  personEKID :UUID;
  personName :string;
};

class CheckInModal extends Component<Props> {

  componentDidUpdate(prevProps :Props) {
    const { actions, checkInForAppointmentState, onClose } = this.props;
    const { checkInForAppointmentState: prevSumbitState } = prevProps;
    if (checkInForAppointmentState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      onClose();
      actions.resetCheckInRequestState();
    }
  }

  render() {
    const {
      appointment,
      checkInForAppointmentState,
      isOpen,
      onClose,
      personEKID,
      personName,
    } = this.props;

    return (
      <Modal
          isVisible={isOpen}
          onClose={onClose}
          textTitle="Check In Participant"
          viewportScrolling>
        <CheckInForm
            appointment={appointment}
            isLoading={checkInForAppointmentState === RequestStates.PENDING}
            onDiscard={onClose}
            personEKID={personEKID}
            personName={personName} />
      </Modal>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  checkInForAppointmentState: state
    .getIn([STATE.WORKSITE_PLANS, ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE]),
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    resetCheckInRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CheckInModal);
