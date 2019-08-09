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
  worksites :List;
};

type State = {
  newAppointmentData :Map;
};

class CreateWorkAppointmentForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      newAppointmentData: fromJS({
        [getPageSectionKey(1, 1)]: {},
      }),
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

  handleSelectChange = (option :Object, event :Object) => {
    const { newAppointmentData } = this.state;
    const { name } = event;
    const { value } = option;
    this.setState({ newAppointmentData: newAppointmentData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleOnSubmit = () => {
    const { actions, personEKID } = this.props;
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
      worksites,
    } = this.props;

    const WORKSITES_OPTIONS :Object[] = [];
    worksites.forEach((worksite :Map) => {
      const worksiteEKID :UUID = getEntityKeyId(worksite);
      const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
      WORKSITES_OPTIONS.push({ label: worksiteName, value: worksiteEKID });
    });

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
            <DatePicker />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Start time</Label>
            <TimePicker />
          </RowContent>
          <RowContent>
            <Label>End time</Label>
            <TimePicker />
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
            <DatePicker />
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
    // addNewDiversionPlanStatus,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CreateWorkAppointmentForm);
