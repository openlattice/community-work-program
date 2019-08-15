// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  Checkbox,
  DatePicker,
  Input,
  Label,
  Radio,
  Select,
  TimePicker,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../../utils/DataUtils';
import { getCombinedDateTime, getRegularlyRepeatingAppointments } from '../../../utils/ScheduleUtils';
import {
  APP_TYPE_FQNS,
  DATETIME_END,
  INCIDENT_START_DATETIME,
  WORKSITE_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
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
  ADDRESSES,
  APPOINTMENT,
  HAS,
  PEOPLE,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { NAME } = WORKSITE_FQNS;
const { WORKSITES_BY_WORKSITE_PLAN } = PERSON;

const START = 'start';
const END = 'end';
const daysOfTheWeek :Object[] = [
  { label: 'Sun', value: 1 },
  { label: 'Mon', value: 2 },
  { label: 'Tues', value: 3 },
  { label: 'Weds', value: 4 },
  { label: 'Thurs', value: 5 },
  { label: 'Fri', value: 6 },
  { label: 'Sat', value: 7 },
];

const generateNumbersList = () => {
  const numbers = [];
  for (let i = 1; i < 13; i += 1) {
    let label = `${i} weeks`;
    if (i === 1) label = `${i} week`;
    numbers.push({ label, value: i });
  }
  return numbers;
}

const RadioButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

type Props = {
  actions:{
    createWorkAppointment :RequestSequence;
  };
  app :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
  personEKID :UUID;
  worksitesByWorksitePlan :Map;
};

type State = {
  appointmentDays :number[];
  endsOnDate :string;
  isRepeatingAppointment :boolean;
  newAppointmentData :Map;
  rawEndTime :string;
  rawStartDate :string;
  rawStartTime :string;
  weeklyIntervalToRepeat :number;
  worksitePlanEKID :string;
};

class CreateWorkAppointmentForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      appointmentDays: [],
      endsOnDate: '',
      isRepeatingAppointment: false,
      newAppointmentData: fromJS({
        [getPageSectionKey(1, 1)]: {},
      }),
      rawEndTime: '',
      rawStartDate: '',
      rawStartTime: '',
      weeklyIntervalToRepeat: 0,
      worksitePlanEKID: '',
    };
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [ADDRESSES]: getEntitySetIdFromApp(app, ADDRESSES),
      [APPOINTMENT]: getEntitySetIdFromApp(app, APPOINTMENT),
      [HAS]: getEntitySetIdFromApp(app, HAS),
      [PEOPLE]: getEntitySetIdFromApp(app, PEOPLE),
      [WORKSITE_PLAN]: getEntitySetIdFromApp(app, WORKSITE_PLAN),
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [INCIDENT_START_DATETIME]: getPropertyTypeIdFromEdm(edm, INCIDENT_START_DATETIME),
      [DATETIME_END]: getPropertyTypeIdFromEdm(edm, DATETIME_END),
    };
  }

  handleCheckboxChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { appointmentDays } = this.state;
    let { value } = e.currentTarget;
    value = parseInt(value, 10);
    this.setState({ appointmentDays: appointmentDays.concat([value]) });
  }

  handleWorkSiteSelectChange = (option :Object) => {
    const { value } = option;
    this.setState({ worksitePlanEKID: value });
  }

  handleRepetitionSelectChange = (option :Object) => {
    let { value } = option;
    value = parseInt(value, 10);
    this.setState({ weeklyIntervalToRepeat: value });
  }

  setRawStartDate = () => (date :string) => {
    this.setState({ rawStartDate: date });
  }

  setRawTime = (type :string) => (time :string) => {
    if (type === START) this.setState({ rawStartTime: time });
    if (type === END) this.setState({ rawEndTime: time });
  }

  setEndsOnDate = () => (date :string) => {
    // const dateAsDateTime = DateTime.fromISO(date).toISO();
    this.setState({ endsOnDate: date });
  }

  setIsRepeatingAppointment = () => {
    const { isRepeatingAppointment } = this.state;
    this.setState({ isRepeatingAppointment: !isRepeatingAppointment });
  }

  handleOnSubmit = () => {
    const { actions, personEKID } = this.props;
    const {
      appointmentDays,
      endsOnDate,
      isRepeatingAppointment,
      rawEndTime,
      rawStartDate,
      rawStartTime,
      weeklyIntervalToRepeat,
      worksitePlanEKID,
    } = this.state;
    let { newAppointmentData } = this.state;

    const associations = [];
    const nowAsIso = DateTime.local().toISO();

    const startDateTime = getCombinedDateTime(rawStartDate, rawStartTime);
    const endDateTime = getCombinedDateTime(rawStartDate, rawEndTime);
    const endsOnDateTime = getCombinedDateTime(endsOnDate, rawEndTime);

    if (isRepeatingAppointment) {

      let appointmentDateTimes = [];

      if (!appointmentDays.length) {
        appointmentDateTimes = getRegularlyRepeatingAppointments(
          startDateTime,
          endDateTime,
          endsOnDateTime,
          'weeks',
          weeklyIntervalToRepeat,
        );
      }
      console.log('appointmentDateTimes: ', appointmentDateTimes);
    }

    // associations.push([ADDRESSES, 0, APPOINTMENT, worksitePlanEKID, WORKSITE_PLAN, {}]);
    // associations.push([HAS, personEKID, PEOPLE, 0, APPOINTMENT, {}]);
    //
    // const entitySetIds :Object = this.createEntitySetIdsMap();
    // const propertyTypeIds :Object = this.createPropertyTypeIdsMap();
    //
    // const entityData :{} = processEntityData(newAppointmentData, entitySetIds, propertyTypeIds);
    // const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    // actions.createWorkAppointment({ associationEntityData, entityData });
  }

  render() {
    const {
      isLoading,
      onDiscard,
      worksitesByWorksitePlan,
    } = this.props;
    const { isRepeatingAppointment } = this.state;

    const WORKSITES_OPTIONS :Object[] = [];
    worksitesByWorksitePlan.forEach((worksite :Map, worksitePlanEKID :UUID) => {
      const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
      WORKSITES_OPTIONS.push({ label: worksiteName, value: worksitePlanEKID });
    });

    const NUMBERS_OPTIONS = generateNumbersList();

    console.log('this.state ', this.state);

    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Work Site</Label>
            <Select
                onChange={this.handleWorkSiteSelectChange}
                options={WORKSITES_OPTIONS} />
          </RowContent>
          <RowContent>
            <Label>Date</Label>
            <DatePicker
                onChange={this.setRawStartDate()} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Start time</Label>
            <TimePicker
                onChange={this.setRawTime(START)} />
          </RowContent>
          <RowContent>
            <Label>End time</Label>
            <TimePicker
                onChange={this.setRawTime(END)} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Checkbox
                label="This is a repeating appointment"
                onChange={this.setIsRepeatingAppointment}
                value={isRepeatingAppointment} />
          </RowContent>
        </FormRow>
        {
          isRepeatingAppointment
            ? (
              <>
                <FormRow>
                  <RowContent>
                    <Label>Repeat every:</Label>
                    <Select
                        onChange={this.handleRepetitionSelectChange}
                        options={NUMBERS_OPTIONS} />
                  </RowContent>
                  <RowContent>
                    <Label>Repeat until (inclusive):</Label>
                    <DatePicker
                        onChange={this.setEndsOnDate()} />
                  </RowContent>
                </FormRow>
                <FormRow>
                  <RowContent>
                    <Label>Repeat on:</Label>
                    <RadioButtonsWrapper>
                      {
                        daysOfTheWeek.map((option :Object) => (
                          <Checkbox
                              key={option.value}
                              label={option.label}
                              onChange={this.handleCheckboxChange}
                              value={option.value} />
                        ))
                      }
                    </RadioButtonsWrapper>
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
  edm: state.get(STATE.EDM),
  [WORKSITES_BY_WORKSITE_PLAN]: state.getIn([STATE.PERSON, WORKSITES_BY_WORKSITE_PLAN]),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    // addNewDiversionPlanStatus,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CreateWorkAppointmentForm);
