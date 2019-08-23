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
  DATETIME_COMPLETED,
  DATETIME_START,
  DIVERSION_PLAN_FQNS,
  ENROLLMENT_STATUS_FQNS,
  SENTENCE_FQNS,
  PEOPLE_FQNS
} from '../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { CWP, ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
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
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  MANUAL_SENTENCED_WITH,
  MANUAL_SENTENCES,
  PEOPLE,
  RELATED_TO,
  SENTENCED_WITH
} = APP_TYPE_FQNS;
const {
  COMPLETED,
  NAME,
  NOTES,
  REQUIRED_HOURS
} = DIVERSION_PLAN_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { DOB, FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const { SENTENCE_CONDITIONS } = SENTENCE_FQNS;

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
          [getEntityAddressKey(0, MANUAL_SENTENCES, SENTENCE_CONDITIONS)]: 'COMMUNITY SERVICE',
        },
      }),
    };
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;

    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const manualSentencedWithESID :UUID = getEntitySetIdFromApp(app, MANUAL_SENTENCED_WITH);
    const manualSentencesESID :UUID = getEntitySetIdFromApp(app, MANUAL_SENTENCES);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const relatedToESID :UUID = getEntitySetIdFromApp(app, RELATED_TO);
    const sentencedWithESID :UUID = getEntitySetIdFromApp(app, SENTENCED_WITH);

    return {
      [DIVERSION_PLAN]: diversionPlanESID,
      [ENROLLMENT_STATUS]: enrollmentStatusESID,
      [MANUAL_SENTENCED_WITH]: manualSentencedWithESID,
      [MANUAL_SENTENCES]: manualSentencesESID,
      [PEOPLE]: peopleESID,
      [RELATED_TO]: relatedToESID,
      [SENTENCED_WITH]: sentencedWithESID,
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;

    const completedPTID :UUID = getPropertyTypeIdFromEdm(edm, COMPLETED);
    const datetimeCompletedPTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_COMPLETED);
    const datetimeStartPTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_START);
    const dobPTID :UUID = getPropertyTypeIdFromEdm(edm, DOB);
    const effectiveDatePTID :UUID = getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE);
    const firstNamePTID :UUID = getPropertyTypeIdFromEdm(edm, FIRST_NAME);
    const lastNamePTID :UUID = getPropertyTypeIdFromEdm(edm, LAST_NAME);
    const namePTID :UUID = getPropertyTypeIdFromEdm(edm, NAME);
    const notesPTID :UUID = getPropertyTypeIdFromEdm(edm, NOTES);
    const requiredHoursPTID :UUID = getPropertyTypeIdFromEdm(edm, REQUIRED_HOURS);
    const sentenceConditionsPTID :UUID = getPropertyTypeIdFromEdm(edm, SENTENCE_CONDITIONS);
    const statusPTID :UUID = getPropertyTypeIdFromEdm(edm, STATUS);

    return {
      [COMPLETED]: completedPTID,
      [DATETIME_COMPLETED]: datetimeCompletedPTID,
      [DATETIME_START]: datetimeStartPTID,
      [DOB]: dobPTID,
      [EFFECTIVE_DATE]: effectiveDatePTID,
      [FIRST_NAME]: firstNamePTID,
      [LAST_NAME]: lastNamePTID,
      [NAME]: namePTID,
      [NOTES]: notesPTID,
      [REQUIRED_HOURS]: requiredHoursPTID,
      [SENTENCE_CONDITIONS]: sentenceConditionsPTID,
      [STATUS]: statusPTID,
    };
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newParticipantData } = this.state;
    const { name, value } = e.currentTarget;
    this.setState({ newParticipantData: newParticipantData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleSelectChange = (value :string, e :Object) => {
    const { newParticipantData } = this.state;
    const { name } = e;
    this.setState({ newParticipantData: newParticipantData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleOnSubmit = () => {
    const { actions } = this.props;
    let { newParticipantData } = this.state;

    const associations = [];
    const nowAsIso = DateTime.local().toISO();

    associations.push([MANUAL_SENTENCED_WITH, 0, PEOPLE, 0, DIVERSION_PLAN, {}]);
    associations.push([RELATED_TO, 0, DIVERSION_PLAN, 0, ENROLLMENT_STATUS, {}]);
    associations.push([SENTENCED_WITH, 0, PEOPLE, 0, MANUAL_SENTENCES, {}]);

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
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Date of birth</Label>
            <DatePicker
                name={getEntityAddressKey(0, PEOPLE, DOB)}
                onChange={this.setDate(getEntityAddressKey(0, PEOPLE, DOB))} />
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
  edm: state.get(STATE.EDM),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addParticipant,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddParticipantForm);
