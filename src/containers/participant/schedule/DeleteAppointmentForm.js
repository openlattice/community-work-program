// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  Label,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

// import { addNewDiversionPlanStatus } from '../ParticipantActions';
import { getEntityKeyId, getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../../utils/DataUtils';
import {
  APP_TYPE_FQNS,
  ENROLLMENT_STATUS_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';
import { OL } from '../../../core/style/Colors';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;
const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  RELATED_TO,
} = APP_TYPE_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;

const ColoredText = styled.div`
  color: ${OL.PURPLE02};
`;

type Props = {
  actions:{
    addNewDiversionPlanStatus :RequestSequence;
  };
  app :Map;
  appointment :Object;
  diversionPlan :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
};

type State = {
  newEnrollmentData :Map;
};

class DeleteAppointmentForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      newEnrollmentData: fromJS({
        [getPageSectionKey(1, 1)]: {},
      }),
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
      [EFFECTIVE_DATE]: getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE),
      [STATUS]: getPropertyTypeIdFromEdm(edm, STATUS),
    };
  }

  handleSelectChange = (option :Object, event :Object) => {
    const { newEnrollmentData } = this.state;
    const { name } = event;
    const { value } = option;
    this.setState({ newEnrollmentData: newEnrollmentData.setIn([getPageSectionKey(1, 1), name], value) });
  }

  handleOnSubmit = () => {
    const { actions, diversionPlan } = this.props;
    let { newEnrollmentData } = this.state;

    const associations = [];
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    const nowAsIso = DateTime.local().toISO();

    newEnrollmentData = newEnrollmentData
      .setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)], nowAsIso);

    associations.push([RELATED_TO, 0, ENROLLMENT_STATUS, diversionPlanEKID, DIVERSION_PLAN, {}]);
    const entitySetIds :Object = this.createEntitySetIdsMap();
    const propertyTypeIds :Object = this.createPropertyTypeIdsMap();

    const entityData :{} = processEntityData(newEnrollmentData, entitySetIds, propertyTypeIds);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    // actions.addNewDiversionPlanStatus({ associationEntityData, entityData });
  }

  render() {
    const {
      appointment,
      isLoading,
      onDiscard,
    } = this.props;
    const {
      date,
      hours,
      weekday,
      worksiteName,
    } = appointment;
    const appointmentText :string = `${weekday} ${date}, ${hours} at ${worksiteName}`;
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Are you sure you want to delete this appointment?</Label>
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <ColoredText>{ appointmentText }</ColoredText>
          </RowContent>
        </FormRow>
        <ButtonsRow>
          <Button onClick={onDiscard}>No</Button>
          <Button
              isLoading={isLoading}
              mode="primary"
              onClick={this.handleOnSubmit}>
            Yes
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
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    // addNewDiversionPlanStatus,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DeleteAppointmentForm);
