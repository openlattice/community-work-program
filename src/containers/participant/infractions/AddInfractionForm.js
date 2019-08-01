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
  TimePicker
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

// import { addNewDiversionPlanStatus } from './ParticipantActions';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../../utils/DataUtils';
import { STATUS_FILTER_OPTIONS } from '../../participants/ParticipantsConstants';
import {
  APP_TYPE_FQNS,
  ENROLLMENT_STATUS_FQNS,
  INFRACTION_FQNS,
  INFRACTION_EVENT_FQNS,
  RELATED_TO_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
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
const { DATETIME_COMPLETED } = RELATED_TO_FQNS;
const {
  INFRACTION_TYPES,
} = PERSON;

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
    addNewDiversionPlanStatus :RequestSequence;
  };
  app :Map;
  currentStatus :string;
  diversionPlan :Map;
  edm :Map;
  infractionTypes :List;
  isLoading :boolean;
  onDiscard :() => void;
  personEKID :UUID;
};

type State = {
  appointmentEKID :string;
  date :string;
  infractionEKID :string;
  newInfractionData :Map;
  registeredForAppointment :boolean;
  time :string;
  workInfraction :string;
};

class AddNewPlanStatusForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      appointmentEKID: '',
      date: '',
      infractionEKID: '',
      newInfractionData: fromJS({
        [getPageSectionKey(1, 1)]: {},
      }),
      registeredForAppointment: false,
      time: '',
      workInfraction: '',
    };
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [ENROLLMENT_STATUS]: getEntitySetIdFromApp(app, ENROLLMENT_STATUS),
      [RELATED_TO]: getEntitySetIdFromApp(app, RELATED_TO),
      [DIVERSION_PLAN]: getEntitySetIdFromApp(app, DIVERSION_PLAN),
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [DATETIME_COMPLETED]: getPropertyTypeIdFromEdm(edm, DATETIME_COMPLETED),
      [EFFECTIVE_DATE]: getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE),
      [STATUS]: getPropertyTypeIdFromEdm(edm, STATUS),
    };
  }

  storeDate = () => (date :string) => {
    this.setState({ date });
  }

  storeTime = () => (time :string) => {
    this.setState({ time });
  }

  getCombinedDateTime = () => {
    const { date, time } = this.state;
    const datetimeString :string = date.concat(' ', time);
    const datetime = DateTime.local(datetimeString).toISO();
    return datetime;
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
      this.setState({ registeredForAppointment: true });
    }
    if (name === CATEGORY) {
      this.setState({ infractionEKID: value });
    }
    console.log('value: ', value);
    this.setState({ newInfractionData: newInfractionData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleOnSubmit = () => {
    const { actions, diversionPlan, personEKID } = this.props;
    const { appointmentEKID, infractionEKID, registeredForAppointment } = this.state;
    let { newInfractionData } = this.state;

    const associations = [];
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    const nowAsIso = DateTime.local().toISO();

    const datetimeOfInfraction = this.getCombinedDateTime();
    newInfractionData = newInfractionData
      .setIn([
        getPageSectionKey(1, 1),
        getEntityAddressKey(0, INFRACTION_EVENT, DATETIME_COMPLETED)
      ], datetimeOfInfraction);

    associations.push([SUBJECT_OF, personEKID, PEOPLE, 0, INFRACTION_EVENT, {}]);
    associations.push([REGISTERED_FOR, 0, INFRACTION_EVENT, infractionEKID, INFRACTIONS, {}]);

    const innerDataSection = newInfractionData.get(getPageSectionKey(1, 1));
    if (innerDataSection.get(getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS))) {

      associations.push([RELATED_TO, diversionPlanEKID, DIVERSION_PLAN, 0, ENROLLMENT_STATUS, {}]);
      associations.push([RESULTS_IN, 0, INFRACTION_EVENT, 0, ENROLLMENT_STATUS, {}]);
      newInfractionData = newInfractionData
        .setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)], nowAsIso);
    }

    if (registeredForAppointment) {
      associations.push([REGISTERED_FOR, 0, INFRACTION_EVENT, appointmentEKID, APPOINTMENT, {}]);
      associations.push([REGISTERED_FOR, worksitePlanEKID, WORKSITE_PLAN, 0, INFRACTION_EVENT, {}]);
    }

    const entitySetIds :Object = this.createEntitySetIdsMap();
    const propertyTypeIds :Object = this.createPropertyTypeIdsMap();

    const entityData :{} = processEntityData(newInfractionData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    // actions.addNewDiversionPlanStatus({ associationEntityData, entityData });
  }

  render() {
    const {
      currentStatus,
      infractionTypes,
      isLoading,
      onDiscard,
    } = this.props;
    const { newInfractionData, workInfraction } = this.state;

    const VIOLATION_TYPE_OPTIONS = infractionTypes.map((infractionEntity :Map) => {
      const { [CATEGORY]: category } = getEntityProperties(infractionEntity, [CATEGORY]);
      const infractionEKID :UUID = getEntityKeyId(infractionEntity);
      return { label: category, value: infractionEKID };
    });
    const isViolation :boolean = newInfractionData.getIn([
      getPageSectionKey(1, 1),
      getEntityAddressKey(0, INFRACTION_EVENT, TYPE)
    ]) === INFRACTIONS_CONSTS.VIOLATION;
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
            <Label>If violation, add category:</Label>
            <Select
                isDisabled={!isViolation}
                name={CATEGORY}
                onChange={this.handleSelectChange}
                options={VIOLATION_TYPE_OPTIONS} />
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
            <Label>Work site appointment</Label>
            <Select
                isDisabled={workInfraction !== RADIO_OPTIONS[0]}
                name={REGISTERED_FOR}
                onChange={this.handleSelectChange}
                options={[]} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Choose new enrollment status, if relevant:</Label>
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
  return ({
    app: state.get(STATE.APP),
    edm: state.get(STATE.EDM),
    [INFRACTION_TYPES]: person.get(INFRACTION_TYPES),
  });
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddNewPlanStatusForm);
