// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  Input,
  Label,
  Radio,
  TimePicker,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { checkInForAppointment } from '../ParticipantActions';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import {
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../../utils/DataUtils';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';
import {
  APP_TYPE_FQNS,
  CHECK_IN_FQNS,
  DATETIME_START,
  DATETIME_END,
  ENTITY_KEY_ID,
  WORKSITE_PLAN_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  APPOINTMENT,
  CHECK_INS,
  CHECK_IN_DETAILS,
  FULFILLS,
  HAS,
  PEOPLE,
} = APP_TYPE_FQNS;
const { CHECKED_IN } = CHECK_IN_FQNS;
const { HOURS_WORKED } = WORKSITE_PLAN_FQNS;
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

type Props = {
  actions:{
    checkInForAppointment :RequestSequence;
  };
  app :Map;
  appointment :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
  personEKID :UUID;
  personName :string;
};

type State = {
  checkedIn :string;
  newCheckInData :Map;
  timeIn :string;
  timeOut :string;
};

class CheckInForm extends Component<Props, State> {

  state = {
    checkedIn: '',
    newCheckInData: fromJS({
      [getPageSectionKey(1, 1)]: {},
    }),
    timeIn: '',
    timeOut: '',
  };

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [APPOINTMENT]: getEntitySetIdFromApp(app, APPOINTMENT),
      [CHECK_INS]: getEntitySetIdFromApp(app, CHECK_INS),
      [CHECK_IN_DETAILS]: getEntitySetIdFromApp(app, CHECK_IN_DETAILS),
      [FULFILLS]: getEntitySetIdFromApp(app, FULFILLS),
      [HAS]: getEntitySetIdFromApp(app, HAS),
      [PEOPLE]: getEntitySetIdFromApp(app, PEOPLE),
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [DATETIME_START]: getPropertyTypeIdFromEdm(edm, DATETIME_START),
      [DATETIME_END]: getPropertyTypeIdFromEdm(edm, DATETIME_END),
      [CHECKED_IN]: getPropertyTypeIdFromEdm(edm, CHECKED_IN),
      [HOURS_WORKED]: getPropertyTypeIdFromEdm(edm, HOURS_WORKED),
    };
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newCheckInData } = this.state;
    const { name, value } = e.currentTarget;
    const valueToFloat = parseFloat(value);
    this.setState({ newCheckInData: newCheckInData.setIn([getPageSectionKey(1, 1), name], valueToFloat) });
  }

  handleRadioChange = (option :Object) => {
    const { name } = option.currentTarget;
    this.setState({
      checkedIn: name,
    });
  }

  setRawTime = (type :string) => (time :string) => {
    if (type === DATETIME_START) this.setState({ timeIn: time });
    if (type === DATETIME_END) this.setState({ timeOut: time });
  }

  handleOnSubmit = () => {
    const { actions, appointment, personEKID } = this.props;
    const { checkedIn, timeIn, timeOut } = this.state;
    let { newCheckInData } = this.state;

    let participantCheckedIn = false;
    if (checkedIn === RADIO_OPTIONS[0]) participantCheckedIn = true;
    newCheckInData = newCheckInData
      .setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, CHECK_INS, CHECKED_IN)], participantCheckedIn);

    const appointmentDateToISO :string = new Date(appointment.get('day')).toISOString();
    const appointmentDate :string = DateTime.fromISO(appointmentDateToISO).toISODate();
    const dateTimeCheckedIn :string = getCombinedDateTime(appointmentDate, timeIn);
    const dateTimeCheckedOut :string = getCombinedDateTime(appointmentDate, timeOut);
    newCheckInData = newCheckInData
      .setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, CHECK_INS, DATETIME_START)], dateTimeCheckedIn);
    newCheckInData = newCheckInData
      .setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, CHECK_INS, DATETIME_END)], dateTimeCheckedOut);

    const appointmentEKID :UUID = appointment.get(ENTITY_KEY_ID);
    const associations = [];

    associations.push([HAS, personEKID, PEOPLE, 0, CHECK_INS, {}]);
    associations.push([FULFILLS, 0, CHECK_INS, appointmentEKID, APPOINTMENT, {}]);
    associations.push([HAS, 0, CHECK_INS, 0, CHECK_IN_DETAILS, {}]);

    const entitySetIds :Object = this.createEntitySetIdsMap();
    const propertyTypeIds :Object = this.createPropertyTypeIdsMap();

    const entityData :{} = processEntityData(newCheckInData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);
    actions.checkInForAppointment({ associationEntityData, entityData });
  }

  render() {
    const { isLoading, onDiscard, personName } = this.props;
    const { checkedIn } = this.state;

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
                name={getEntityAddressKey(0, CHECK_INS, DATETIME_START)}
                onChange={this.setRawTime(DATETIME_START)} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Time checked out</Label>
            <TimePicker
                name={getEntityAddressKey(0, CHECK_INS, DATETIME_END)}
                onChange={this.setRawTime(DATETIME_END)} />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Hours worked during appointment</Label>
            <Input
                name={getEntityAddressKey(0, CHECK_IN_DETAILS, HOURS_WORKED)}
                onChange={this.handleInputChange}
                type="text" />
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
    [PARTICIPANT]: person.get(PARTICIPANT),
  });
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    checkInForAppointment,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CheckInForm);
