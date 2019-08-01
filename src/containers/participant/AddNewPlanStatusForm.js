// @flow
import React, { Component } from 'react';
import { fromJS, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  Label,
  Select
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { addNewDiversionPlanStatus } from './ParticipantActions';
import { getEntityKeyId, getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../utils/DataUtils';
import { STATUS_FILTER_OPTIONS } from '../participants/ParticipantsConstants';
import {
  APP_TYPE_FQNS,
  ENROLLMENT_STATUS_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
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
  RELATED_TO,
} = APP_TYPE_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;

const ENROLLMENT_STATUS_OPTIONS :Object[] = STATUS_FILTER_OPTIONS
  .slice(1)
  .map((status :Object) => {
    return { label: status.label, value: status.value };
  });

type Props = {
  actions:{
    addNewDiversionPlanStatus :RequestSequence;
  };
  app :Map;
  currentStatus :string;
  diversionPlan :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
  personName :string;
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

  handleSelectChange = (option :Object, e :Object) => {
    const { newEnrollmentData } = this.state;
    const { name } = e;
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

    associations.push([RELATED_TO, diversionPlanEKID, DIVERSION_PLAN, 0, ENROLLMENT_STATUS, {}]);
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
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addNewDiversionPlanStatus,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddNewPlanStatusForm);
