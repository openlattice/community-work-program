// @flow
import React, { Component } from 'react';
import { fromJS, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  DatePicker,
  Label,
  TimePicker,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import type { FQN } from 'lattice';

// import { addNewDiversionPlanStatus } from './ParticipantActions';
import { getEntityKeyId, getEntitySetIdFromApp, getPropertyTypeIdFromEdm } from '../../utils/DataUtils';
import { getCombinedDateTime } from '../../utils/ScheduleUtils';
import { STATUS_FILTER_OPTIONS } from '../participants/ParticipantsConstants';
import {
  APP_TYPE_FQNS,
  DIVERSION_PLAN_FQNS,
  ENROLLMENT_STATUS_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
import { CWP } from '../../core/edm/constants/DataModelConsts';
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
  processEntityData,
  processEntityDataForPartialReplace,
} = DataProcessingUtils;
const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  MANUAL_SENTENCED_WITH,
  PEOPLE,
  RELATED_TO,
} = APP_TYPE_FQNS;
const {
  COMPLETED,
  NAME,
  ORIENTATION_DATETIME,
} = DIVERSION_PLAN_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;

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
  orientationDate :string;
  orientationTime :string;
};

class AddOrientationDateForm extends Component<Props, State> {

  state = {
    orientationDate: '',
    orientationTime: '',
  };

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [DIVERSION_PLAN]: getEntitySetIdFromApp(app, DIVERSION_PLAN),
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [ORIENTATION_DATETIME]: getPropertyTypeIdFromEdm(edm, ORIENTATION_DATETIME),
    };
  }

  setDate = () => (date :string) => {
    this.setState({ orientationDate: date });
  }

  setTime = () => (time :string) => {
    this.setState({ orientationTime: time });
  }

  handleOnSubmit = () => {
    const { diversionPlan } = this.props;
    const { orientationDate, orientationTime } = this.state;

    const time = orientationTime ? orientationTime : '';
    const orientationDateTime :string = getCombinedDateTime(orientationDate, time);

    const entitySetIds :{} = this.createEntitySetIdsMap();
    const propertyTypeIds :{} = this.createPropertyTypeIdsMap();

    if (diversionPlan.isEmpty()) {

      const newDiversionPlan :Map = fromJS({
        [getPageSectionKey(1, 1)]: {
          [getEntityAddressKey(0, DIVERSION_PLAN, NAME)]: CWP,
          [getEntityAddressKey(0, DIVERSION_PLAN, COMPLETED)]: false,
          [getEntityAddressKey(0, DIVERSION_PLAN, ORIENTATION_DATETIME)]: orientationDateTime,
        }
      });

      const associations = [];
      associations.push([MANUAL_SENTENCED_WITH, 0, PEOPLE, 0, DIVERSION_PLAN, {}]);
      associations.push([RELATED_TO, 0, DIVERSION_PLAN, 0, ENROLLMENT_STATUS, {}]);

      const entityData :{} = processEntityData(newDiversionPlan, entitySetIds, propertyTypeIds);
      const associationEntityData :{} = processAssociationEntityData(
        fromJS(associations),
        entitySetIds,
        propertyTypeIds
      );

      // submit new diversion plan
    }
    else {

      const newPropertyForDiversionPlan :Map = fromJS({
        [getPageSectionKey(1, 1)]: {
          [getEntityAddressKey(0, DIVERSION_PLAN, ORIENTATION_DATETIME)]: orientationDateTime,
        }
      });
      console.log('newPropertyForDiversionPlan: ', newPropertyForDiversionPlan);
      const diversionPlanTransformed :Map = diversionPlan
        .mapKeys((property :FQN) => getEntityAddressKey(0, DIVERSION_PLAN, property))
        .toJS();
      console.log('diversionPlanTransformed: ', diversionPlanTransformed);

      const dataToSubmit = processEntityDataForPartialReplace({
        newPropertyForDiversionPlan,
        diversionPlanTransformed,
        entitySetIds,
        propertyTypeIds,
      });
      console.log('dataToSubmit ', dataToSubmit);
      // // submit update to diversion plan
    }

    // const associations = [];
    // const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    // const nowAsIso = DateTime.local().toISO();
    //
    // newDiversionPlanData = newDiversionPlanData
    //   .setIn([getPageSectionKey(1, 1), getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)], nowAsIso);
    //
    // associations.push([RELATED_TO, diversionPlanEKID, DIVERSION_PLAN, 0, ENROLLMENT_STATUS, {}]);
    // const entitySetIds :Object = this.createEntitySetIdsMap();
    // const propertyTypeIds :Object = this.createPropertyTypeIdsMap();
    //
    // const entityData :{} = processEntityData(newDiversionPlanData, entitySetIds, propertyTypeIds);
    // const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);
    //
    // actions.addNewDiversionPlanStatus({ associationEntityData, entityData });
  }

  render() {
    const {
      currentStatus,
      isLoading,
      onDiscard,
      personName
    } = this.props;
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Date</Label>
            <DatePicker
                onChange={this.setDate()} />
          </RowContent>
          <RowContent>
            <Label>Time</Label>
            <TimePicker
                onChange={this.setTime()} />
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
  diversionPlan: state.getIn([STATE.PERSON, PERSON.DIVERSION_PLAN], Map()),
  edm: state.get(STATE.EDM),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    // addNewDiversionPlanStatus,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddOrientationDateForm);
