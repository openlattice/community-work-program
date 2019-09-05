// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Label,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

// import { deleteEntities } from '../ParticipantActions';
import { getEntitySetIdFromApp } from '../../../utils/DataUtils';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';
import { OL } from '../../../core/style/Colors';

const { APPOINTMENT } = APP_TYPE_FQNS;

const ColoredText = styled.div`
  color: ${OL.PURPLE02};
`;

type Props = {
  actions:{
    deleteEntities :RequestSequence;
  };
  app :Map;
  appointment :Object;
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
      entityKeyId: appointmentEKID
    }];
    actions.deleteEntities(appointmentToDelete);
  }

  render() {
    const {
      appointment,
      isLoading,
      onDiscard,
    } = this.props;
    const {
      date,
      hours,
      weekday,
      worksiteName,
    } = appointment;
    const appointmentText :string = `${weekday} ${date}, ${hours} at ${worksiteName}`;
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Are you sure you want to delete this appointment?</Label>
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <ColoredText>{ appointmentText }</ColoredText>
          </RowContent>
        </FormRow>
        <ButtonsRow>
          <Button onClick={onDiscard}>No</Button>
          <Button
              isLoading={isLoading}
              mode="primary"
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

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    // deleteEntities,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DeleteAppointmentForm);
