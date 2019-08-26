// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import {
  Button,
  DatePicker,
  Label,
  TimePicker,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { editCheckInDate } from './ParticipantActions';
import { getEntityKeyId, getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../utils/DataUtils';
import { getCombinedDateTime } from '../../utils/ScheduleUtils';
import {
  APP_TYPE_FQNS,
  ENROLLMENT_STATUS_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../components/Layout';

const { ENROLLMENT_STATUS } = APP_TYPE_FQNS;
const { EFFECTIVE_DATE } = ENROLLMENT_STATUS_FQNS;

type Props = {
  actions:{
    editCheckInDate :RequestSequence;
  };
  app :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
  statusWithCheckInDate :Map;
};

type State = {
  checkInDate :string;
  checkInTime :string;
};

class EditCheckInDateForm extends Component<Props, State> {

  state = {
    checkInDate: '',
    checkInTime: '',
  };

  setDate = () => (date :string) => {
    this.setState({ checkInDate: date });
  }

  setTime = () => (time :string) => {
    this.setState({ checkInTime: time });
  }

  handleOnSubmit = () => {
    const {
      actions,
      app,
      statusWithCheckInDate,
      edm
    } = this.props;
    const { checkInDate, checkInTime } = this.state;

    const checkInDateTime :string = getCombinedDateTime(checkInDate, checkInTime);
    const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const enrollmentStatusEKID :UUID = getEntityKeyId(statusWithCheckInDate);
    const checkInDateTimePTID :UUID = getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE);
    const entityData :{} = {
      [enrollmentStatusESID]: {
        [enrollmentStatusEKID]: {
          [checkInDateTimePTID]: [checkInDateTime]
        }
      }
    };
    actions.editCheckInDate({ entityData });
  }

  render() {
    const {
      isLoading,
      onDiscard,
    } = this.props;
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Date</Label>
            <DatePicker
                onChange={this.setDate()} />
          </RowContent>
          <RowContent>
            <Label>Time</Label>
            <TimePicker
                onChange={this.setTime()} />
          </RowContent>
        </FormRow>
        <ButtonsRow>
          <Button onClick={onDiscard}>Discard</Button>
          <Button
              isLoading={isLoading}
              mode="primary"
              onClick={this.handleOnSubmit}>
            Submit
          </Button>
        </ButtonsRow>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => ({
  app: state.get(STATE.APP),
  edm: state.get(STATE.EDM),
  statusWithCheckInDate: state.getIn([STATE.PERSON, PERSON.STATUS_WITH_CHECK_IN_DATE], Map()),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    editCheckInDate,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditCheckInDateForm);
