// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  Colors,
  Input,
  Label,
  Radio,
  TimePicker,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { checkInForAppointment } from '../assignedworksites/WorksitePlanActions';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import { get24HourTimeForCheckIn, getHoursScheduled } from '../utils/CheckInUtils';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import {
  APP,
  EDM,
  PERSON,
  STATE
} from '../../../utils/constants/ReduxStateConsts';

const { RED_1 } = Colors;

const {
  APPOINTMENT,
  CHECK_INS,
  CHECK_IN_DETAILS,
  FULFILLS,
  HAS,
  PEOPLE,
} = APP_TYPE_FQNS;
const {
  CHECKED_IN,
  DATETIME_END,
  DATETIME_START,
  ENTITY_KEY_ID,
  HOURS_WORKED,
} = PROPERTY_TYPE_FQNS;

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const { PARTICIPANT } = PERSON;

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;

const RADIO_OPTIONS :string[] = ['Yes', 'No'];

const RadioWrapper = styled.span`
  margin-right: 20px;
`;

const ErrorMessage = styled.div`
  color: ${RED_1};
  max-width: 351px;
`;

type Props = {
  actions:{
    checkInForAppointment :RequestSequence;
  };
  appointment :Map;
  entitySetIds :Map;
  isLoading :boolean;
  onDiscard :() => void;
  personEKID :UUID;
  personName :string;
  propertyTypeIds :Map;
};

type State = {
  checkedIn :string;
  newCheckInData :Map;
  timeIn :string;
  timeOut :string;
};

class CheckInForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    const { appointment } = props;
    const hours = appointment.get('hours');
    const { timeIn, timeOut } = get24HourTimeForCheckIn(hours);
    const hoursScheduled :number = getHoursScheduled(timeIn, timeOut);
    this.state = {
      checkedIn: '',
      newCheckInData: fromJS({
        [getPageSectionKey(1, 1)]: {
          [getEntityAddressKey(0, CHECK_IN_DETAILS, HOURS_WORKED)]: hoursScheduled
        },
      }),
      timeIn,
      timeOut,
    };
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newCheckInData } = this.state;
    const { name, value } = e.currentTarget;
    const valueToFloat = value.length ? parseFloat(value) : '';
    this.setState({ newCheckInData: newCheckInData.setIn([getPageSectionKey(1, 1), name], valueToFloat) });
  }

  handleRadioChange = (option :Object) => {
    const { appointment } = this.props;
    const { newCheckInData } = this.state;
    const { name } = option.currentTarget;

    if (name === RADIO_OPTIONS[1]) {
      this.setState({
        checkedIn: name,
        newCheckInData: newCheckInData.setIn([
          getPageSectionKey(1, 1),
          getEntityAddressKey(0, CHECK_IN_DETAILS, HOURS_WORKED)
        ], 0),
        timeIn: '',
        timeOut: ''
      });
    }
    else {
      const hours = appointment.get('hours');
      const { timeIn: originalTimeIn, timeOut: originalTimeOut } = get24HourTimeForCheckIn(hours);
      const hoursScheduled :number = getHoursScheduled(originalTimeIn, originalTimeOut);
      this.setState({
        checkedIn: name,
        newCheckInData: newCheckInData.setIn([
          getPageSectionKey(1, 1),
          getEntityAddressKey(0, CHECK_IN_DETAILS, HOURS_WORKED)
        ], hoursScheduled),
        timeIn: originalTimeIn,
        timeOut: originalTimeOut
      });
    }
  }

  setRawTime = (type :string) => (time :string) => {
    if (type === DATETIME_START) this.setState({ timeIn: time });
    if (type === DATETIME_END) this.setState({ timeOut: time });
  }

  handleOnSubmit = () => {
    const {
      actions,
      appointment,
      entitySetIds,
      personEKID,
      propertyTypeIds,
    } = this.props;
    const { checkedIn, timeIn, timeOut } = this.state;
    let { newCheckInData } = this.state;

    let participantCheckedIn = false;
    if (checkedIn === RADIO_OPTIONS[0]) participantCheckedIn = true;
    newCheckInData = newCheckInData
      .setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, CHECK_INS, CHECKED_IN)], participantCheckedIn);

    if (participantCheckedIn) {
      const appointmentDateToISO :string = new Date(appointment.get('day')).toISOString();
      const appointmentDate :string = DateTime.fromISO(appointmentDateToISO).toISODate();
      const dateTimeCheckedIn :string = getCombinedDateTime(appointmentDate, timeIn);
      const dateTimeCheckedOut :string = getCombinedDateTime(appointmentDate, timeOut);
      newCheckInData = newCheckInData
        .setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, CHECK_INS, DATETIME_START)], dateTimeCheckedIn);
      newCheckInData = newCheckInData
        .setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, CHECK_INS, DATETIME_END)], dateTimeCheckedOut);
    }

    const appointmentEKID :UUID = appointment.get(ENTITY_KEY_ID);
    const associations = [];

    associations.push([HAS, personEKID, PEOPLE, 0, CHECK_INS, {}]);
    associations.push([FULFILLS, 0, CHECK_INS, appointmentEKID, APPOINTMENT, {}]);
    associations.push([HAS, 0, CHECK_INS, 0, CHECK_IN_DETAILS, {}]);

    const entityData :{} = processEntityData(newCheckInData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);
    actions.checkInForAppointment({ associationEntityData, entityData });
  }

  render() {
    const { isLoading, onDiscard, personName } = this.props;
    const {
      checkedIn,
      newCheckInData,
      timeIn,
      timeOut,
    } = this.state;

    const checkedInIsBlankOrNo :boolean = !checkedIn || checkedIn === RADIO_OPTIONS[1];

    const hoursCalculatedFromFormTimes = getHoursScheduled(timeIn, timeOut);
    const hoursInFormData :number | string = newCheckInData.getIn([
      getPageSectionKey(1, 1),
      getEntityAddressKey(0, CHECK_IN_DETAILS, HOURS_WORKED)
    ]);
    const formHoursAndTimesConflict :boolean = hoursCalculatedFromFormTimes !== hoursInFormData;

    const checkInQuestion = `Did ${personName} appear for this work appointment?`;
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>{ checkInQuestion }</Label>
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            {
              RADIO_OPTIONS.map((option :string) => {
                const checked = option === checkedIn;
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
            <Label>Time checked in</Label>
            <TimePicker
                disabled={checkedInIsBlankOrNo}
                format="H:mm"
                mask="__:__"
                name={getEntityAddressKey(0, CHECK_INS, DATETIME_START)}
                onChange={this.setRawTime(DATETIME_START)}
                placeholder="HH:MM"
                value={timeIn} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Time checked out</Label>
            <TimePicker
                disabled={checkedInIsBlankOrNo}
                format="H:mm"
                mask="__:__"
                name={getEntityAddressKey(0, CHECK_INS, DATETIME_END)}
                onChange={this.setRawTime(DATETIME_END)}
                placeholder="HH:MM"
                value={timeOut} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Hours worked during appointment</Label>
            <Input
                disabled={checkedInIsBlankOrNo}
                name={getEntityAddressKey(0, CHECK_IN_DETAILS, HOURS_WORKED)}
                onChange={this.handleInputChange}
                type="text"
                value={newCheckInData.getIn([
                  getPageSectionKey(1, 1),
                  getEntityAddressKey(0, CHECK_IN_DETAILS, HOURS_WORKED)
                ])} />
          </RowContent>
        </FormRow>
        {
          formHoursAndTimesConflict && (
            <FormRow>
              <RowContent>
                <ErrorMessage>
                  There is a conflict between hours entered and times selected. Please fix before submitting.
                </ErrorMessage>
              </RowContent>
            </FormRow>
          )
        }
        <ButtonsRow>
          <Button onClick={onDiscard}>Discard</Button>
          <Button
              disabled={checkedInIsBlankOrNo || formHoursAndTimesConflict}
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
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  const person = state.get(STATE.PERSON);
  return ({
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
    [PARTICIPANT]: person.get(PARTICIPANT),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    checkInForAppointment,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CheckInForm);
