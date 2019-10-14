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
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import type { FQN } from 'lattice';

import { createNewEnrollment } from './ParticipantActions';
import { getEntityKeyId, getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../utils/DataUtils';
import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  DATETIME_COMPLETED,
  DATETIME_END,
  DIVERSION_PLAN_FQNS,
  ENROLLMENT_STATUS_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
import { CWP, ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { courtTypeOptions } from '../participants/ParticipantsConstants';
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
} = APP_TYPE_FQNS;
const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;
const {
  COMPLETED,
  DATETIME_RECEIVED,
  NAME,
  REQUIRED_HOURS
} = DIVERSION_PLAN_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { PARTICIPANT } = PERSON;

type Props = {
  actions:{
    createNewEnrollment :RequestSequence;
  };
  app :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
  participant :Map;
};

type State = {
  newEnrollmentData :Map;
};

class AddParticipantForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      newEnrollmentData: fromJS({
        [getPageSectionKey(1, 1)]: {
          [getEntityAddressKey(0, DIVERSION_PLAN, COMPLETED)]: false,
          [getEntityAddressKey(0, DIVERSION_PLAN, NAME)]: CWP,
          [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: ENROLLMENT_STATUSES.AWAITING_CHECKIN,
          [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)]: '',
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

    return {
      [APPEARS_IN]: appearsInESID,
      [DIVERSION_PLAN]: diversionPlanESID,
      [ENROLLMENT_STATUS]: enrollmentStatusESID,
      [MANUAL_PRETRIAL_COURT_CASES]: manualCasesESID,
      [MANUAL_SENTENCED_WITH]: manualSentencedWithESID,
      [PEOPLE]: peopleESID,
      [RELATED_TO]: relatedToESID,
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
    const effectiveDatePTID :UUID = getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE);
    const namePTID :UUID = getPropertyTypeIdFromEdm(edm, NAME);
    const requiredHoursPTID :UUID = getPropertyTypeIdFromEdm(edm, REQUIRED_HOURS);
    const statusPTID :UUID = getPropertyTypeIdFromEdm(edm, STATUS);

    return {
      [CASE_NUMBER_TEXT]: caseNumberTextPTID,
      [COMPLETED]: completedPTID,
      [COURT_CASE_TYPE]: courtCaseTypePTID,
      [DATETIME_COMPLETED]: datetimeCompletedPTID,
      [DATETIME_RECEIVED]: datetimeReceivedPTID,
      [DATETIME_END]: datetimeEndPTID,
      [EFFECTIVE_DATE]: effectiveDatePTID,
      [NAME]: namePTID,
      [REQUIRED_HOURS]: requiredHoursPTID,
      [STATUS]: statusPTID,
    };
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newEnrollmentData } = this.state;
    const { name, value } = e.currentTarget;
    this.setState({ newEnrollmentData: newEnrollmentData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleSelectChange = (option :Object, e :Object) => {
    const { newEnrollmentData } = this.state;
    const { name } = e;
    const { value } = option;
    this.setState({ newEnrollmentData: newEnrollmentData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleOnSubmit = () => {
    const { actions, participant } = this.props;
    let { newEnrollmentData } = this.state;

    const personEKID :UUID = getEntityKeyId(participant);
    const associations = [];
    const nowAsIso = DateTime.local().toISO();

    associations.push([MANUAL_SENTENCED_WITH, personEKID, PEOPLE, 0, DIVERSION_PLAN, {}]);
    associations.push([RELATED_TO, 0, ENROLLMENT_STATUS, 0, DIVERSION_PLAN, {}]);
    associations.push([APPEARS_IN, personEKID, PEOPLE, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);
    associations.push([RELATED_TO, 0, DIVERSION_PLAN, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);

    // required hours is saved as a string and needs to be converted to number:
    const requiredHoursKey = getEntityAddressKey(0, DIVERSION_PLAN, REQUIRED_HOURS);
    let requiredHours = newEnrollmentData.getIn([getPageSectionKey(1, 1), requiredHoursKey], '0');
    requiredHours = parseInt(requiredHours, 10);
    newEnrollmentData = newEnrollmentData.setIn([getPageSectionKey(1, 1), requiredHoursKey], requiredHours);

    // set datetime on enrollment status:
    const enrollmentStatusKey = getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE);
    newEnrollmentData = newEnrollmentData.setIn([getPageSectionKey(1, 1), enrollmentStatusKey], nowAsIso);

    const entitySetIds :Object = this.createEntitySetIdsMap();
    const propertyTypeIds :Object = this.createPropertyTypeIdsMap();

    const entityData :{} = processEntityData(newEnrollmentData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    actions.createNewEnrollment({ associationEntityData, entityData });
  }

  setDate = (name :FQN) => (date :string) => {
    const { newEnrollmentData } = this.state;
    this.setState({ newEnrollmentData: newEnrollmentData.setIn([getPageSectionKey(1, 1), name], date) });
  }

  setDateTime = (name :FQN) => (date :string) => {
    const { newEnrollmentData } = this.state;
    const dateAsDateTime = DateTime.fromISO(date).toISO();
    this.setState({ newEnrollmentData: newEnrollmentData.setIn([getPageSectionKey(1, 1), name], dateAsDateTime) });
  }

  render() {
    const { isLoading, onDiscard } = this.props;
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Sentence date</Label>
            <DatePicker
                name={getEntityAddressKey(0, DIVERSION_PLAN, DATETIME_RECEIVED)}
                onChange={this.setDateTime(getEntityAddressKey(0, DIVERSION_PLAN, DATETIME_RECEIVED))} />
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

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const person = state.get(STATE.PERSON);
  return {
    app,
    edm,
    [PARTICIPANT]: person.get(PARTICIPANT),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    createNewEnrollment,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddParticipantForm);
