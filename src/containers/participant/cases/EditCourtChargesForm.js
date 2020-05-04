// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  List,
  Map,
  fromJS,
  getIn,
} from 'immutable';
import { DateTime } from 'luxon';
import { Button, Card, CardHeader } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AddToAvailableCourtChargesModal from '../charges/AddToAvailableCourtChargesModal';
import { courtChargeSchema, courtChargeUiSchema } from './schemas/EditCaseInfoSchemas';
import { disableChargesForm, hydrateCourtChargeSchema } from './utils/EditCaseInfoUtils';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import { requestIsPending } from '../../../utils/RequestStateUtils';
import { addCourtChargesToCase, removeCourtChargeFromCase } from '../charges/ChargesActions';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { CHARGES, SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;

const {
  APPEARS_IN,
  CHARGE_EVENT,
  COURT_CHARGE_LIST,
  MANUAL_CHARGED_WITH,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  REGISTERED_FOR,
} = APP_TYPE_FQNS;
const { DATETIME_COMPLETED, ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ADD_COURT_CHARGES_TO_CASE } = CHARGES;

const InnerCardHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

type Props = {
  actions:{
    addCourtChargesToCase :RequestSequence;
    removeCourtChargeFromCase :RequestSequence;
  },
  charges :List;
  chargesForCase :List;
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  participant :Map;
  personCase :Map;
  propertyTypeIds :Object;
  requestStates:{
    ADD_COURT_CHARGES_TO_CASE :RequestState;
  };
};

type State = {
  chargesFormData :Object;
  chargesFormSchema :Object;
  chargesFormUiSchema :Object;
  chargesPrepopulated :boolean;
  isAvailableChargesModalVisible :boolean;
};

class EditCourtChargesForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      chargesFormData: {},
      chargesFormSchema: courtChargeSchema,
      chargesFormUiSchema: courtChargeUiSchema,
      chargesPrepopulated: false,
      isAvailableChargesModalVisible: false,
    };
  }

  componentDidMount() {
    this.prepopulateFormData();
  }

  componentDidUpdate(prevProps :Props) {
    const { charges, chargesForCase, personCase } = this.props;
    if (!prevProps.chargesForCase.equals(chargesForCase)
      || !prevProps.charges.equals(charges)
      || !prevProps.personCase.equals(personCase)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const {
      charges,
      chargesForCase,
      personCase,
    } = this.props;

    const sectionOneKey = getPageSectionKey(1, 1);
    let chargesPrepopulated :boolean = !chargesForCase.isEmpty();
    let newChargeUiSchema :Object = courtChargeUiSchema;

    if (personCase.isEmpty()) {
      chargesPrepopulated = true;
      newChargeUiSchema = disableChargesForm(courtChargeUiSchema);
    }

    let chargesFormData :{} = {};
    let newChargeSchema :Object = courtChargeSchema;
    if (!chargesForCase.isEmpty()) {
      chargesFormData = {
        [sectionOneKey]: []
      };
      chargesForCase.forEach((chargeMap :Map, index :number) => {
        const chargeEKID :UUID = chargeMap.getIn([COURT_CHARGE_LIST, ENTITY_KEY_ID, 0]);
        const datetimeCharged :string = chargeMap.getIn([CHARGE_EVENT, DATETIME_COMPLETED, 0]);
        const dateCharged :string = DateTime.fromISO(datetimeCharged).toISODate();
        chargesFormData[sectionOneKey][index] = {};
        chargesFormData[sectionOneKey][index][getEntityAddressKey(-1, COURT_CHARGE_LIST, ENTITY_KEY_ID)] = chargeEKID;
        chargesFormData[sectionOneKey][index][getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)] = dateCharged;
      });
    }
    newChargeSchema = hydrateCourtChargeSchema(courtChargeSchema, charges);


    this.setState({
      chargesFormData,
      chargesFormSchema: newChargeSchema,
      chargesFormUiSchema: newChargeUiSchema,
      chargesPrepopulated,
    });
  }

  handleOnChargesSubmit = () => {
    const {
      actions,
      entitySetIds,
      participant,
      personCase,
      propertyTypeIds,
    } = this.props;
    const { chargesFormData } = this.state;

    const storedChargeData :[] = getIn(chargesFormData, [getPageSectionKey(1, 1)]);
    const chargeKey = getEntityAddressKey(-1, COURT_CHARGE_LIST, ENTITY_KEY_ID);
    const chargeEventKey = getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED);
    const newChargesList :Object[] = storedChargeData.map((charge :{}) => {
      const chargeName = charge[chargeKey];
      const date :UUID = charge[chargeEventKey];
      const currentTime = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);
      const datetime = getCombinedDateTime(date, currentTime);
      return {
        [chargeKey]: chargeName,
        [chargeEventKey]: datetime
      };
    });
    chargesFormData[getPageSectionKey(1, 1)] = newChargesList;

    const entityData :{} = processEntityData(chargesFormData, entitySetIds, propertyTypeIds);
    const associations = [];

    const personEKID = getEntityKeyId(participant);
    const caseEKID = getEntityKeyId(personCase);
    const courtChargeListESID :UUID = entitySetIds.get(COURT_CHARGE_LIST);
    const olEKID :UUID = propertyTypeIds.get(ENTITY_KEY_ID);

    fromJS(entityData).get(courtChargeListESID).forEach((courtCharge :Map, index :number) => {
      const courtChargeEKID :UUID = courtCharge.getIn([olEKID, 0]);
      associations.push([APPEARS_IN, courtChargeEKID, COURT_CHARGE_LIST, caseEKID, MANUAL_PRETRIAL_COURT_CASES]);
      associations.push([REGISTERED_FOR, index, CHARGE_EVENT, courtChargeEKID, COURT_CHARGE_LIST]);
      associations.push([MANUAL_CHARGED_WITH, personEKID, PEOPLE, courtChargeEKID, COURT_CHARGE_LIST]);
      associations.push([MANUAL_CHARGED_WITH, personEKID, PEOPLE, index, CHARGE_EVENT]);
    });

    const associationEntityData :{} = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    delete entityData[courtChargeListESID];

    actions.addCourtChargesToCase({ associationEntityData, entityData });
  }

  handleOnChangeCharges = ({ formData } :Object) => {
    this.setState({ chargesFormData: formData });
  }

  handleShowModal = () => {
    this.setState({ isAvailableChargesModalVisible: true });
  }

  handleHideModal = () => {
    this.setState({ isAvailableChargesModalVisible: false });
  }

  render() {
    const {
      actions,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
      requestStates,
    } = this.props;
    const {
      chargesFormData,
      chargesFormSchema,
      chargesFormUiSchema,
      chargesPrepopulated,
      isAvailableChargesModalVisible,
    } = this.state;

    const chargesFormContext = {
      addActions: {
        addCharge: actions.addCourtChargesToCase
      },
      deleteAction: actions.removeCourtChargeFromCase,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };

    const courtChargesSubmitting :boolean = requestIsPending(requestStates[ADD_COURT_CHARGES_TO_CASE]);
    // console.log('courtChargesSubmitting: ', courtChargesSubmitting);
    return (
      <>
        <Card>
          <CardHeader mode="primary" padding="sm">
            <InnerCardHeader>
              <div>Edit Court Charges</div>
              <Button mode="secondary" onClick={this.handleShowModal}>Add to Available Court Charges</Button>
            </InnerCardHeader>
          </CardHeader>
          <Form
              disabled={chargesPrepopulated || courtChargesSubmitting}
              formContext={chargesFormContext}
              formData={chargesFormData}
              isSubmitting={courtChargesSubmitting}
              onChange={this.handleOnChangeCharges}
              onSubmit={this.handleOnChargesSubmit}
              schema={chargesFormSchema}
              uiSchema={chargesFormUiSchema} />
        </Card>
        <AddToAvailableCourtChargesModal
            isOpen={isAvailableChargesModalVisible}
            onClose={this.handleHideModal} />
      </>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const charges = state.get(STATE.CHARGES);
  return {
    requestStates: {
      [ADD_COURT_CHARGES_TO_CASE]: charges.getIn([ACTIONS, ADD_COURT_CHARGES_TO_CASE, REQUEST_STATE])
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addCourtChargesToCase,
    removeCourtChargeFromCase,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditCourtChargesForm);
