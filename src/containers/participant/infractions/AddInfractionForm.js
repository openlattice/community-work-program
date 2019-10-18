// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  DatePicker,
  Label,
  Radio,
  Select,
  TextArea,
  TimePicker
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { addInfraction } from './InfractionsActions';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../../utils/DataUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import { STATUS_FILTER_OPTIONS } from '../../participants/ParticipantsConstants';
import {
  APP_TYPE_FQNS,
  DATETIME_COMPLETED,
  DATETIME_END,
  ENROLLMENT_STATUS_FQNS,
  INCIDENT_START_DATETIME,
  INFRACTION_EVENT_FQNS,
  INFRACTION_FQNS,
  WORKSITE_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import {
  PARTICIPANT_SCHEDULE,
  PERSON_INFRACTIONS,
  PERSON,
  STATE,
  WORKSITE_PLANS,
} from '../../../utils/constants/ReduxStateConsts';
import { INFRACTIONS_CONSTS } from '../../../core/edm/constants/DataModelConsts';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;
const {
  APPOINTMENT,
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  INFRACTION_EVENT,
  INFRACTIONS,
  PEOPLE,
  REGISTERED_FOR,
  RELATED_TO,
  RESULTS_IN,
  SUBJECT_OF,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { CATEGORY } = INFRACTION_FQNS;
const { NOTES, TYPE } = INFRACTION_EVENT_FQNS;
const { NAME } = WORKSITE_FQNS;
const { INFRACTION_TYPES } = PERSON_INFRACTIONS;
const {
  WORKSITE_PLANS_LIST,
  WORKSITES_BY_WORKSITE_PLAN,
} = WORKSITE_PLANS;
const { WORK_APPOINTMENTS_BY_WORKSITE_PLAN } = PARTICIPANT_SCHEDULE;

const ENROLLMENT_STATUS_OPTIONS :Object[] = STATUS_FILTER_OPTIONS
  .slice(1)
  .map((status :Object) => {
    return { label: status.label, value: status.value };
  });
const RADIO_OPTIONS :string[] = ['Yes', 'No'];
const INFRACTION_TYPE_OPTIONS :Object[] = [
  { label: INFRACTIONS_CONSTS.VIOLATION, value: INFRACTIONS_CONSTS.VIOLATION },
  { label: INFRACTIONS_CONSTS.WARNING, value: INFRACTIONS_CONSTS.WARNING }
];

const RadioWrapper = styled.span`
  margin-right: 20px;
`;

type Props = {
  actions:{
    addInfraction :RequestSequence;
  };
  app :Map;
  currentStatus :string;
  diversionPlan :Map;
  edm :Map;
  infractionTypes :List;
  isLoading :boolean;
  onDiscard :() => void;
  personEKID :UUID;
  workAppointmentsByWorksitePlan :Map;
  worksitesByWorksitePlan :Map;
};

type State = {
  appointmentEKID :string;
  date :string;
  infractionEKID :string;
  newInfractionData :Map;
  registeredForAppointment :boolean;
  time :string;
  workAppointmentList :Object[];
  workInfraction :string;
  worksitePlanEKID :string;
};

class AddInfractionForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    const workAppointmentList :Object[] = [];
    props.workAppointmentsByWorksitePlan
      .forEach((apptList :List, worksitePlanEKID :UUID) => {
        apptList.forEach((appt :Map) => {
          const appointmentEKID :UUID = getEntityKeyId(appt);
          const { [INCIDENT_START_DATETIME]: startDatetime, [DATETIME_END]: datetimeEnd } = getEntityProperties(
            appt,
            [INCIDENT_START_DATETIME, DATETIME_END]
          );
          const { [NAME]: worksiteName } = getEntityProperties(
            props.worksitesByWorksitePlan.get(worksitePlanEKID),
            [NAME]
          );
          const startObj = DateTime.fromISO(startDatetime);
          const start = startObj.toLocaleString(DateTime.DATETIME_SHORT);
          const endObj = DateTime.fromISO(datetimeEnd);
          const label = startObj.hasSame(endObj, 'day')
            ? `${worksiteName}: ${start} – ${endObj.toLocaleString(DateTime.TIME_SIMPLE)}`
            : `${worksiteName}: ${start} – ${endObj.toLocaleString(DateTime.DATETIME_SHORT)}`;
          workAppointmentList.push({ label, value: { appointmentEKID, worksitePlanEKID } });
        });
      });

    this.state = {
      appointmentEKID: '',
      date: '',
      infractionEKID: '',
      newInfractionData: fromJS({
        [getPageSectionKey(1, 1)]: {},
      }),
      registeredForAppointment: false,
      time: '',
      workAppointmentList,
      workInfraction: '',
      worksitePlanEKID: '',
    };
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [APPOINTMENT]: getEntitySetIdFromApp(app, APPOINTMENT),
      [DIVERSION_PLAN]: getEntitySetIdFromApp(app, DIVERSION_PLAN),
      [ENROLLMENT_STATUS]: getEntitySetIdFromApp(app, ENROLLMENT_STATUS),
      [INFRACTIONS]: getEntitySetIdFromApp(app, INFRACTIONS),
      [INFRACTION_EVENT]: getEntitySetIdFromApp(app, INFRACTION_EVENT),
      [PEOPLE]: getEntitySetIdFromApp(app, PEOPLE),
      [REGISTERED_FOR]: getEntitySetIdFromApp(app, REGISTERED_FOR),
      [RELATED_TO]: getEntitySetIdFromApp(app, RELATED_TO),
      [RESULTS_IN]: getEntitySetIdFromApp(app, RESULTS_IN),
      [SUBJECT_OF]: getEntitySetIdFromApp(app, SUBJECT_OF),
      [WORKSITE_PLAN]: getEntitySetIdFromApp(app, WORKSITE_PLAN),
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [DATETIME_COMPLETED]: getPropertyTypeIdFromEdm(edm, DATETIME_COMPLETED),
      [EFFECTIVE_DATE]: getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE),
      [STATUS]: getPropertyTypeIdFromEdm(edm, STATUS),
      [NOTES]: getPropertyTypeIdFromEdm(edm, NOTES),
      [TYPE]: getPropertyTypeIdFromEdm(edm, TYPE),
    };
  }

  storeDate = () => (date :string) => {
    this.setState({ date });
  }

  storeTime = () => (time :string) => {
    this.setState({ time });
  }

  handleInputChange = (event :SyntheticEvent<HTMLInputElement>) => {
    const { newInfractionData } = this.state;
    const { name, value } = event.currentTarget;
    this.setState({ newInfractionData: newInfractionData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleRadioChange = (option :Object) => {
    const { name } = option.currentTarget;
    this.setState({
      workInfraction: name,
    });
  }

  handleSelectChange = (option :Object, event :Object) => {
    const { newInfractionData } = this.state;
    const { name } = event;
    const { value } = option;
    if (name === REGISTERED_FOR) {
      this.setState({
        appointmentEKID: value.appointmentEKID,
        registeredForAppointment: true,
        worksitePlanEKID: value.worksitePlanEKID,
      });
    }
    else if (name === CATEGORY) {
      this.setState({ infractionEKID: value });
    }
    else {
      this.setState({ newInfractionData: newInfractionData.setIn([getPageSectionKey(1, 1), name], value) });
    }
  }

  handleOnSubmit = () => {
    const { actions, diversionPlan, personEKID } = this.props;
    const {
      appointmentEKID,
      infractionEKID,
      registeredForAppointment,
      worksitePlanEKID
    } = this.state;
    const { date, time } = this.state;
    let { newInfractionData } = this.state;

    const associations = [];
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    const nowAsIso = DateTime.local().toISO();

    const datetimeOfInfraction = date ? getCombinedDateTime(date, time) : nowAsIso;
    newInfractionData = newInfractionData
      .setIn([
        getPageSectionKey(1, 1),
        getEntityAddressKey(0, INFRACTION_EVENT, DATETIME_COMPLETED)
      ], datetimeOfInfraction);

    associations.push([SUBJECT_OF, personEKID, PEOPLE, 0, INFRACTION_EVENT, {}]);
    if (infractionEKID) {
      associations.push([REGISTERED_FOR, 0, INFRACTION_EVENT, infractionEKID, INFRACTIONS, {}]);
      if (worksitePlanEKID) {
        associations.push([RESULTS_IN, worksitePlanEKID, WORKSITE_PLAN, infractionEKID, INFRACTIONS, {}]);
      }
    }

    if (newInfractionData.getIn([getPageSectionKey(1, 1), getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)])) {
      associations.push([RELATED_TO, 0, ENROLLMENT_STATUS, diversionPlanEKID, DIVERSION_PLAN, {}]);
      associations.push([RESULTS_IN, 0, INFRACTION_EVENT, 0, ENROLLMENT_STATUS, {}]);
      newInfractionData = newInfractionData
        .setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)], nowAsIso);
    }

    if (registeredForAppointment) {
      associations.push([REGISTERED_FOR, 0, INFRACTION_EVENT, appointmentEKID, APPOINTMENT, {}]);
      associations.push([RESULTS_IN, worksitePlanEKID, WORKSITE_PLAN, 0, INFRACTION_EVENT, {}]);
    }

    const entitySetIds :Object = this.createEntitySetIdsMap();
    const propertyTypeIds :Object = this.createPropertyTypeIdsMap();

    const entityData :{} = processEntityData(newInfractionData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    actions.addInfraction({ associationEntityData, entityData });
  }

  render() {
    const {
      currentStatus,
      infractionTypes,
      isLoading,
      onDiscard,
    } = this.props;
    const { workAppointmentList, workInfraction } = this.state;

    const VIOLATION_TYPE_OPTIONS = infractionTypes.map((infractionEntity :Map) => {
      const { [CATEGORY]: category } = getEntityProperties(infractionEntity, [CATEGORY]);
      const infractionEKID :UUID = getEntityKeyId(infractionEntity);
      return { label: category, value: infractionEKID };
    });
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Date of infraction</Label>
            <DatePicker
                name={getEntityAddressKey(0, INFRACTION_EVENT, DATETIME_COMPLETED)}
                onChange={this.storeDate()} />
          </RowContent>
          <RowContent>
            <Label>Time of infraction</Label>
            <TimePicker
                name={getEntityAddressKey(0, INFRACTION_EVENT, DATETIME_COMPLETED)}
                onChange={this.storeTime()} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Type of infraction</Label>
            <Select
                name={getEntityAddressKey(0, INFRACTION_EVENT, TYPE)}
                onChange={this.handleSelectChange}
                options={INFRACTION_TYPE_OPTIONS} />
          </RowContent>
          <RowContent>
            <Label>Infraction category</Label>
            <Select
                name={CATEGORY}
                onChange={this.handleSelectChange}
                options={VIOLATION_TYPE_OPTIONS} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Notes</Label>
            <TextArea
                name={getEntityAddressKey(0, INFRACTION_EVENT, NOTES)}
                onChange={this.handleInputChange} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Did this incident happen during work?</Label>
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            {
              RADIO_OPTIONS.map((option :string) => {
                const checked = option === workInfraction;
                return (
                  <RadioWrapper key={option}>
                    <Radio
                        checked={checked}
                        label={option}
                        name={option}
                        onChange={this.handleRadioChange}
                        value={option} />
                  </RadioWrapper>
                );
              })
            }
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>If yes, choose work site appointment:</Label>
            <Select
                isDisabled={workInfraction !== RADIO_OPTIONS[0]}
                name={REGISTERED_FOR}
                onChange={this.handleSelectChange}
                options={workAppointmentList} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>If relevant, choose new enrollment status:</Label>
            <Select
                name={getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)}
                onChange={this.handleSelectChange}
                options={ENROLLMENT_STATUS_OPTIONS}
                placeholder={currentStatus} />
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

const mapStateToProps = (state :Map) => {
  const person = state.get(STATE.PERSON);
  const infractions = state.get(STATE.INFRACTIONS);
  const worksitePlans = state.get(STATE.WORKSITE_PLANS);
  const participantSchedule = state.get(STATE.PARTICIPANT_SCHEDULE);
  return ({
    app: state.get(STATE.APP),
    [PERSON.DIVERSION_PLAN]: person.get(PERSON.DIVERSION_PLAN),
    edm: state.get(STATE.EDM),
    [INFRACTION_TYPES]: infractions.get(INFRACTION_TYPES),
    [WORKSITE_PLANS_LIST]: worksitePlans.get(WORKSITE_PLANS_LIST),
    [WORKSITES_BY_WORKSITE_PLAN]: worksitePlans.get(WORKSITES_BY_WORKSITE_PLAN),
    [WORK_APPOINTMENTS_BY_WORKSITE_PLAN]: participantSchedule.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN),
  });
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addInfraction,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddInfractionForm);
