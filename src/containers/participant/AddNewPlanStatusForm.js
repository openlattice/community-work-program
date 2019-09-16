// @flow
import React, { Component } from 'react';
import { fromJS, List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  DatePicker,
  Input,
  Label,
  Select,
  TextArea,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import type { FQN } from 'lattice';

import { addNewDiversionPlanStatus, markDiversionPlanAsComplete } from './ParticipantActions';
import { getEntityKeyId, getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../utils/DataUtils';
import { getCombinedDateTime } from '../../utils/ScheduleUtils';
import { STATUS_FILTER_OPTIONS } from '../participants/ParticipantsConstants';
import {
  APP_TYPE_FQNS,
  DATETIME_COMPLETED,
  ENROLLMENT_STATUS_FQNS,
  PROGRAM_OUTCOME_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
import { ENROLLMENT_STATUSES, WORKSITE_ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
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
  PROGRAM_OUTCOME,
  RELATED_TO,
  RESULTS_IN,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { COMPLETED, DESCRIPTION, HOURS_WORKED } = PROGRAM_OUTCOME_FQNS;

const ENROLLMENT_STATUS_OPTIONS :Object[] = STATUS_FILTER_OPTIONS
  .slice(1)
  .map((status :Object) => {
    return { label: status.label, value: status.value };
  });

type Props = {
  actions:{
    addNewDiversionPlanStatus :RequestSequence;
    markDiversionPlanAsComplete :RequestSequence;
  };
  app :Map;
  currentStatus :string;
  diversionPlan :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
  personName :string;
  worksitePlans :List;
};

type State = {
  newEnrollmentData :Map;
};

class AddNewPlanStatusForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      newEnrollmentData: fromJS({
        [getPageSectionKey(1, 1)]: {},
        [getPageSectionKey(1, 2)]: {},
        [getPageSectionKey(1, 3)]: {},
      }),
    };
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [DIVERSION_PLAN]: getEntitySetIdFromApp(app, DIVERSION_PLAN),
      [ENROLLMENT_STATUS]: getEntitySetIdFromApp(app, ENROLLMENT_STATUS),
      [PROGRAM_OUTCOME]: getEntitySetIdFromApp(app, PROGRAM_OUTCOME),
      [RELATED_TO]: getEntitySetIdFromApp(app, RELATED_TO),
      [RESULTS_IN]: getEntitySetIdFromApp(app, RESULTS_IN),
      [WORKSITE_PLAN]: getEntitySetIdFromApp(app, WORKSITE_PLAN),
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [COMPLETED]: getPropertyTypeIdFromEdm(edm, COMPLETED),
      [DATETIME_COMPLETED]: getPropertyTypeIdFromEdm(edm, DATETIME_COMPLETED),
      [DESCRIPTION]: getPropertyTypeIdFromEdm(edm, DESCRIPTION),
      [EFFECTIVE_DATE]: getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE),
      [HOURS_WORKED]: getPropertyTypeIdFromEdm(edm, HOURS_WORKED),
      [STATUS]: getPropertyTypeIdFromEdm(edm, STATUS),
    };
  }

  setDate = (name :FQN) => (date :string) => {
    const { newEnrollmentData } = this.state;
    this.setState({ newEnrollmentData: newEnrollmentData.setIn([getPageSectionKey(1, 2), name], date) });
  }

  handleSelectChange = (option :Object, event :Object) => {
    const { newEnrollmentData } = this.state;
    const { name } = event;
    const { value } = option;
    this.setState({ newEnrollmentData: newEnrollmentData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newEnrollmentData } = this.state;
    const { name, value } = e.currentTarget;
    this.setState({ newEnrollmentData: newEnrollmentData.setIn([getPageSectionKey(1, 2), name], value) });
  }

  handleOnSubmit = () => {
    const {
      actions,
      app,
      diversionPlan,
      edm,
      worksitePlans,
    } = this.props;
    let { newEnrollmentData } = this.state;

    const associations = [];
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    const now = DateTime.local();

    newEnrollmentData = newEnrollmentData
      .setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)], now.toISO());

    associations.push([RELATED_TO, 0, ENROLLMENT_STATUS, diversionPlanEKID, DIVERSION_PLAN, {}]);

    if (!newEnrollmentData.get(getPageSectionKey(1, 2)).isEmpty()) {

      /* 1. hours worked is saved as a string and needs to be converted to number: */
      const hoursWorkedPath = [getPageSectionKey(1, 2), getEntityAddressKey(0, PROGRAM_OUTCOME, HOURS_WORKED)];
      let hoursWorked = newEnrollmentData.getIn(hoursWorkedPath, '0');
      hoursWorked = parseInt(hoursWorked, 10);
      newEnrollmentData = newEnrollmentData.setIn(hoursWorkedPath, hoursWorked);

      /* 2. date completed is save as a date and needs to be converted to datetime: */
      const datePath = [getPageSectionKey(1, 2), getEntityAddressKey(0, PROGRAM_OUTCOME, DATETIME_COMPLETED)];
      const savedDate = newEnrollmentData.getIn(datePath, '');
      const datetimeToSubmit = savedDate
        ? getCombinedDateTime(savedDate, now.toLocaleString(DateTime.TIME_24_SIMPLE))
        : now.toISO();
      newEnrollmentData = newEnrollmentData.setIn(datePath, datetimeToSubmit);

      /* 3. program outcome marked as completed if status is completed or successful,
            and not completed if status is removed noncompliant or unsuccessful or closed */
      const resultingStatus :string = newEnrollmentData
        .getIn([getPageSectionKey(1, 1), getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]);
      const successfulStatuses = [ENROLLMENT_STATUSES.COMPLETED, ENROLLMENT_STATUSES.SUCCESSFUL];
      const unsuccessfulStatuses = [
        ENROLLMENT_STATUSES.CLOSED,
        ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT,
        ENROLLMENT_STATUSES.UNSUCCESSFUL
      ];

      if (successfulStatuses.includes(resultingStatus)) {
        newEnrollmentData = newEnrollmentData
          .setIn([getPageSectionKey(1, 2), getEntityAddressKey(0, PROGRAM_OUTCOME, COMPLETED)], true);
      }
      if (unsuccessfulStatuses.includes(resultingStatus)) {
        newEnrollmentData = newEnrollmentData
          .setIn([getPageSectionKey(1, 2), getEntityAddressKey(0, PROGRAM_OUTCOME, COMPLETED)], false);
      }

      /* 4. date completed is save as a date and needs to be converted to datetime: */
      const worksitePlanStatus = successfulStatuses.includes(resultingStatus)
        ? WORKSITE_ENROLLMENT_STATUSES.COMPLETED
        : WORKSITE_ENROLLMENT_STATUSES.CANCELED;
      worksitePlans.forEach((worksitePlan :Map, index :number) => {

        newEnrollmentData = newEnrollmentData.setIn([
          getPageSectionKey(1, 3),
          getEntityAddressKey(index + 1, ENROLLMENT_STATUS, EFFECTIVE_DATE)],
        now.toISO());
        newEnrollmentData = newEnrollmentData.setIn([
          getPageSectionKey(1, 3),
          getEntityAddressKey(index + 1, ENROLLMENT_STATUS, STATUS)],
        worksitePlanStatus);

        const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
        associations.push([RELATED_TO, worksitePlanEKID, WORKSITE_PLAN, index + 1, ENROLLMENT_STATUS, {}]);
      });

      associations.push([RESULTS_IN, diversionPlanEKID, DIVERSION_PLAN, 0, PROGRAM_OUTCOME, {}]);

      /* 5. in addition to submitting new data, we need to update diversion plan completed property to true */
      const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
      const completedPTID :UUID = getPropertyTypeIdFromEdm(edm, COMPLETED);
      const diversionPlanDataToUpdate = {
        [diversionPlanESID]: {
          [diversionPlanEKID]: {
            [completedPTID]: [true],
          }
        }
      };
      actions.markDiversionPlanAsComplete({ entityData: diversionPlanDataToUpdate });
    }

    const entitySetIds :Object = this.createEntitySetIdsMap();
    const propertyTypeIds :Object = this.createPropertyTypeIdsMap();

    const entityData :{} = processEntityData(newEnrollmentData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    actions.addNewDiversionPlanStatus({ associationEntityData, entityData });
  }

  render() {
    const {
      currentStatus,
      isLoading,
      onDiscard,
      personName
    } = this.props;
    const { newEnrollmentData } = this.state;

    const selectedStatus = newEnrollmentData
      .getIn([getPageSectionKey(1, 1), getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]);
    const statusIsCompletionStatus :boolean = [
      ENROLLMENT_STATUSES.COMPLETED,
      ENROLLMENT_STATUSES.CLOSED,
      ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT,
      ENROLLMENT_STATUSES.SUCCESSFUL,
      ENROLLMENT_STATUSES.UNSUCCESSFUL
    ].includes(selectedStatus);

    const label = `Please choose the status that best reflects ${personName}'s enrollment in CWP.`;
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>{ label }</Label>
            <Select
                name={getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)}
                onChange={this.handleSelectChange}
                options={ENROLLMENT_STATUS_OPTIONS}
                placeholder={currentStatus} />
          </RowContent>
        </FormRow>
        {
          statusIsCompletionStatus
            ? (
              <>
                <FormRow>
                  <RowContent>
                    <Label>Work program end date</Label>
                    <DatePicker
                        name={getEntityAddressKey(0, PROGRAM_OUTCOME, DATETIME_COMPLETED)}
                        onChange={this.setDate(getEntityAddressKey(0, PROGRAM_OUTCOME, DATETIME_COMPLETED))} />
                  </RowContent>
                </FormRow>
                <FormRow>
                  <RowContent>
                    <Label>Total hours completed</Label>
                    <Input
                        name={getEntityAddressKey(0, PROGRAM_OUTCOME, HOURS_WORKED)}
                        onChange={this.handleInputChange}
                        type="text" />
                  </RowContent>
                </FormRow>
                <FormRow>
                  <RowContent>
                    <Label>Notes on outcome</Label>
                    <TextArea
                        name={getEntityAddressKey(0, PROGRAM_OUTCOME, DESCRIPTION)}
                        onChange={this.handleInputChange} />
                  </RowContent>
                </FormRow>
              </>
            )
            : null
        }
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
  diversionPlan: state.getIn([STATE.PERSON, PERSON.DIVERSION_PLAN]),
  edm: state.get(STATE.EDM),
  worksitePlans: state.getIn([STATE.PERSON, PERSON.WORKSITE_PLANS]),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addNewDiversionPlanStatus,
    markDiversionPlanAsComplete,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddNewPlanStatusForm);
