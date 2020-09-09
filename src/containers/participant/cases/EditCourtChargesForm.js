// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import {
  List,
  Map,
  fromJS,
  get,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import {
  Button,
  Card,
  CardHeader,
  CardSegment,
  Spinner,
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { courtChargeSchema, courtChargeUiSchema } from './schemas/EditCaseInfoSchemas';
import { disableChargesForm, hydrateCourtChargeSchema, temporarilyDisableForm } from './utils/EditCaseInfoUtils';

import AddToAvailableCourtChargesModal from '../charges/AddToAvailableCourtChargesModal';
import ErrorMessage from '../../../components/error/ErrorMessage';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { requestIsFailure, requestIsPending } from '../../../utils/RequestStateUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import { CHARGES, SHARED, STATE } from '../../../utils/constants/ReduxStateConsts';
import { addCourtChargesToCase, removeCourtChargeFromCase } from '../charges/ChargesActions';

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
  DIVERSION_PLAN,
  MANUAL_CHARGED_WITH,
  MANUAL_PRETRIAL_COURT_CASES,
  RELATED_TO,
  PEOPLE,
  REGISTERED_FOR,
} = APP_TYPE_FQNS;
const { DATETIME_COMPLETED, ENTITY_KEY_ID, NOTES } = PROPERTY_TYPE_FQNS;
const { ACTIONS, REQUEST_STATE } = SHARED;
const { ADD_COURT_CHARGES_TO_CASE, REMOVE_COURT_CHARGE_FROM_CASE } = CHARGES;

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
  diversionPlanEKID :UUID;
  entityIndexToIdMap :Map;
  entitySetIds :Object;
  participant :Map;
  personCase :Map;
  propertyTypeIds :Object;
  requestStates:{
    ADD_COURT_CHARGES_TO_CASE :RequestState;
    REMOVE_COURT_CHARGE_FROM_CASE :RequestState;
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
    const { charges, chargesForCase, personCase } = this.props;

    const sectionOneKey = getPageSectionKey(1, 1);
    let chargesPrepopulated :boolean = !chargesForCase.isEmpty();
    let newChargeUiSchema :Object = courtChargeUiSchema;

    if (personCase.isEmpty()) {
      chargesPrepopulated = true;
      newChargeUiSchema = disableChargesForm(courtChargeUiSchema);
    }

    let chargesFormData :Object = {};
    let newChargeSchema :Object = courtChargeSchema;
    if (!chargesForCase.isEmpty()) {
      chargesFormData = {
        [sectionOneKey]: []
      };
      chargesForCase.forEach((chargeMap :Map, index :number) => {
        const chargeEKID :UUID = chargeMap.getIn([COURT_CHARGE_LIST, ENTITY_KEY_ID, 0]);
        const chargeEventEKID :UUID = chargeMap.getIn([CHARGE_EVENT, ENTITY_KEY_ID, 0]);
        const chargeEventNotes :UUID = chargeMap.getIn([CHARGE_EVENT, NOTES, 0]);
        const datetimeCharged :string = chargeMap.getIn([CHARGE_EVENT, DATETIME_COMPLETED, 0]);
        const dateCharged :string = DateTime.fromISO(datetimeCharged).toISODate();
        chargesFormData[sectionOneKey][index] = {};
        chargesFormData[sectionOneKey][index][getEntityAddressKey(-1, COURT_CHARGE_LIST, ENTITY_KEY_ID)] = chargeEKID;
        chargesFormData[sectionOneKey][index][getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)] = dateCharged;
        chargesFormData[sectionOneKey][index][getEntityAddressKey(-1, CHARGE_EVENT, NOTES)] = chargeEventNotes;
        chargesFormData[sectionOneKey][index][getEntityAddressKey(-1, CHARGE_EVENT, ENTITY_KEY_ID)] = chargeEventEKID;
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

  onSubmit = () => {
    const {
      actions,
      diversionPlanEKID,
      entitySetIds,
      participant,
      personCase,
      propertyTypeIds,
    } = this.props;
    const { chargesFormData } = this.state;

    const storedChargeData :[] = get(chargesFormData, getPageSectionKey(1, 1));

    const chargeKey = getEntityAddressKey(-1, COURT_CHARGE_LIST, ENTITY_KEY_ID);
    const chargeEventDateKey = getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED);
    const chargeEventNotesKey = getEntityAddressKey(-1, CHARGE_EVENT, NOTES);
    const chargeEventEKIDKey = getEntityAddressKey(-1, CHARGE_EVENT, ENTITY_KEY_ID);
    const newChargesList :Object[] = storedChargeData
      .filter((charge :Object) => !charge[chargeEventEKIDKey])
      .map((charge :Object) => {
        const chargeName = charge[chargeKey];
        const date :UUID = charge[chargeEventDateKey];
        const now :DateTime = DateTime.local();
        const currentTime = now.toLocaleString(DateTime.TIME_24_SIMPLE);
        let datetime :string = '';
        if (isDefined(date)) datetime = getCombinedDateTime(date, currentTime);
        else datetime = now.toISO();
        return {
          [chargeKey]: chargeName,
          [chargeEventDateKey]: datetime,
          [chargeEventNotesKey]: charge[chargeEventNotesKey]
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
      associations.push([APPEARS_IN, index, CHARGE_EVENT, caseEKID, MANUAL_PRETRIAL_COURT_CASES]);
      associations.push([APPEARS_IN, courtChargeEKID, COURT_CHARGE_LIST, caseEKID, MANUAL_PRETRIAL_COURT_CASES]);
      associations.push([REGISTERED_FOR, index, CHARGE_EVENT, courtChargeEKID, COURT_CHARGE_LIST]);
      associations.push([MANUAL_CHARGED_WITH, personEKID, PEOPLE, courtChargeEKID, COURT_CHARGE_LIST]);
      associations.push([MANUAL_CHARGED_WITH, personEKID, PEOPLE, index, CHARGE_EVENT]);
      associations.push([RELATED_TO, diversionPlanEKID, DIVERSION_PLAN, index, CHARGE_EVENT]);
    });

    const associationEntityData :{} = processAssociationEntityData(associations, entitySetIds, propertyTypeIds);
    delete entityData[courtChargeListESID];

    actions.addCourtChargesToCase({ associationEntityData, entityData });
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
        addCharge: this.onSubmit
      },
      deleteAction: actions.removeCourtChargeFromCase,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };

    const courtChargesSubmitting :boolean = requestIsPending(requestStates[ADD_COURT_CHARGES_TO_CASE]);
    const courtChargesDeleting :boolean = requestIsPending(requestStates[REMOVE_COURT_CHARGE_FROM_CASE]);
    const failedSubmit :boolean = requestIsFailure(requestStates[ADD_COURT_CHARGES_TO_CASE]);
    const failedDelete :boolean = requestIsFailure(requestStates[REMOVE_COURT_CHARGE_FROM_CASE]);
    let uiSchemaToUse = chargesFormUiSchema;
    if (courtChargesSubmitting || courtChargesDeleting) {
      uiSchemaToUse = temporarilyDisableForm(chargesFormUiSchema, [getPageSectionKey(1, 1)]);
    }
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
              onChange={this.onChange}
              onSubmit={this.onSubmit}
              schema={chargesFormSchema}
              uiSchema={uiSchemaToUse} />
          { (courtChargesSubmitting || courtChargesDeleting) && (
            <CardSegment padding="30px"><Spinner size="2x" /></CardSegment>
          )}
          { (failedDelete || failedSubmit) && <ErrorMessage padding="30px" /> }
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
      [ADD_COURT_CHARGES_TO_CASE]: charges.getIn([ACTIONS, ADD_COURT_CHARGES_TO_CASE, REQUEST_STATE]),
      [REMOVE_COURT_CHARGE_FROM_CASE]: charges.getIn([ACTIONS, REMOVE_COURT_CHARGE_FROM_CASE, REQUEST_STATE])
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
