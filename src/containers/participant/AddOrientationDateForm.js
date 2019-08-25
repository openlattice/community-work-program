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

import { addOrientationDate } from './ParticipantActions';
import { getEntityKeyId, getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../utils/DataUtils';
import { getCombinedDateTime } from '../../utils/ScheduleUtils';
import {
  APP_TYPE_FQNS,
  DIVERSION_PLAN_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../components/Layout';

const { DIVERSION_PLAN } = APP_TYPE_FQNS;
const { ORIENTATION_DATETIME } = DIVERSION_PLAN_FQNS;

type Props = {
  actions:{
    addOrientationDate :RequestSequence;
  };
  app :Map;
  diversionPlan :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
};

type State = {
  orientationDate :string;
  orientationTime :string;
};

class AddOrientationDateForm extends Component<Props, State> {

  state = {
    orientationDate: '',
    orientationTime: '',
  };

  setDate = () => (date :string) => {
    this.setState({ orientationDate: date });
  }

  setTime = () => (time :string) => {
    this.setState({ orientationTime: time });
  }

  handleOnSubmit = () => {
    const {
      actions,
      app,
      diversionPlan,
      edm
    } = this.props;
    const { orientationDate, orientationTime } = this.state;

    const orientationDateTime :string = getCombinedDateTime(orientationDate, orientationTime);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    const orientationDateTimePTID :UUID = getPropertyTypeIdFromEdm(edm, ORIENTATION_DATETIME);
    const entityData :{} = {
      [diversionPlanESID]: {
        [diversionPlanEKID]: {
          [orientationDateTimePTID]: [orientationDateTime]
        }
      }
    };
    actions.addOrientationDate({ entityData });
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
  diversionPlan: state.getIn([STATE.PERSON, PERSON.DIVERSION_PLAN], Map()),
  edm: state.get(STATE.EDM),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addOrientationDate,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddOrientationDateForm);
