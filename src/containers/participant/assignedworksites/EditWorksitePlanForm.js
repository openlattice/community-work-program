/*
 * @flow
 */

import React, { Component } from 'react';

import { Map, fromJS } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  Button,
  Input,
  Label,
  Select,
} from 'lattice-ui-kit';
import { DataUtils } from 'lattice-utils';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';
import type { RequestSequence } from 'redux-reqseq';

import { editWorksitePlan } from './WorksitePlanActions';

import {
  ButtonsRow,
  FormRow,
  FormWrapper,
  RowContent
} from '../../../components/Layout';
import { WORKSITE_ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { isDefined } from '../../../utils/LangUtils';
import { APP, EDM, STATE } from '../../../utils/constants/ReduxStateConsts';

const { getEntityKeyId, getPropertyValue } = DataUtils;
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
const { EFFECTIVE_DATE, REQUIRED_HOURS, STATUS } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;

const STATUS_OPTIONS :Object[] = Object.values(WORKSITE_ENROLLMENT_STATUSES)
  .map((statusName) => ({ label: statusName, value: statusName }));

type Props = {
  actions:{
    editWorksitePlan :RequestSequence;
  };
  entitySetIds :Map;
  propertyTypeIds :Map;
  isLoading :boolean;
  onDiscard :() => void;
  worksitePlan :Map;
  worksitePlanStatus :string;
};

type State = {
  newStatus :string;
  requiredHours :number | null;
};

class EditWorksitePlanForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      newStatus: '',
      requiredHours: null,
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
      entitySetIds,
      propertyTypeIds,
      worksitePlan,
    } = this.props;
    const { newStatus, requiredHours } = this.state;

    const worksitePlanEKID :?UUID = getEntityKeyId(worksitePlan);
    const nowAsIso = DateTime.local().toISO();

    const worksitePlanESID :UUID = entitySetIds.get(WORKSITE_PLAN);
    const requiredHoursPTID :UUID = propertyTypeIds.get(REQUIRED_HOURS);

    let statusEntityData = {};
    let statusAssociationData = {};
    const worksitePlanDataToEdit = {
      [worksitePlanESID]: {}
    };

    if (isDefined(worksitePlanEKID)) {
      worksitePlanDataToEdit[worksitePlanESID][worksitePlanEKID] = {};
    }

    if (isDefined(requiredHours) && isDefined(worksitePlanEKID)) {
      worksitePlanDataToEdit[worksitePlanESID][worksitePlanEKID][requiredHoursPTID] = [requiredHours];
    }

    if (newStatus) {

      const newStatusData = fromJS({
        [getPageSectionKey(1, 1)]: {
          [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: newStatus,
          [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: nowAsIso,
        },
      });
      const associations = [];
      associations.push([RELATED_TO, worksitePlanEKID, WORKSITE_PLAN, 0, ENROLLMENT_STATUS, {}]);

      statusEntityData = processEntityData(newStatusData, entitySetIds, propertyTypeIds);
      statusAssociationData = processAssociationEntityData(
        fromJS(associations),
        entitySetIds,
        propertyTypeIds
      );
    }

    actions.editWorksitePlan({
      statusEntityData,
      statusAssociationData,
      worksitePlanEKID,
      worksitePlanDataToEdit
    });
  }

  render() {
    const {
      isLoading,
      onDiscard,
      worksitePlan,
      worksitePlanStatus
    } = this.props;
    const requiredHours :number = getPropertyValue(worksitePlan, [REQUIRED_HOURS, 0]);
    return (
      <FormWrapper>
        <FormRow>
          <RowContent>
            <Label>Required hours at site</Label>
            <Input
                defaultValue={requiredHours}
                name="requiredHours"
                onChange={this.handleInputChange}
                type="text" />
          </RowContent>
        </FormRow>
        <FormRow>
          <RowContent>
            <Label>Current status</Label>
            <Select
                name="newStatus"
                onChange={this.handleSelectChange}
                options={STATUS_OPTIONS}
                placeholder={worksitePlanStatus} />
          </RowContent>
        </FormRow>
        <ButtonsRow>
          <Button onClick={onDiscard}>Discard</Button>
          <Button
              color="primary"
              isLoading={isLoading}
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
  return ({
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editWorksitePlan,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditWorksitePlanForm);
