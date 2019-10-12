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
  CardStack
} from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import AddToAvailableChargesModal from './charges/AddToAvailableChargesModal';
import LogoLoader from '../../components/LogoLoader';

import {
  addChargesToCase,
  editPersonCase,
  editRequiredHours,
  getInfoForEditCase,
  reassignJudge,
  removeChargeFromCase,
} from './ParticipantActions';
import { goToRoute } from '../../core/router/RoutingActions';
import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  DATETIME_COMPLETED,
  DIVERSION_PLAN_FQNS,
  ENTITY_KEY_ID,
} from '../../core/edm/constants/FullyQualifiedNames';
import {
  caseSchema,
  caseUiSchema,
  chargeSchema,
  chargeUiSchema,
  judgeSchema,
  judgeUiSchema,
  requiredHoursSchema,
  requiredHoursUiSchema,
} from './schemas/EditCaseInfoSchemas';
import { hydrateChargeSchema, hydrateJudgeSchema } from './utils/EditCaseInfoUtils';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../utils/DataUtils';
import { getCombinedDateTime } from '../../utils/ScheduleUtils';
import { BackNavButton } from '../../components/controls/index';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { APP, PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
import * as Routes from '../../core/router/Routes';
// import { charges } from './tempcharges';

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
  JUDGES,
  MANUAL_CHARGED_WITH,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  PRESIDES_OVER,
  REGISTERED_FOR,
} = APP_TYPE_FQNS;
const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;
const { REQUIRED_HOURS } = DIVERSION_PLAN_FQNS;

const {
  ACTIONS,
  CHARGES,
  CHARGES_FOR_CASE,
  GET_INFO_FOR_EDIT_CASE,
  JUDGE,
  PARTICIPANT,
  PERSON_CASE,
  REQUEST_STATE,
} = PERSON;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  width: ${PARTICIPANT_PROFILE_WIDTH}px;
  margin-top: 30px;
  position: relative;
`;

const ButtonWrapper = styled.div`
  margin-bottom: 30px;
