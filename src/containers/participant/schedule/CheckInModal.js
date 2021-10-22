/*
 * @flow
 */

import React, { Component } from 'react';

import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import CheckInForm from './CheckInForm';

import { STATE, WORKSITE_PLANS } from '../../../utils/constants/ReduxStateConsts';
import { resetCheckInRequestState } from '../assignedworksites/WorksitePlanActions';

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
    const { checkInForAppointmentState } = this.props;
    const { checkInForAppointmentState: prevSumbitState } = prevProps;
    if (checkInForAppointmentState === RequestStates.SUCCESS
      && prevSumbitState === RequestStates.PENDING) {
      this.handleOnClose();
    }
  }

  handleOnClose = () => {
    const { actions, onClose } = this.props;
    onClose();
    actions.resetCheckInRequestState();
  }

  render() {
    const {
      appointment,
      checkInForAppointmentState,
      isOpen,
      personEKID,
      personName,
    } = this.props;

    return (
      <Modal
          isVisible={isOpen}
          onClose={this.handleOnClose}
          textTitle="Check In Participant"
          viewportScrolling>
        <CheckInForm
            appointment={appointment}
            isLoading={checkInForAppointmentState === RequestStates.PENDING}
            onDiscard={this.handleOnClose}
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
