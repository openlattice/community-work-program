/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Button, Colors, Label } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { RequestSequence } from 'redux-reqseq';

import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntitySetIdFromApp } from '../../../utils/DataUtils';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { deleteAppointment } from '../assignedworksites/WorksitePlanActions';

const { PURPLE } = Colors;
const { APPOINTMENT } = APP_TYPE_FQNS;

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
};

type State = {
  newEnrollmentData :Map;
};

class DeleteAppointmentForm extends Component<Props, State> {

  handleOnSubmit = () => {
    const { actions, app, appointmentEKID } = this.props;

    const appointmentESID :UUID = getEntitySetIdFromApp(app, APPOINTMENT);
    const appointmentToDelete :Object[] = [{
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
    } = this.props;
    const day = appointment.get('day');
    const worksiteName = appointment.get('worksiteName');
    const hours = appointment.get('hours');
    const personName = appointment.get('personName');

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
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    deleteAppointment,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DeleteAppointmentForm);
