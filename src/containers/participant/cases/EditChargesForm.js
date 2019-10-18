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
import {
  Button,
  Card,
  CardHeader,
} from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import AddToAvailableChargesModal from '../charges/AddToAvailableChargesModal';

import {
  addChargesToCase,
  removeChargeFromCase,
} from '../ParticipantActions';
import {
  APP_TYPE_FQNS,
  DATETIME_COMPLETED,
  ENTITY_KEY_ID,
} from '../../../core/edm/constants/FullyQualifiedNames';
import {
  chargeSchema,
  chargeUiSchema,
} from '../schemas/EditCaseInfoSchemas';
import { hydrateChargeSchema } from '../utils/EditCaseInfoUtils';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';

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

const InnerCardHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

type Props = {
  actions:{
    addChargesToCase :RequestSequence;
    removeChargeFromCase :RequestSequence;
  },
  charges :List;
  chargesForCase :List;
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  participant :Map;
  personCase :Map;
  propertyTypeIds :Object;
};

type State = {
  chargesFormData :Object;
  chargesFormSchema :Object;
  chargesPrepopulated :boolean;
  isAvailableChargesModalVisible :boolean;
};

class EditChargesForm extends Component<Props, State> {

  state = {
    chargesFormData: {},
    chargesFormSchema: chargeSchema,
    chargesPrepopulated: false,
    isAvailableChargesModalVisible: false,
  };

  componentDidMount() {
    this.prepopulateFormData();
  }

  componentDidUpdate(prevProps :Props) {
    const { charges, chargesForCase } = this.props;
    if (!prevProps.chargesForCase.equals(chargesForCase)
      || !prevProps.charges.equals(charges)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const {
      charges,
      chargesForCase,
    } = this.props;

    const sectionOneKey = getPageSectionKey(1, 1);
    const chargesPrepopulated = !chargesForCase.isEmpty();
    let chargesFormData :{} = {};
    if (chargesPrepopulated) {
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
    const newChargeSchema = hydrateChargeSchema(chargeSchema, charges);

    this.setState({
      chargesFormData,
      chargesFormSchema: newChargeSchema,
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
    const courtChargeListESID :UUID = entitySetIds[COURT_CHARGE_LIST];
    const olEKID :UUID = propertyTypeIds[ENTITY_KEY_ID];

    fromJS(entityData).get(courtChargeListESID).forEach((courtCharge :Map, index :number) => {
      const courtChargeEKID :UUID = courtCharge.getIn([olEKID, 0]);
      associations.push([APPEARS_IN, courtChargeEKID, COURT_CHARGE_LIST, caseEKID, MANUAL_PRETRIAL_COURT_CASES]);
      associations.push([REGISTERED_FOR, index, CHARGE_EVENT, courtChargeEKID, COURT_CHARGE_LIST]);
      associations.push([MANUAL_CHARGED_WITH, personEKID, PEOPLE, courtChargeEKID, COURT_CHARGE_LIST]);
      associations.push([MANUAL_CHARGED_WITH, personEKID, PEOPLE, index, CHARGE_EVENT]);
    });

    const associationEntityData :{} = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    delete entityData[courtChargeListESID];

    actions.addChargesToCase({ associationEntityData, entityData });
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
    } = this.props;
    const {
      chargesFormData,
      chargesFormSchema,
      chargesPrepopulated,
      isAvailableChargesModalVisible,
    } = this.state;

    const chargesFormContext = {
      addActions: {
        addCharge: actions.addChargesToCase
      },
      deleteAction: actions.removeChargeFromCase,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };


    return (
      <>
        <Card>
          <CardHeader padding="sm">
            <InnerCardHeader>
              <div>Edit Charges in Case</div>
              <Button onClick={this.handleShowModal}>Add to Available Charges</Button>
            </InnerCardHeader>
          </CardHeader>
          <Form
              disabled={chargesPrepopulated}
              formContext={chargesFormContext}
              formData={chargesFormData}
              onChange={this.handleOnChangeCharges}
              onSubmit={this.handleOnChargesSubmit}
              schema={chargesFormSchema}
              uiSchema={chargeUiSchema} />
        </Card>
        <AddToAvailableChargesModal
            isOpen={isAvailableChargesModalVisible}
            onClose={this.handleHideModal} />
      </>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addChargesToCase,
    removeChargeFromCase,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(EditChargesForm);