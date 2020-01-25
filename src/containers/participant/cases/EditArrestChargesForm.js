// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  List,
  Map,
  fromJS,
  get,
  getIn,
  setIn,
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

import AddToAvailableArrestChargesModal from '../charges/AddToAvailableArrestChargesModal';

import { addArrestCharges } from '../charges/ChargesActions';
import { arrestChargeSchema, arrestChargeUiSchema } from './schemas/EditCaseInfoSchemas';
import { disableChargesForm, hydrateArrestChargeSchema } from './utils/EditCaseInfoUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  INDEX_MAPPERS,
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;
const {
  APPEARS_IN,
  APPEARS_IN_ARREST,
  CHARGE_EVENT,
  ARREST_CHARGE_LIST,
  MANUAL_ARREST_CASES,
  MANUAL_ARREST_CHARGES,
  MANUAL_CHARGED_WITH,
  PEOPLE,
  REGISTERED_FOR,
  RELATED_TO,
  DIVERSION_PLAN,
} = APP_TYPE_FQNS;
const { DATETIME, DATETIME_COMPLETED, ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const getDateChargedFromChargeEvent = (chargeEvent :Map) :string => {
  const { [DATETIME_COMPLETED]: dateTimeCharged } = getEntityProperties(chargeEvent, [DATETIME_COMPLETED]);
  const dateCharged :string = DateTime.fromISO(dateTimeCharged).toISODate();
  return dateCharged;
};

const InnerCardHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

type Props = {
  actions:{
    addArrestCharges :RequestSequence;
  },
  arrestCaseEKIDByArrestChargeEKIDFromPSA :Map;
  arrestChargeMapsCreatedInCWP :List;
  arrestChargeMapsCreatedInPSA :List;
  arrestCharges :List;
  arrestChargesFromPSA :List;
  cwpArrestCaseByArrestCharge :Map;
  diversionPlanEKID :UUID;
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  participant :Map;
  propertyTypeIds :Object;
  psaArrestCaseByArrestCharge :Map;
};

type State = {
  chargesFormData :Object;
  chargesFormSchema :Object;
  chargesPrepopulated :boolean;
  isAvailableChargesModalVisible :boolean;
};

class EditCourtChargesForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      chargesFormData: {},
      chargesFormSchema: arrestChargeSchema,
      chargesPrepopulated: false,
      isAvailableChargesModalVisible: false,
    };
  }

  componentDidMount() {
    this.prepopulateFormData();
  }

  componentDidUpdate(prevProps :Props) {
    const {
      arrestCharges,
      arrestChargesFromPSA,
      arrestChargeMapsCreatedInCWP,
      arrestChargeMapsCreatedInPSA,
    } = this.props;
    if (!prevProps.arrestCharges.equals(arrestCharges)
      || !prevProps.arrestChargesFromPSA.equals(arrestChargesFromPSA)
      || !prevProps.arrestChargeMapsCreatedInCWP.equals(arrestChargeMapsCreatedInCWP)
      || !prevProps.arrestChargeMapsCreatedInPSA.equals(arrestChargeMapsCreatedInPSA)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const {
      arrestCharges,
      arrestChargesFromPSA,
      arrestChargeMapsCreatedInCWP,
      arrestChargeMapsCreatedInPSA,
    } = this.props;

    let chargesPrepopulated = false;
    const sectionOneKey :string = getPageSectionKey(1, 1);
    let chargesFormData :Object = {};
    let newChargeSchema :Object = arrestChargeSchema;

    if (!arrestChargeMapsCreatedInPSA.isEmpty()) {
      chargesPrepopulated = true;
      chargesFormData = {
        [sectionOneKey]: []
      };
      arrestChargeMapsCreatedInPSA.forEach((chargeMap :Map, index :number) => {
        const chargeEvent :Map = chargeMap.get(CHARGE_EVENT, Map());
        const dateCharged :string = getDateChargedFromChargeEvent(chargeEvent);
        const chargeEKID :UUID = getEntityKeyId(chargeMap.get(MANUAL_ARREST_CHARGES, Map()));
        chargesFormData[sectionOneKey][index] = {};
        chargesFormData[sectionOneKey][index][
          getEntityAddressKey(-1, MANUAL_ARREST_CHARGES, ENTITY_KEY_ID)
        ] = chargeEKID;
        chargesFormData[sectionOneKey][index][getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)] = dateCharged;
      });
    }

    const sectionTwoKey :string = getPageSectionKey(1, 2);
    if (!arrestChargeMapsCreatedInCWP.isEmpty()) {
      chargesPrepopulated = true;
      chargesFormData = {
        [sectionTwoKey]: []
      };
      arrestChargeMapsCreatedInCWP.forEach((chargeMap :Map, index :number) => {
        const chargeEvent :Map = chargeMap.get(CHARGE_EVENT, Map());
        const dateCharged :string = getDateChargedFromChargeEvent(chargeEvent);
        const chargeEKID :UUID = getEntityKeyId(chargeMap.get(ARREST_CHARGE_LIST, Map()));
        chargesFormData[sectionTwoKey][index] = {};
        chargesFormData[sectionTwoKey][index][getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID)] = chargeEKID;
        chargesFormData[sectionTwoKey][index][getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)] = dateCharged;
      });
    }

    newChargeSchema = hydrateArrestChargeSchema(arrestChargeSchema, arrestChargesFromPSA, arrestCharges);


    this.setState({
      chargesFormData,
      chargesFormSchema: newChargeSchema,
      chargesPrepopulated,
    });
  }

  onSubmit = () => {
    const {
      arrestCaseEKIDByArrestChargeEKIDFromPSA,
      actions,
      diversionPlanEKID,
      entitySetIds,
      participant,
      propertyTypeIds,
    } = this.props;
    const { chargesFormData } = this.state;

    const currentTime = DateTime.local().toLocaleString(DateTime.TIME_24_SIMPLE);
    const personEKID :UUID = getEntityKeyId(participant);

    const entities :Object = {
      [getPageSectionKey(1, 1)]: [],
      [getPageSectionKey(1, 2)]: [],
      [getPageSectionKey(1, 3)]: {},
    };
    const associations :Array<Array<*>> = [];

    const existingChargesFromPSA :Object[] = get(chargesFormData, getPageSectionKey(1, 1));
    if (existingChargesFromPSA.length && Object.values(existingChargesFromPSA[0]).length) {
      existingChargesFromPSA.forEach((charge :Object, index :number) => {
        const chargeEventToSubmit :Object = {};
        const existingArrestChargeEKID :UUID = charge[
          getEntityAddressKey(-1, MANUAL_ARREST_CHARGES, ENTITY_KEY_ID)
        ];
        associations.push([REGISTERED_FOR, index, CHARGE_EVENT, existingArrestChargeEKID, MANUAL_ARREST_CHARGES]);
        associations.push([MANUAL_CHARGED_WITH, personEKID, PEOPLE, index, CHARGE_EVENT]);

        const arrestCaseEKID :UUID = arrestCaseEKIDByArrestChargeEKIDFromPSA.get(existingArrestChargeEKID, '');
        associations.push([RELATED_TO, diversionPlanEKID, DIVERSION_PLAN, arrestCaseEKID, MANUAL_ARREST_CASES]);

        const dateTimeCharged :string = getCombinedDateTime(
          charge[getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)],
          currentTime
        );
        chargeEventToSubmit[getEntityAddressKey(index, CHARGE_EVENT, DATETIME_COMPLETED)] = dateTimeCharged;
        entities[getPageSectionKey(1, 1)].push(chargeEventToSubmit);
      });
    }

    const newArrestCharges :Object[] = get(chargesFormData, getPageSectionKey(1, 2));
    if (newArrestCharges.length && Object.values(newArrestCharges[0]).length) {
      newArrestCharges.forEach((charge :Object, index :number) => {
        const chargeEventToSubmit :Object = charge;
        const arrestChargeEKID :UUID = chargeEventToSubmit[
          getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID)
        ];
        const dateTimeCharged :string = getCombinedDateTime(
          charge[getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)],
          currentTime
        );
        entities[getPageSectionKey(1, 3)][getEntityAddressKey(index, MANUAL_ARREST_CASES, DATETIME)] = dateTimeCharged;

        associations.push([
          REGISTERED_FOR,
          index + existingChargesFromPSA.length,
          CHARGE_EVENT,
          arrestChargeEKID,
          ARREST_CHARGE_LIST
        ]);
        associations.push([APPEARS_IN, arrestChargeEKID, ARREST_CHARGE_LIST, index, MANUAL_ARREST_CASES]);
        associations.push([APPEARS_IN_ARREST, personEKID, PEOPLE, index, MANUAL_ARREST_CASES]);
        associations.push([MANUAL_CHARGED_WITH, personEKID, PEOPLE, arrestChargeEKID, ARREST_CHARGE_LIST]);
        associations.push([
          MANUAL_CHARGED_WITH,
          personEKID, PEOPLE,
          index + existingChargesFromPSA.length,
          CHARGE_EVENT
        ]);
        associations.push([RELATED_TO, diversionPlanEKID, DIVERSION_PLAN, index, MANUAL_ARREST_CASES]);

        delete chargeEventToSubmit[getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID)];
        chargeEventToSubmit[getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)] = dateTimeCharged;
        entities[getPageSectionKey(1, 2)].push(chargeEventToSubmit);
      });
    }

    const entityMappers :Map = Map().withMutations((mappers :Map) => {
      const indexMappers = Map().withMutations((map :Map) => {
        map.set(
          getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED),
          (i) => i + entities[getPageSectionKey(1, 1)].length
        );
      });
      mappers.set(INDEX_MAPPERS, indexMappers);
    });

    const entityData :{} = processEntityData(entities, entitySetIds, propertyTypeIds, entityMappers);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);
    console.log('entityData: ', entityData);
    console.log('associationEntityData: ', associationEntityData);

    actions.addArrestCharges({ associationEntityData, entityData });
  }

  onChange = ({ formData } :Object) => {
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
        addCharge: () => {}
      },
      deleteAction: () => {},
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };

    return (
      <>
        <Card>
          <CardHeader mode="primary" padding="sm">
            <InnerCardHeader>
              <div>Edit Arrest Charges</div>
              <Button mode="secondary" onClick={this.handleShowModal}>Add to Available Arrest Charges</Button>
            </InnerCardHeader>
          </CardHeader>
          <Form
              disabled={chargesPrepopulated}
              formContext={chargesFormContext}
              formData={chargesFormData}
              onChange={this.onChange}
              onSubmit={this.onSubmit}
              schema={chargesFormSchema}
              uiSchema={arrestChargeUiSchema} />
        </Card>
        <AddToAvailableArrestChargesModal
            isOpen={isAvailableChargesModalVisible}
            onClose={this.handleHideModal} />
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addArrestCharges,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(EditCourtChargesForm);