`;

const InnerCardHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

type Props = {
  actions:{
    addChargesToCase :RequestSequence;
    editPersonCase :RequestSequence;
    editRequiredHours :RequestSequence;
    getInfoForEditCase :RequestSequence;
    goToRoute :RequestSequence;
    reassignJudge :RequestSequence;
    removeChargeFromCase :RequestSequence;
  },
  app :Map;
  charges :List;
  chargesForCase :List;
  diversionPlan :Map;
  edm :Map;
  getInfoForEditCaseRequestState :RequestState;
  initializeAppRequestState :RequestState;
  judge :Map;
  judges :List;
  match :Match;
  participant :Map;
  personCase :Map;
};

type State = {
  caseFormData :Object;
  casePrepopulated :boolean;
  chargesFormData :Object;
  chargesFormSchema :Object;
  chargesPrepopulated :boolean;
  isAvailableChargesModalVisible :boolean;
  judgeFormData :Object;
  judgeFormSchema :Object;
  judgePrepopulated :boolean;
  requiredHoursFormData :Object;
  requiredHoursPrepopulated :boolean;
};

class EditCaseInfoForm extends Component<Props, State> {

  state = {
    caseFormData: {},
    casePrepopulated: false,
    chargesFormData: {},
    chargesFormSchema: chargeSchema,
    chargesPrepopulated: false,
    isAvailableChargesModalVisible: false,
    judgeFormData: {},
    judgeFormSchema: judgeSchema,
    judgePrepopulated: false,
    requiredHoursFormData: {},
    requiredHoursPrepopulated: false,
  };

  componentDidMount() {
    const {
      actions,
      app,
      match: {
        params: { subjectId: personEKID }
      },
    } = this.props;
    if (app.get(PEOPLE) && personEKID) {
      actions.getInfoForEditCase({ personEKID });
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      app,
      chargesForCase,
      diversionPlan,
      getInfoForEditCaseRequestState,
      judge,
      match: {
        params: { subjectId: personEKID }
      },
      personCase,
    } = this.props;
    if (!prevProps.app.get(PEOPLE) && app.get(PEOPLE) && personEKID) {
      actions.getInfoForEditCase({ personEKID });
    }
    if ((prevProps.getInfoForEditCaseRequestState === RequestStates.PENDING
      && getInfoForEditCaseRequestState !== RequestStates.PENDING)
      || !prevProps.diversionPlan.equals(diversionPlan)
      || !prevProps.personCase.equals(personCase)
      || !prevProps.judge.equals(judge)
      || !prevProps.chargesForCase.equals(chargesForCase)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const {
      charges,
      chargesForCase,
      diversionPlan,
      judge,
      judges,
      personCase,
    } = this.props;

    const sectionOneKey = getPageSectionKey(1, 1);

    const judgePrepopulated = !judge.isEmpty();
    const judgeFormData :{} = judgePrepopulated
      ? {
        [sectionOneKey]: {
          [getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)]: [getEntityKeyId(judge)],
        }
      }
      : {};

    const { [CASE_NUMBER_TEXT]: caseNumbers, [COURT_CASE_TYPE]: courtCaseType } = getEntityProperties(
      personCase, [CASE_NUMBER_TEXT, COURT_CASE_TYPE]
    );
    const casePrepopulated = !!caseNumbers || !!courtCaseType;
    const caseFormData :{} = casePrepopulated
      ? {
        [sectionOneKey]: {
          [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, COURT_CASE_TYPE)]: courtCaseType,
          [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)]: caseNumbers,
        }
      }
      : {};

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

    const { [REQUIRED_HOURS]: requiredHours } = getEntityProperties(diversionPlan, [REQUIRED_HOURS]);
    const requiredHoursPrepopulated = !!requiredHours;
    const requiredHoursFormData :{} = requiredHoursPrepopulated
      ? {
        [sectionOneKey]: {
          [getEntityAddressKey(0, DIVERSION_PLAN, REQUIRED_HOURS)]: requiredHours
        }
      }
      : {};

    const newJudgeSchema = hydrateJudgeSchema(judgeSchema, judges);
    const newChargeSchema = hydrateChargeSchema(chargeSchema, charges);

    this.setState({
      caseFormData,
      casePrepopulated,
      chargesFormData,
      chargesFormSchema: newChargeSchema,
      chargesPrepopulated,
      judgeFormData,
      judgeFormSchema: newJudgeSchema,
      judgePrepopulated,
      requiredHoursFormData,
      requiredHoursPrepopulated,
    });
  }

  createEntityIndexToIdMap = () => {
    const { chargesForCase, diversionPlan, personCase } = this.props;

    const chargeEKIDs :UUID[] = [];
    const chargeEventEKIDs :UUID[] = [];
    chargesForCase.forEach((chargeMap :Map) => {
      chargeEKIDs.push(getEntityKeyId(chargeMap.get(COURT_CHARGE_LIST)));
      chargeEventEKIDs.push(getEntityKeyId(chargeMap.get(CHARGE_EVENT)));
    });
    const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
      map.setIn([DIVERSION_PLAN, 0], getEntityKeyId(diversionPlan));
      map.setIn([MANUAL_PRETRIAL_COURT_CASES, 0], getEntityKeyId(personCase));
      map.setIn([COURT_CHARGE_LIST, -1], chargeEKIDs);
      map.setIn([CHARGE_EVENT, -1], chargeEventEKIDs);
    });
    return entityIndexToIdMap;
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [APPEARS_IN]: getEntitySetIdFromApp(app, APPEARS_IN),
      [CHARGE_EVENT]: getEntitySetIdFromApp(app, CHARGE_EVENT),
      [COURT_CHARGE_LIST]: getEntitySetIdFromApp(app, COURT_CHARGE_LIST),
      [DIVERSION_PLAN]: getEntitySetIdFromApp(app, DIVERSION_PLAN),
      [JUDGES]: getEntitySetIdFromApp(app, JUDGES),
      [MANUAL_CHARGED_WITH]: getEntitySetIdFromApp(app, MANUAL_CHARGED_WITH),
      [MANUAL_PRETRIAL_COURT_CASES]: getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES),
      [PRESIDES_OVER]: getEntitySetIdFromApp(app, PRESIDES_OVER),
      [PEOPLE]: getEntitySetIdFromApp(app, PEOPLE),
      [REGISTERED_FOR]: getEntitySetIdFromApp(app, REGISTERED_FOR),
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [CASE_NUMBER_TEXT]: getPropertyTypeIdFromEdm(edm, CASE_NUMBER_TEXT),
      [COURT_CASE_TYPE]: getPropertyTypeIdFromEdm(edm, COURT_CASE_TYPE),
      [DATETIME_COMPLETED]: getPropertyTypeIdFromEdm(edm, DATETIME_COMPLETED),
      [ENTITY_KEY_ID]: getPropertyTypeIdFromEdm(edm, ENTITY_KEY_ID),
      [REQUIRED_HOURS]: getPropertyTypeIdFromEdm(edm, REQUIRED_HOURS),
    };
  }

  handleOnJudgeSubmit = () => {
    const { actions, diversionPlan, personCase } = this.props;
    const { judgeFormData } = this.state;

    const judgeEKID = getIn(judgeFormData, [getPageSectionKey(1, 1), getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)]);
    const caseEKID = getEntityKeyId(personCase);
    const diversionPlanEKID = getEntityKeyId(diversionPlan);

    const entitySetIds :{} = this.createEntitySetIdsMap();
    const associationEntityData :{} = {
      [entitySetIds[PRESIDES_OVER]]: [
        {
          data: {},
          dst: {
            entitySetId: entitySetIds[MANUAL_PRETRIAL_COURT_CASES],
            entityKeyId: caseEKID
          },
          src: {
            entitySetId: entitySetIds[JUDGES],
            entityKeyId: judgeEKID
          }
        },
        {
          data: {},
          dst: {
            entitySetId: entitySetIds[DIVERSION_PLAN],
            entityKeyId: diversionPlanEKID
          },
          src: {
            entitySetId: entitySetIds[JUDGES],
            entityKeyId: judgeEKID
          }
        }
      ]
    };
    actions.reassignJudge({ associationEntityData, entityData: {} });
  }

  handleOnChangeJudge = ({ formData } :Object) => {
    this.setState({ judgeFormData: formData });
  }

  handleOnChargesSubmit = () => {
    const { actions, participant, personCase } = this.props;
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

    const entitySetIds :{} = this.createEntitySetIdsMap();
    const propertyTypeIds :{} = this.createPropertyTypeIdsMap();
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
      getInfoForEditCaseRequestState,
      initializeAppRequestState,
      match: {
        params: { subjectId: personEKID }
      },
    } = this.props;
    const {
      caseFormData,
      casePrepopulated,
      chargesFormData,
      chargesFormSchema,
      chargesPrepopulated,
      isAvailableChargesModalVisible,
      judgeFormData,
      judgePrepopulated,
      judgeFormSchema,
      requiredHoursFormData,
      requiredHoursPrepopulated,
    } = this.state;

    if (initializeAppRequestState === RequestStates.PENDING
      || getInfoForEditCaseRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const entityIndexToIdMap = this.createEntityIndexToIdMap();
    const entitySetIds = this.createEntitySetIdsMap();
    const propertyTypeIds = this.createPropertyTypeIdsMap();

    const judgeFormContext = {
      editAction: actions.reassignJudge,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };
    const caseFormContext = {
      editAction: actions.editPersonCase,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };
    const chargesFormContext = {
      addActions: {
        addCharge: actions.addChargesToCase
      },
      deleteAction: actions.removeChargeFromCase,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };
    const requiredHoursFormContext = {
      editAction: actions.editRequiredHours,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };


    return (
      <FormWrapper>
        <ButtonWrapper>
          <BackNavButton
              onClick={() => {
                actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':subjectId', personEKID));
              }}>
            Back to Profile
          </BackNavButton>
        </ButtonWrapper>
        <CardStack>
          <Card>
            <CardHeader padding="sm">Assign Judge</CardHeader>
            <Form
                disabled={judgePrepopulated}
                formContext={judgeFormContext}
                formData={judgeFormData}
                onChange={this.handleOnChangeJudge}
                onSubmit={this.handleOnJudgeSubmit}
                schema={judgeFormSchema}
                uiSchema={judgeUiSchema} />
          </Card>
          <Card>
            <CardHeader padding="sm">Edit Case</CardHeader>
            <Form
                disabled={casePrepopulated}
                formContext={caseFormContext}
                formData={caseFormData}
                schema={caseSchema}
                uiSchema={caseUiSchema} />
          </Card>
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
          <Card>
            <CardHeader padding="sm">Edit Required Hours</CardHeader>
            <Form
                disabled={requiredHoursPrepopulated}
                formContext={requiredHoursFormContext}
                formData={requiredHoursFormData}
                schema={requiredHoursSchema}
                uiSchema={requiredHoursUiSchema} />
          </Card>
        </CardStack>
        <AddToAvailableChargesModal
            isOpen={isAvailableChargesModalVisible}
            onClose={this.handleHideModal} />
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const person = state.get(STATE.PERSON);
  return ({
    app,
    [CHARGES]: person.get(CHARGES),
    [CHARGES_FOR_CASE]: person.get(CHARGES_FOR_CASE),
    [PERSON.DIVERSION_PLAN]: person.get(PERSON.DIVERSION_PLAN),
    edm: state.get(STATE.EDM),
    getInfoForEditCaseRequestState: person.getIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [JUDGE]: person.get(JUDGE),
    [PERSON.JUDGES]: person.get(PERSON.JUDGES),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PERSON_CASE]: person.get(PERSON_CASE),
  });
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addChargesToCase,
    editPersonCase,
    editRequiredHours,
    getInfoForEditCase,
    goToRoute,
    reassignJudge,
    removeChargeFromCase,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditCaseInfoForm);
