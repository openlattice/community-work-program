// @flow
import React, { Component } from 'react';
import { fromJS, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  DatePicker,
  Input,
  Label,
  Select,
  TextArea
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import type { FQN } from 'lattice';

import { addParticipant } from './ParticipantsActions';
import { getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../utils/DataUtils';
import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  DATETIME_COMPLETED,
  DATETIME_END,
  DATETIME_START,
  DIVERSION_PLAN_FQNS,
  ENROLLMENT_STATUS_FQNS,
  PEOPLE_FQNS
} from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { CWP, ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { courtTypeOptions } from './ParticipantsConstants';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../components/Layout';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;
const {
  APPEARS_IN,
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  MANUAL_PRETRIAL_COURT_CASES,
  MANUAL_SENTENCED_WITH,
  PEOPLE,
  RELATED_TO,
  RESULTS_IN,
  SENTENCE_TERM,
} = APP_TYPE_FQNS;
const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;
const {
  COMPLETED,
  DATETIME_RECEIVED,
  NAME,
  REQUIRED_HOURS
} = DIVERSION_PLAN_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const {
  DOB,
  FIRST_NAME,
  LAST_NAME,
  PERSON_NOTES,
} = PEOPLE_FQNS;

type Props = {
  actions:{
    addParticipant :RequestSequence;
  };
  app :Map;
  edm :Map;
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
      newParticipantData: fromJS({
        [getPageSectionKey(1, 1)]: {
          [getEntityAddressKey(0, DIVERSION_PLAN, COMPLETED)]: false,
          [getEntityAddressKey(0, DIVERSION_PLAN, NAME)]: CWP,
          [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: ENROLLMENT_STATUSES.AWAITING_CHECKIN,
          [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)]: '',
          [getEntityAddressKey(0, SENTENCE_TERM, DATETIME_START)]: '',
        },
      }),
    };
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;

    const appearsInESID :UUID = getEntitySetIdFromApp(app, APPEARS_IN);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const manualCasesESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const manualSentencedWithESID :UUID = getEntitySetIdFromApp(app, MANUAL_SENTENCED_WITH);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const relatedToESID :UUID = getEntitySetIdFromApp(app, RELATED_TO);
    const resultsInESID :UUID = getEntitySetIdFromApp(app, RESULTS_IN);
    const sentenceTermESID :UUID = getEntitySetIdFromApp(app, SENTENCE_TERM);

    return {
      [APPEARS_IN]: appearsInESID,
      [DIVERSION_PLAN]: diversionPlanESID,
      [ENROLLMENT_STATUS]: enrollmentStatusESID,
      [MANUAL_PRETRIAL_COURT_CASES]: manualCasesESID,
      [MANUAL_SENTENCED_WITH]: manualSentencedWithESID,
      [PEOPLE]: peopleESID,
      [RELATED_TO]: relatedToESID,
      [RESULTS_IN]: resultsInESID,
      [SENTENCE_TERM]: sentenceTermESID,
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;

    const caseNumberTextPTID :UUID = getPropertyTypeIdFromEdm(edm, CASE_NUMBER_TEXT);
    const completedPTID :UUID = getPropertyTypeIdFromEdm(edm, COMPLETED);
    const courtCaseTypePTID :UUID = getPropertyTypeIdFromEdm(edm, COURT_CASE_TYPE);
    const datetimeCompletedPTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_COMPLETED);
    const datetimeReceivedPTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_RECEIVED);
    const datetimeEndPTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_END);
    const datetimeStartPTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_START);
    const dobPTID :UUID = getPropertyTypeIdFromEdm(edm, DOB);
    const effectiveDatePTID :UUID = getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE);
    const firstNamePTID :UUID = getPropertyTypeIdFromEdm(edm, FIRST_NAME);
    const lastNamePTID :UUID = getPropertyTypeIdFromEdm(edm, LAST_NAME);
    const namePTID :UUID = getPropertyTypeIdFromEdm(edm, NAME);
    const personNotesPTID :UUID = getPropertyTypeIdFromEdm(edm, PERSON_NOTES);
    const requiredHoursPTID :UUID = getPropertyTypeIdFromEdm(edm, REQUIRED_HOURS);
    const statusPTID :UUID = getPropertyTypeIdFromEdm(edm, STATUS);

    return {
      [CASE_NUMBER_TEXT]: caseNumberTextPTID,
      [COMPLETED]: completedPTID,
      [COURT_CASE_TYPE]: courtCaseTypePTID,
      [DATETIME_COMPLETED]: datetimeCompletedPTID,
      [DATETIME_RECEIVED]: datetimeReceivedPTID,
      [DATETIME_END]: datetimeEndPTID,
      [DATETIME_START]: datetimeStartPTID,
      [DOB]: dobPTID,
      [EFFECTIVE_DATE]: effectiveDatePTID,
      [FIRST_NAME]: firstNamePTID,
      [LAST_NAME]: lastNamePTID,
      [NAME]: namePTID,
      [PERSON_NOTES]: personNotesPTID,
      [REQUIRED_HOURS]: requiredHoursPTID,
      [STATUS]: statusPTID,
    };
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newParticipantData } = this.state;
    const { name, value } = e.currentTarget;
    this.setState({ newParticipantData: newParticipantData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleSelectChange = (option :Object, e :Object) => {
    const { newParticipantData } = this.state;
    const { name } = e;
    const { value } = option;
    this.setState({ newParticipantData: newParticipantData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleOnSubmit = () => {
    const { actions } = this.props;
    let { newParticipantData } = this.state;

    const associations = [];
    const nowAsIso = DateTime.local().toISO();

    associations.push([MANUAL_SENTENCED_WITH, 0, PEOPLE, 0, DIVERSION_PLAN, {}]);
    associations.push([RELATED_TO, 0, ENROLLMENT_STATUS, 0, DIVERSION_PLAN, {}]);
    associations.push([APPEARS_IN, 0, PEOPLE, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);
    associations.push([RELATED_TO, 0, DIVERSION_PLAN, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);
    associations.push([RESULTS_IN, 0, SENTENCE_TERM, 0, DIVERSION_PLAN, {}]);

    // required hours is saved as a string and needs to be converted to number:
    const requiredHoursKey = getEntityAddressKey(0, DIVERSION_PLAN, REQUIRED_HOURS);
    let requiredHours = newParticipantData.getIn([getPageSectionKey(1, 1), requiredHoursKey], '0');
    requiredHours = parseInt(requiredHours, 10);
    newParticipantData = newParticipantData.setIn([getPageSectionKey(1, 1), requiredHoursKey], requiredHours);

    // set datetime on enrollment status:
    const enrollmentStatusKey = getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE);
    newParticipantData = newParticipantData.setIn([getPageSectionKey(1, 1), enrollmentStatusKey], nowAsIso);

    const entitySetIds :Object = this.createEntitySetIdsMap();
    const propertyTypeIds :Object = this.createPropertyTypeIdsMap();

    const entityData :{} = processEntityData(newParticipantData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    actions.addParticipant({ associationEntityData, entityData });
  }

  setDate = (name :FQN) => (date :string) => {
    const { newParticipantData } = this.state;
    this.setState({ newParticipantData: newParticipantData.setIn([getPageSectionKey(1, 1), name], date) });
  }

  setDateTime = (name :FQN) => (date :string) => {
    const { newParticipantData } = this.state;
    const dateAsDateTime = DateTime.fromISO(date).toISO();
    this.setState({ newParticipantData: newParticipantData.setIn([getPageSectionKey(1, 1), name], dateAsDateTime) });
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
                onChange={this.setDate(getEntityAddressKey(0, PEOPLE, DOB))} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Sentence date</Label>
            <DatePicker
                name={getEntityAddressKey(0, SENTENCE_TERM, DATETIME_START)}
                onChange={this.setDateTime(getEntityAddressKey(0, SENTENCE_TERM, DATETIME_START))} />
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
            <Label>Court type</Label>
            <Select
                name={getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, COURT_CASE_TYPE)}
                onChange={this.handleSelectChange}
                options={courtTypeOptions} />
          </RowContent>
          <RowContent>
            <Label>Docket number</Label>
            <Input
                name={getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)}
                onChange={this.handleInputChange} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Notes</Label>
            <TextArea
                name={getEntityAddressKey(0, PEOPLE, PERSON_NOTES)}
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
  edm: state.get(STATE.EDM),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addParticipant,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddParticipantForm);
