// @flow
import React, { Component } from 'react';
import { fromJS, List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  Input,
  Label,
  Select,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import type { FQN } from 'lattice';

import { addWorksitePlan } from '../ParticipantActions';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../../utils/DataUtils';
import {
  APP_TYPE_FQNS,
  ENROLLMENT_STATUS_FQNS,
  WORKSITE_PLAN_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
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
  ENROLLMENT_STATUS,
  RELATED_TO,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { EFFECTIVE_DATE, STATUS } = ENROLLMENT_STATUS_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;

type Props = {
  actions:{
    addWorksitePlan :RequestSequence;
  };
  app :Map;
  edm :Map;
  isLoading :boolean;
  onDiscard :() => void;
  worksitePlan :Map;
  worksitePlanStatus :Map;
};

type State = {
  hoursWorked :string;
  newStatus :string;
  requiredHours :string;
};

class EditWorksitePlanForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      hoursWorked: '',
      newStatus: '',
      requiredHours: '',
    };
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    const valueAsFloat = parseFloat(value);
    this.setState({ [name]: valueAsFloat });
  }

  handleSelectChange = (valueObj :Object) => {
    const { value } = valueObj;
    this.setState({ newStatus: value });
  }

  handleOnSubmit = () => {
    const {
      actions,
      app,
      edm,
      worksitePlan,
    } = this.props;
    const { hoursWorked, newStatus, requiredHours } = this.state;

    const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
    const nowAsIso = DateTime.local().toISO();

    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const hoursWorkedPTID :UUID = getPropertyTypeIdFromEdm(edm, HOURS_WORKED);
    const requiredHoursPTID :UUID = getPropertyTypeIdFromEdm(edm, REQUIRED_HOURS);

    const worksitePlanDataToEdit :{} = {
      [worksitePlanESID]: {
        [worksitePlanEKID]: {
          [hoursWorkedPTID]: [hoursWorked],
          [requiredHoursPTID]: [requiredHours],
        }
      }
    };

    if (newStatus) {

      const newStatusData = fromJS({
        [getPageSectionKey(1, 1)]: {
          [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: newStatus,
          [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: nowAsIso,
        },
      });
      const associations = [];
      associations.push([RELATED_TO, worksitePlanEKID, WORKSITE_PLAN, 0, ENROLLMENT_STATUS, {}]);

      const entitySetIds :Object = {
        [ENROLLMENT_STATUS]: getEntitySetIdFromApp(app, ENROLLMENT_STATUS),
        [RELATED_TO]: getEntitySetIdFromApp(app, RELATED_TO),
        [WORKSITE_PLAN]: getEntitySetIdFromApp(app, WORKSITE_PLAN),
      };
      const propertyTypeIds :Object = {
        [EFFECTIVE_DATE]: getPropertyTypeIdFromEdm(edm, EFFECTIVE_DATE),
        [STATUS]: getPropertyTypeIdFromEdm(edm, STATUS),
      };

      const entityData :{} = processEntityData(newStatusData, entitySetIds, propertyTypeIds);
      const associationEntityData :{} = processAssociationEntityData(
        fromJS(associations),
        entitySetIds,
        propertyTypeIds
      );
      // actions.addWorkSitePlanStatus({ associationEntityData, entityData });
    }

    // actions.editWorksitePlan({ entityData: worksitePlanDataToEdit });
  }

  render() {
    const { isLoading, onDiscard, worksitePlanStatus } = this.props;

    const { [STATUS]: currentStatus } = getEntityProperties(worksitePlanStatus, [STATUS]);

    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Hours worked at site</Label>
            <Input
                name="hoursWorked"
                onChange={this.handleInputChange}
                type="text" />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Required hours at site</Label>
            <Input
                name={getEntityAddressKey(0, WORKSITE_PLAN, REQUIRED_HOURS)}
                onChange={this.handleInputChange}
                type="text" />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Current status</Label>
            <Select
                name="requiredHours"
                onChange={this.handleSelectChange}
                options={[]}
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
  edm: state.get(STATE.EDM),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addWorksitePlan,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditWorksitePlanForm);
