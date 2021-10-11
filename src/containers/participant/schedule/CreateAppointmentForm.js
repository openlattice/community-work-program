/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map, fromJS } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  Checkbox,
  DatePicker,
  Label,
  Select,
  TimePicker,
} from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import ErrorMessage from '../../../components/error/ErrorMessage';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../../utils/DataUtils';
import {
  getCombinedDateTime,
  getCustomSchedule,
  getRegularlyRepeatingAppointments
} from '../../../utils/ScheduleUtils';
import {
  APP,
  EDM,
  SHARED,
  STATE,
  WORKSITE_PLANS,
} from '../../../utils/constants/ReduxStateConsts';
import { createWorkAppointments } from '../assignedworksites/WorksitePlanActions';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;
const { isFailure } = ReduxUtils;
const {
  ADDRESSES,
  APPOINTMENT,
  HAS,
  PEOPLE,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { DATETIME_END, INCIDENT_START_DATETIME, NAME } = PROPERTY_TYPE_FQNS;

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { CREATE_WORK_APPOINTMENTS, WORKSITES_BY_WORKSITE_PLAN } = WORKSITE_PLANS;

const START = 'start';
const END = 'end';
const WEEKS = 'weeks';
const daysOfTheWeek :Object[] = [
  { label: 'Sun', value: 7 },
  { label: 'Mon', value: 1 },
  { label: 'Tues', value: 2 },
  { label: 'Weds', value: 3 },
  { label: 'Thurs', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const generateWeekOptionsList = () => {
  const numbers = [];
  for (let i = 1; i < 13; i += 1) {
    let label = `${i} weeks`;
    if (i === 1) label = `${i} week`;
    numbers.push({ label, value: i });
  }
  return numbers;
};

const RadioButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

type Props = {
  actions:{
    createWorkAppointments :RequestSequence;
  };
  entitySetIds :Map;
  isLoading :boolean;
  onDiscard :() => void;
  personEKID :UUID;
  propertyTypeIds :Map;
  requestStates:{
    CREATE_WORK_APPOINTMENTS :RequestState;
  };
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
    this.setState({ endsOnDate: date });
  }

  setIsRepeatingAppointment = () => {
    const { isRepeatingAppointment } = this.state;
    this.setState({ isRepeatingAppointment: !isRepeatingAppointment });
  }

  handleOnSubmit = () => {
    const {
      actions,
      entitySetIds,
      personEKID,
      propertyTypeIds
    } = this.props;
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

    const startDateTime = getCombinedDateTime(rawStartDate, rawStartTime);
    const endDateTime = getCombinedDateTime(rawStartDate, rawEndTime);

    let appointmentDateTimes = [];

    if (isRepeatingAppointment) {

      const endsOnDateTime = getCombinedDateTime(endsOnDate, rawEndTime);
      const startDateWeekday = DateTime.fromISO(startDateTime).weekday;

      if (!appointmentDays.length || (appointmentDays.length === 1 && appointmentDays[0] === startDateWeekday)) {
        appointmentDateTimes = appointmentDateTimes.concat(
          getRegularlyRepeatingAppointments(
            startDateTime,
            endDateTime,
            endsOnDateTime,
            WEEKS,
            weeklyIntervalToRepeat,
          )
        );
      }
      else if (appointmentDays.length > 1) {
        appointmentDateTimes = appointmentDateTimes.concat(
          getCustomSchedule(
            appointmentDays,
            startDateTime,
            endDateTime,
            endsOnDateTime,
            WEEKS,
            weeklyIntervalToRepeat,
          )
        );
      }
    }
    else {
      appointmentDateTimes.push({
        [INCIDENT_START_DATETIME]: startDateTime,
        [DATETIME_END]: endDateTime
      });
    }

    const associations = [];

    appointmentDateTimes.forEach((appointment :Object, i :number) => {
      newAppointmentData = newAppointmentData
        .setIn([getPageSectionKey(1, 1), getEntityAddressKey(i, APPOINTMENT, INCIDENT_START_DATETIME)],
          appointment[INCIDENT_START_DATETIME]);
      newAppointmentData = newAppointmentData
        .setIn([getPageSectionKey(1, 1), getEntityAddressKey(i, APPOINTMENT, DATETIME_END)],
          appointment[DATETIME_END]);

      associations.push([ADDRESSES, i, APPOINTMENT, worksitePlanEKID, WORKSITE_PLAN, {}]);
      associations.push([HAS, personEKID, PEOPLE, i, APPOINTMENT, {}]);
    });

    const entityData :{} = processEntityData(newAppointmentData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);
    actions.createWorkAppointments({ associationEntityData, entityData });
  }

  render() {
    const {
      isLoading,
      onDiscard,
      requestStates,
      worksitesByWorksitePlan,
    } = this.props;
    const { isRepeatingAppointment } = this.state;

    const WORKSITES_OPTIONS :Object[] = [];
    worksitesByWorksitePlan.forEach((worksite :Map, worksitePlanEKID :UUID) => {
      const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
      WORKSITES_OPTIONS.push({ label: worksiteName, value: worksitePlanEKID });
    });

    const NUMBERS_OPTIONS = generateWeekOptionsList();
    const createAppointmentFailed :boolean = isFailure(requestStates[CREATE_WORK_APPOINTMENTS]);

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
                format="H:mm"
                mask="__:__"
                onChange={this.setRawTime(START)}
                placeholder="HH:MM" />
          </RowContent>
          <RowContent>
            <Label>End time</Label>
            <TimePicker
                format="H:mm"
                mask="__:__"
                onChange={this.setRawTime(END)}
                placeholder="HH:MM" />
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
              color="primary"
              isLoading={isLoading}
              onClick={this.handleOnSubmit}>
            Submit
          </Button>
        </ButtonsRow>
        { createAppointmentFailed && <ErrorMessage errorMessage="Could not create appointment. Please try again." /> }
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
    requestStates: {
      [CREATE_WORK_APPOINTMENTS]: state.getIn([STATE.WORKSITE_PLANS, ACTIONS, CREATE_WORK_APPOINTMENTS, REQUEST_STATE])
    },
    [WORKSITES_BY_WORKSITE_PLAN]: state.getIn([STATE.WORKSITE_PLANS, WORKSITES_BY_WORKSITE_PLAN]),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    createWorkAppointments
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CreateWorkAppointmentForm);
