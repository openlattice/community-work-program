// @flow
import React, { Component } from 'react';
import { fromJS, Map } from 'immutable';
import { DateTime } from 'luxon';
import {
  Button,
  DatePicker,
  Input,
  Label,
  TextArea
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import type { FQN } from 'lattice';

import { addParticipant } from './ParticipantsActions';
import { getEntityAddressKey, processAssociationEntityData, processEntityData } from '../../utils/DataProcessingUtils';
import {
  APP_TYPE_FQNS,
  DIVERSION_PLAN_FQNS,
  ENROLLMENT_STATUS_FQNS,
  SENTENCE_FQNS,
  SENTENCE_TERM_FQNS,
  SENTENCED_WITH_FQNS,
  PEOPLE_FQNS
} from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { CWP, ENROLLMENT_STATUSES, TYPE_IDS_BY_FQNS } from '../../core/edm/constants/DataModelConsts';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../components/Layout';

const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  MANUAL_SENTENCED_WITH,
  MANUAL_SENTENCES,
  PEOPLE,
  RELATED_TO,
  SENTENCE_TERM,
  SENTENCED_WITH
} = APP_TYPE_FQNS;
const {
  COMPLETED,
  NAME,
  NOTES,
  REQUIRED_HOURS
} = DIVERSION_PLAN_FQNS;
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { DOB, FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const { SENTENCE_CONDITIONS } = SENTENCE_FQNS;
const { DATETIME_START } = SENTENCE_TERM_FQNS;
const { DATETIME_COMPLETED } = SENTENCED_WITH_FQNS;

type Props = {
  actions:{
    addParticipant :RequestSequence;
  };
  app :Map;
  edmPropertyTypes :Map;
  isLoading :boolean;
  onDiscard :() => void;
};

type State = {
  newParticipantData :Map;
};

class AddParticipantForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      newParticipantData: Map({
        [getEntityAddressKey(0, DIVERSION_PLAN, COMPLETED)]: [false],
        [getEntityAddressKey(0, DIVERSION_PLAN, NAME)]: [CWP],
        [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: [ENROLLMENT_STATUSES.AWAITING_CHECKIN],
        [getEntityAddressKey(0, MANUAL_SENTENCES, SENTENCE_CONDITIONS)]: ['COMMUNITY SERVICE'],
      }),
    };
  }

  handleDateChange = (name :FQN) => (date :string) => {
    const { newParticipantData } = this.state;
    this.setState({ newParticipantData: newParticipantData.set(name, date) });
  }

  handleDateTimeChange = (name :FQN) => (date :string) => {
    const { newParticipantData } = this.state;
    const splitDate :number[] = date.split('-')
      .map((string :string) => parseInt(string, 10));
    const dateAsDateTime = DateTime.local(splitDate[0], splitDate[1], splitDate[2]).toISO();
    this.setState({ newParticipantData: newParticipantData.set(name, dateAsDateTime) });
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newParticipantData } = this.state;
    const { name, value } = e.currentTarget;
    this.setState({ newParticipantData: newParticipantData.set(name, value) });
  }

  handleSelectChange = (value :string, e :Object) => {
    const { newParticipantData } = this.state;
    const { name } = e;
    this.setState({ newParticipantData: newParticipantData.set(name, value) });
  }

  handleOnSubmit = () => {
    const {
      actions,
      app,
      edmPropertyTypes,
    } = this.props;
    let { newParticipantData } = this.state;

    const associations = [];
    const nowAsIso = DateTime.local().toISO();

    associations.push([MANUAL_SENTENCED_WITH, 0, PEOPLE, 0, DIVERSION_PLAN, {
      [DATETIME_COMPLETED]: [nowAsIso]
    }]);
    associations.push([RELATED_TO, 0, DIVERSION_PLAN, 0, ENROLLMENT_STATUS, {
      [DATETIME_COMPLETED]: [nowAsIso]
    }]);
    associations.push([MANUAL_SENTENCED_WITH, 0, PEOPLE, 0, SENTENCE_TERM, {
      [DATETIME_COMPLETED]: [nowAsIso]
    }]);
    associations.push([SENTENCED_WITH, 0, PEOPLE, 0, MANUAL_SENTENCES, {
      [DATETIME_COMPLETED]: [nowAsIso]
    }]);

    // required hours is saved as a string and needs to be converted to number:
    const requiredHoursKey = getEntityAddressKey(0, DIVERSION_PLAN, REQUIRED_HOURS);
    let requiredHours = newParticipantData.get(requiredHoursKey, '0');
    requiredHours = parseInt(requiredHours, 10);
    newParticipantData = newParticipantData.set(requiredHoursKey, requiredHours);

    const entityData :{} = processEntityData(newParticipantData, edmPropertyTypes, app);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), edmPropertyTypes, app);

    actions.addParticipant({ associationEntityData, entityData });
  }

  render() {
    const { isLoading, onDiscard } = this.props;
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>First name</Label>
            <Input
                name={getEntityAddressKey(0, PEOPLE, FIRST_NAME)}
                onChange={this.handleInputChange}
                type="text" />
          </RowContent>
          <RowContent>
            <Label>Last name</Label>
            <Input
                name={getEntityAddressKey(0, PEOPLE, LAST_NAME)}
                onChange={this.handleInputChange}
                type="text" />
          </RowContent>
          <RowContent>
            <Label>Date of birth</Label>
            <DatePicker
                name={getEntityAddressKey(0, PEOPLE, DOB)}
                onChange={this.handleDateChange(getEntityAddressKey(0, PEOPLE, DOB))} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Sentence date</Label>
            <DatePicker
                name={getEntityAddressKey(0, SENTENCE_TERM, DATETIME_START)}
                onChange={this.handleDateTimeChange(getEntityAddressKey(0, SENTENCE_TERM, DATETIME_START))} />
          </RowContent>
          <RowContent>
            <Label>Required hours</Label>
            <Input
                name={getEntityAddressKey(0, DIVERSION_PLAN, REQUIRED_HOURS)}
                onChange={this.handleInputChange}
                type="text" />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Notes</Label>
            <TextArea
                name={getEntityAddressKey(0, DIVERSION_PLAN, NOTES)}
                onChange={this.handleInputChange} />
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
  edmPropertyTypes: state.getIn([STATE.EDM, TYPE_IDS_BY_FQNS]),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addParticipant,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddParticipantForm);
