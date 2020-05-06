// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  List,
  Map,
  fromJS,
  get,
  has,
} from 'immutable';
import { DateTime } from 'luxon';
import {
  Button,
  Card,
  CardHeader,
  CardSegment,
  Spinner,
} from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AddToAvailableArrestChargesModal from '../charges/AddToAvailableArrestChargesModal';
import ErrorMessage from '../../../components/error/ErrorMessage';

import { addArrestCharges, removeArrestCharge } from '../charges/ChargesActions';
import { arrestChargeSchema, arrestChargeUiSchema } from './schemas/EditCaseInfoSchemas';
import { hydrateArrestChargeSchema, temporarilyDisableForm } from './utils/EditCaseInfoUtils';
import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import {
  formatExistingChargeDataAndAssociation,
  formatNewArrestChargeDataAndAssociations,
} from '../charges/utils/ChargesUtils';
import { requestIsFailure, requestIsPending } from '../../../utils/RequestStateUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { CHARGES, SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';

const {
  INDEX_MAPPERS,
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;
const {
  CHARGE_EVENT,
  ARREST_CHARGE_LIST,
  MANUAL_ARREST_CASES,
  MANUAL_ARREST_CHARGES,
  PEOPLE,
  DIVERSION_PLAN,
} = APP_TYPE_FQNS;
const { DATETIME_COMPLETED, ENTITY_KEY_ID, NOTES } = PROPERTY_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ADD_ARREST_CHARGES, REMOVE_ARREST_CHARGE } = CHARGES;

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
    removeArrestCharge :RequestSequence;
  },
  arrestCaseByArrestChargeEKIDFromPSA :Map;
  arrestChargeMapsCreatedInCWP :List;
  arrestChargeMapsCreatedInPSA :List;
  arrestCharges :List;
  arrestChargesFromPSA :List;
  cwpArrestCaseByArrestCharge :Map;
  diversionPlanEKID :UUID;
  entityIndexToIdMap :Map;
  entitySetIds :Map;
  participant :Map;
  propertyTypeIds :Object;
  psaArrestCaseByArrestCharge :Map;
  requestStates:{
    ADD_ARREST_CHARGES :RequestState;
    REMOVE_ARREST_CHARGE :RequestState;
  };
};

type State = {
  chargesFormData :Object;
  chargesFormSchema :Object;
  chargesPrepopulated :boolean;
  isAvailableChargesModalVisible :boolean;
  isFirstTimeSubmission :boolean;
};

class EditArrestChargesForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      chargesFormData: {},
      chargesFormSchema: arrestChargeSchema,
      chargesPrepopulated: false,
      isAvailableChargesModalVisible: false,
      isFirstTimeSubmission: false,
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
    const chargesFormData :Object = {};
    let newChargeSchema :Object = arrestChargeSchema;

    if (!arrestChargeMapsCreatedInPSA.isEmpty()) {
      chargesPrepopulated = true;
      chargesFormData[sectionOneKey] = [];
      arrestChargeMapsCreatedInPSA.forEach((chargeMap :Map, index :number) => {
        const chargeEvent :Map = chargeMap.get(CHARGE_EVENT, Map());
        const dateCharged :string = getDateChargedFromChargeEvent(chargeEvent);
        const notes :string = chargeEvent.getIn([NOTES, 0]);
        const chargeEKID :UUID = getEntityKeyId(chargeMap.get(MANUAL_ARREST_CHARGES, Map()));
        chargesFormData[sectionOneKey][index] = {
          [getEntityAddressKey(-1, MANUAL_ARREST_CHARGES, ENTITY_KEY_ID)]: chargeEKID,
          [getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)]: dateCharged,
          [getEntityAddressKey(-1, CHARGE_EVENT, NOTES)]: notes
        };
      });
    }

    const sectionTwoKey :string = getPageSectionKey(1, 2);
    if (!arrestChargeMapsCreatedInCWP.isEmpty()) {
      chargesPrepopulated = true;
      chargesFormData[sectionTwoKey] = [];
      arrestChargeMapsCreatedInCWP.forEach((chargeMap :Map, index :number) => {
        const chargeEvent :Map = chargeMap.get(CHARGE_EVENT, Map());
        const dateCharged :string = getDateChargedFromChargeEvent(chargeEvent);
        const notes :string = chargeEvent.getIn([NOTES, 0]);
        const chargeEKID :UUID = getEntityKeyId(chargeMap.get(ARREST_CHARGE_LIST, Map()));
        chargesFormData[sectionTwoKey][index] = {
          [getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID)]: chargeEKID,
          [getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)]: dateCharged,
          [getEntityAddressKey(-1, CHARGE_EVENT, NOTES)]: notes
        };
      });
    }

    newChargeSchema = hydrateArrestChargeSchema(arrestChargeSchema, arrestChargesFromPSA, arrestCharges);

    this.setState({
      chargesFormData,
      chargesFormSchema: newChargeSchema,
      chargesPrepopulated,
      isFirstTimeSubmission: !chargesFormData[sectionOneKey] && !chargesFormData[sectionTwoKey]
    });
  }

  onSubmit = () => {
    const {
      arrestCaseByArrestChargeEKIDFromPSA,
      actions,
      diversionPlanEKID,
      entitySetIds,
      participant,
      propertyTypeIds,
      cwpArrestCaseByArrestCharge,
      psaArrestCaseByArrestCharge,
    } = this.props;
    const { chargesFormData } = this.state;
    const personEKID :UUID = getEntityKeyId(participant);

    const entities :Object = {
      [getPageSectionKey(1, 1)]: [],
      [getPageSectionKey(1, 2)]: [],
      [getPageSectionKey(1, 3)]: {},
    };
    let associations :Array<Array<*>> = [];

    const existingChargesFromPSA :Object[] = get(chargesFormData, getPageSectionKey(1, 1), []);
    const { psaChargeEntities, psaChargeAssociations } = formatExistingChargeDataAndAssociation(
      existingChargesFromPSA,
      { personIndexOrEKID: personEKID, diversionPlanIndexOrEKID: diversionPlanEKID },
      psaArrestCaseByArrestCharge,
      arrestCaseByArrestChargeEKIDFromPSA
    );
    entities[getPageSectionKey(1, 1)] = psaChargeEntities;
    associations = associations.concat(psaChargeAssociations);

    const newArrestCharges :Object[] = get(chargesFormData, getPageSectionKey(1, 2), []);
    const { newChargeEntities, newChargeAssociations } = formatNewArrestChargeDataAndAssociations(
      newArrestCharges,
      existingChargesFromPSA.length,
      { personIndexOrEKID: personEKID, diversionPlanIndexOrEKID: diversionPlanEKID },
      cwpArrestCaseByArrestCharge
    );
    entities[getPageSectionKey(1, 2)] = newChargeEntities;
    associations = associations.concat(newChargeAssociations);

    const entityMappers :Map = Map().withMutations((mappers :Map) => {
      const indexMappers = Map().withMutations((map :Map) => {
        map.set(
          getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED),
          (i) => i + entities[getPageSectionKey(1, 1)].length
        );
        map.set(
          getEntityAddressKey(-1, CHARGE_EVENT, NOTES),
          (i) => i + entities[getPageSectionKey(1, 1)].length
        );
      });
      mappers.set(INDEX_MAPPERS, indexMappers);
    });
    const entityData :{} = processEntityData(entities, entitySetIds, propertyTypeIds, entityMappers);
    const associationEntityData :{} = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);
    actions.addArrestCharges({ associationEntityData, entityData });
  }

  onDelete = (dataToDelete :Object) => {
    const {
      actions,
      arrestChargeMapsCreatedInCWP,
      arrestChargeMapsCreatedInPSA,
      cwpArrestCaseByArrestCharge,
      diversionPlanEKID,
      entitySetIds,
      participant,
    } = this.props;
    const { formData } = dataToDelete;
    const arrestCaseESID :UUID = entitySetIds.get(MANUAL_ARREST_CASES, '');
    const chargeEventESID :UUID = entitySetIds.get(CHARGE_EVENT, '');
    const peopleESID :UUID = entitySetIds.get(PEOPLE, '');
    const cwpArrestChargeESID :UUID = entitySetIds.get(ARREST_CHARGE_LIST, '');
    const diversionPlanESID :UUID = entitySetIds.get(DIVERSION_PLAN, '');
    const entitiesToDelete :Object[] = [];
    let associationToDelete :Object = {};

    const cwpArrestChargeKey :string = getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID);
    const cwpArrestChargeEKID :UUID = get(formData, cwpArrestChargeKey, '');
    const psaArrestChargeKey :string = getEntityAddressKey(-1, MANUAL_ARREST_CHARGES, ENTITY_KEY_ID);
    const psaArrestChargeEKID :UUID = get(formData, psaArrestChargeKey, '');

    if (cwpArrestChargeEKID.length || psaArrestChargeEKID.length) {
      if (has(formData, cwpArrestChargeKey)) {
        // delete the charge event (which will delete the link to the arrest charge and person)
        const relevantChargeMap :Map = arrestChargeMapsCreatedInCWP
          .find((chargeMap :Map) => getEntityKeyId(chargeMap.get(ARREST_CHARGE_LIST)) === cwpArrestChargeEKID);
        const chargeEventEKID :UUID = getEntityKeyId(relevantChargeMap.get(CHARGE_EVENT));
        entitiesToDelete.push({ entitySetId: chargeEventESID, entityKeyId: chargeEventEKID });
        // delete the arrest case (which will delete the link to the person, diversion plan, and arrest charge)
        const arrestCaseEKID :UUID = cwpArrestCaseByArrestCharge.get(cwpArrestChargeEKID, '');
        entitiesToDelete.push({ entitySetId: arrestCaseESID, entityKeyId: arrestCaseEKID });
        // delete the association between person and arrest charge
        const personEKID :UUID = getEntityKeyId(participant);
        associationToDelete = {
          dstESID: cwpArrestChargeESID,
          srcEKID: personEKID,
          srcESID: peopleESID,
        };
      }
      if (has(formData, psaArrestChargeKey)) {
        // delete the charge event (which will delete the link to arrest charge and person)
        const relevantChargeMap :Map = arrestChargeMapsCreatedInPSA
          .find((chargeMap :Map) => getEntityKeyId(chargeMap.get(MANUAL_ARREST_CHARGES)) === psaArrestChargeEKID);
        const chargeEventEKID :UUID = getEntityKeyId(relevantChargeMap.get(CHARGE_EVENT));
        entitiesToDelete.push({ entitySetId: chargeEventESID, entityKeyId: chargeEventEKID });
        // delete the association between diversion plan and arrest case
        associationToDelete = {
          dstESID: arrestCaseESID,
          srcEKID: diversionPlanEKID,
          srcESID: diversionPlanESID,
        };
      }

      const { path } = dataToDelete;
      actions.removeArrestCharge({ associationToDelete, entitiesToDelete, path });
    }
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
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
      requestStates,
    } = this.props;
    const {
      chargesFormData,
      chargesFormSchema,
      chargesPrepopulated,
      isAvailableChargesModalVisible,
      isFirstTimeSubmission,
    } = this.state;

    const chargesFormContext = {
      addActions: {
        addCharge: this.onSubmit
      },
      deleteAction: this.onDelete,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };
    const arrestChargesSubmitting :boolean = requestIsPending(requestStates[ADD_ARREST_CHARGES]);
    const arrestChargesDeleting :boolean = requestIsPending(requestStates[REMOVE_ARREST_CHARGE]);
    const failedSubmit :boolean = requestIsFailure(requestStates[ADD_ARREST_CHARGES]);
    const failedDelete :boolean = requestIsFailure(requestStates[REMOVE_ARREST_CHARGE]);
    let uiSchemaToUse = arrestChargeUiSchema;
    if (arrestChargesDeleting || arrestChargesSubmitting) {
      uiSchemaToUse = temporarilyDisableForm(arrestChargeUiSchema, [getPageSectionKey(1, 2)]);
    }
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
              isSubmitting={arrestChargesSubmitting}
              formContext={chargesFormContext}
              formData={chargesFormData}
              onChange={this.onChange}
              onSubmit={this.onSubmit}
              schema={chargesFormSchema}
              uiSchema={uiSchemaToUse} />
          { (!isFirstTimeSubmission && (arrestChargesSubmitting || arrestChargesDeleting)) && (
            <CardSegment padding="30px"><Spinner size="2x" /></CardSegment>
          )}
          { (failedDelete || failedSubmit) && <ErrorMessage padding="30px" /> }
        </Card>
        <AddToAvailableArrestChargesModal
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
      [ADD_ARREST_CHARGES]: charges.getIn([ACTIONS, ADD_ARREST_CHARGES, REQUEST_STATE]),
      [REMOVE_ARREST_CHARGE]: charges.getIn([ACTIONS, REMOVE_ARREST_CHARGE, REQUEST_STATE])
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addArrestCharges,
    removeArrestCharge,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditArrestChargesForm);
