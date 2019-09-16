// @flow
import React, { Component } from 'react';
import { Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Button,
  DatePicker,
  Label,
  TimePicker,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { editSentenceDate } from './ParticipantActions';
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
const { DATETIME_RECEIVED } = DIVERSION_PLAN_FQNS;

type Props = {
  actions:{
    editSentenceDate :RequestSequence;
  };
  app :Map;
  diversionPlan :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
};

type State = {
  sentenceDate :string;
  sentenceTime :string;
};

class EditSentenceDateForm extends Component<Props, State> {

  state = {
    sentenceDate: '',
    sentenceTime: '',
  };

  setDate = () => (date :string) => {
    this.setState({ sentenceDate: date });
  }

  setTime = () => (time :string) => {
    this.setState({ sentenceTime: time });
  }

  handleOnSubmit = () => {
    const {
      actions,
      app,
      diversionPlan,
      edm
    } = this.props;
    const { sentenceDate, sentenceTime } = this.state;

    const defaultSentenceDate = !sentenceDate ? DateTime.local().toISODate() : sentenceDate;

    const sentenceDateTime :string = getCombinedDateTime(defaultSentenceDate, sentenceTime);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    const sentenceDateTimePTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_RECEIVED);
    const entityData :{} = {
      [diversionPlanESID]: {
        [diversionPlanEKID]: {
          [sentenceDateTimePTID]: [sentenceDateTime]
        }
      }
    };
    actions.editSentenceDate({ entityData });
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
    editSentenceDate,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditSentenceDateForm);
