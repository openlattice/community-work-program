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
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
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
const repetitionOptions :Object[] = [
  { label: 'Weekday', value: 'Weekday' },
  { label: 'Week', value: 'Week' },
  { label: 'Month', value: 'Month' },
];
const daysOfTheWeek :Object[] = [
  { label: 'Monday', value: 'Monday' },
  { label: 'Tuesday', value: 'Tuesday' },
  { label: 'Wednesday', value: 'Wednesday' },
  { label: 'Thursday', value: 'Thursday' },
  { label: 'Friday', value: 'Friday' },
];

const RadioButtonsRow = styled(FormRow)`
  align-items: flex-start;
`;

const RadioButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  space-between;
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
  endsOnDate :string;
  newAppointmentData :Map;
  rawEndTime :string;
  rawStartDate :string;
  rawStartTime :string;
  worksitePlanEKID :string;
};

class CreateWorkAppointmentForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      endsOnDate: '',
      newAppointmentData: fromJS({
        [getPageSectionKey(1, 1)]: {},
      }),
      rawEndTime: '',
      rawStartDate: '',
      rawStartTime: '',
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

  handleSelectChange = (option :Object) => {
    const { value } = option;
    this.setState({ worksitePlanEKID: value });
  }

  setRawStartDate = () => (date :string) => {
    console.log('date: ', date);
    this.setState({ rawStartDate: date });
  }

  setRawTime = (type :string) => (time :string) => {
    if (type === START) this.setState({ rawStartTime: time });
    if (type === END) this.setState({ rawEndTime: time });
  }

  setEndsOnDate = () => (date :string) => {
    const dateAsDateTime = DateTime.fromISO(date).toISO();
    this.setState({ endsOnDate: dateAsDateTime });
  }

  getCombinedStartDateTime = () => {
    const { rawStartDate, rawStartTime } = this.state;
    return getCombinedDateTime(rawStartDate, rawStartTime);
  }

  getCombinedEndDateTime = () => {
    const { rawStartDate, rawEndTime } = this.state;
    return getCombinedDateTime(rawStartDate, rawEndTime);
  }

  handleOnSubmit = () => {
    const { actions, personEKID } = this.props;
    const { worksitePlanEKID } = this.state;
    let { newAppointmentData } = this.state;

    const associations = [];
    const nowAsIso = DateTime.local().toISO();

    associations.push([ADDRESSES, 0, APPOINTMENT, worksitePlanEKID, WORKSITE_PLAN, {}]);
    associations.push([HAS, personEKID, PEOPLE, 0, APPOINTMENT, {}]);

    const entitySetIds :Object = this.createEntitySetIdsMap();
    const propertyTypeIds :Object = this.createPropertyTypeIdsMap();

    const entityData :{} = processEntityData(newAppointmentData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    // actions.createWorkAppointment({ associationEntityData, entityData });
  }

  render() {
    const {
      isLoading,
      onDiscard,
      worksitesByWorksitePlan,
    } = this.props;

    const WORKSITES_OPTIONS :Object[] = [];
    worksitesByWorksitePlan.forEach((worksite :Map, worksitePlanEKID :UUID) => {
      const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
      WORKSITES_OPTIONS.push({ label: worksiteName, value: worksitePlanEKID });
    });

    console.log('this.state ', this.state);

    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Work Site</Label>
            <Select
                onChange={this.handleSelectChange}
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
            <Label>Does this work appointment repeat?</Label>
          </RowContent>
        </FormRow>
        <RadioButtonsRow>
          <RowContent>
            <Label>Yes, every:</Label>
            <RadioButtonsWrapper>
              {
                repetitionOptions.map((option :Object) => (
                  <Radio
                      key={option.value}
                      label={option.label} />
                ))
              }
            </RadioButtonsWrapper>
          </RowContent>
          <RowContent>
            <Label>Or, choose all that apply:</Label>
            <RadioButtonsWrapper>
              {
                daysOfTheWeek.map((option :Object) => (
                  <Checkbox
                      key={option.value}
                      label={option.label} />
                ))
              }
            </RadioButtonsWrapper>
          </RowContent>
        </RadioButtonsRow>
        <FormRow>
          <RowContent>
            <Label>Ends on:</Label>
            <DatePicker
                onChange={this.setEndsOnDate()} />
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
  [WORKSITES_BY_WORKSITE_PLAN]: state.getIn([STATE.PERSON, WORKSITES_BY_WORKSITE_PLAN]),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    // addNewDiversionPlanStatus,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CreateWorkAppointmentForm);
