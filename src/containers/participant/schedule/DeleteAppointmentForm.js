/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Button, Colors, Label } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ErrorMessage from '../../../components/error/ErrorMessage';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntitySetIdFromApp } from '../../../utils/DataUtils';
import { SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';
import { DELETE_APPOINTMENT, deleteAppointment } from '../assignedworksites/WorksitePlanActions';

const { PURPLE } = Colors;
const { APPOINTMENT } = APP_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { isFailure } = ReduxUtils;

const ColoredText = styled.div`
  color: ${PURPLE.P300};
  text-align: center;
`;

type Props = {
  actions:{
    deleteAppointment :RequestSequence;
  };
  app :Map;
  appointment :Map;
  appointmentEKID :UUID;
  isLoading :boolean;
  onDiscard :() => void;
  requestStates :{
    DELETE_APPOINTMENT :RequestState;
  };
};

type State = {
  newEnrollmentData :Map;
};

class DeleteAppointmentForm extends Component<Props, State> {

  handleOnSubmit = () => {
    const { actions, app, appointmentEKID } = this.props;

    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const appointmentToDelete :Object[] = [{
      block: false,
      entitySetId: appointmentESID,
      entityKeyIds: [appointmentEKID]
    }];
    actions.deleteAppointment(appointmentToDelete);
  }

  render() {
    const {
      appointment,
      isLoading,
      onDiscard,
      requestStates,
    } = this.props;
    const day = appointment.get('day');
    const worksiteName = appointment.get('worksiteName');
    const hours = appointment.get('hours');
    const personName = appointment.get('personName');

    const deleteAppointmentFailed = isFailure(requestStates[DELETE_APPOINTMENT]);

    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Are you sure you want to delete this appointment?</Label>
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <ColoredText>{ personName }</ColoredText>
            <ColoredText>{ day }</ColoredText>
            <ColoredText>{ hours }</ColoredText>
            <ColoredText>{ worksiteName }</ColoredText>
          </RowContent>
        </FormRow>
        { deleteAppointmentFailed && (
          <ErrorMessage errorMessage="Could not delete appointment. Please try again." padding="0" />
        )}
        <ButtonsRow>
          <Button onClick={onDiscard}>No</Button>
          <Button
              color="primary"
              isLoading={isLoading}
              onClick={this.handleOnSubmit}>
            Yes
          </Button>
        </ButtonsRow>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  app: state.get(STATE.APP),
  requestStates: {
    [DELETE_APPOINTMENT]: state.getIn([STATE.WORKSITE_PLANS, ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE])
  },
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    deleteAppointment,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DeleteAppointmentForm);
