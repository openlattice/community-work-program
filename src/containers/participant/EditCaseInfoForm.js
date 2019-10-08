// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, List, Map } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardHeader, CardStack } from 'lattice-ui-kit';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import LogoLoader from '../../components/LogoLoader';

import {
  editPersonCase,
  editRequiredHours,
  getInfoForEditCase,
} from './ParticipantActions';
import { goToRoute } from '../../core/router/RoutingActions';
import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  CHARGE_FQNS,
  DIVERSION_PLAN_FQNS,
  ENTITY_KEY_ID,
  PEOPLE_FQNS,
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
import { hydrateJudgeSchema } from './utils/EditCaseInfoUtils';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../utils/DataUtils';
import { BackNavButton } from '../../components/controls/index';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { APP, PERSON, STATE } from '../../utils/constants/ReduxStateConsts';
import * as Routes from '../../core/router/Routes';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;

const { DIVERSION_PLAN, MANUAL_PRETRIAL_COURT_CASES, PEOPLE } = APP_TYPE_FQNS;
const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;
const { REQUIRED_HOURS } = DIVERSION_PLAN_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;

const {
  ACTIONS,
  CHARGES_BY_CHARGE_EVENT_EKID,
  CHARGE_EVENTS,
  GET_INFO_FOR_EDIT_CASE,
  JUDGE,
  JUDGES,
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

type Props = {
  actions:{
    editPersonCase :RequestSequence;
    editRequiredHours :RequestSequence;
    getInfoForEditCase :RequestSequence;
    goToRoute :RequestSequence;
  },
  app :Map;
  chargeEvents :List;
  chargesByChargeEventEKID :Map;
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
  chargeFormData :Object;
  chargePrepopulated :boolean;
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
    chargeFormData: {},
    chargePrepopulated: false,
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
      diversionPlan,
      getInfoForEditCaseRequestState,
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
      || !prevProps.personCase.equals(personCase)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const {
      chargeEvents,
      chargesByChargeEventEKID,
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
          [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, COURT_CASE_TYPE)]: [courtCaseType],
          [getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)]: [caseNumbers],
        }
      }
      : {};

    const { [REQUIRED_HOURS]: requiredHours } = getEntityProperties(diversionPlan, [REQUIRED_HOURS]);
    const requiredHoursPrepopulated = !!requiredHours;
    const requiredHoursFormData :{} = requiredHoursPrepopulated
      ? {
        [sectionOneKey]: {
          [getEntityAddressKey(0, DIVERSION_PLAN, REQUIRED_HOURS)]: [requiredHours]
        }
      }
      : {};

    const newJudgeSchema = hydrateJudgeSchema(judgeSchema, judges);

    this.setState({
      caseFormData,
      casePrepopulated,
      judgeFormData,
      judgeFormSchema: newJudgeSchema,
      judgePrepopulated,
      requiredHoursFormData,
      requiredHoursPrepopulated,
    });
  }

  createEntityIndexToIdMap = () => {
    const { diversionPlan, personCase } = this.props;

    const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
      map.setIn([DIVERSION_PLAN, 0], getEntityKeyId(diversionPlan));
      map.setIn([MANUAL_PRETRIAL_COURT_CASES, 0], getEntityKeyId(personCase));
    });
    return entityIndexToIdMap;
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [DIVERSION_PLAN]: getEntitySetIdFromApp(app, DIVERSION_PLAN),
      [JUDGES]: getEntitySetIdFromApp(app, JUDGES),
      [MANUAL_PRETRIAL_COURT_CASES]: getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES),
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [CASE_NUMBER_TEXT]: getPropertyTypeIdFromEdm(edm, CASE_NUMBER_TEXT),
      [COURT_CASE_TYPE]: getPropertyTypeIdFromEdm(edm, COURT_CASE_TYPE),
      [REQUIRED_HOURS]: getPropertyTypeIdFromEdm(edm, REQUIRED_HOURS),
    };
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
      chargeFormData,
      chargePrepopulated,
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

    const caseFormContext = {
      editAction: actions.editPersonCase,
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
                formContext={{}}
                formData={judgeFormData}
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
            <CardHeader padding="sm">Edit Charges</CardHeader>
            <Form
                disabled={chargePrepopulated}
                formContext={{}}
                formData={chargeFormData}
                schema={chargeSchema}
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
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const person = state.get(STATE.PERSON);
  return ({
    app,
    [CHARGES_BY_CHARGE_EVENT_EKID]: person.get(CHARGES_BY_CHARGE_EVENT_EKID),
    [CHARGE_EVENTS]: person.get(CHARGE_EVENTS),
    [PERSON.DIVERSION_PLAN]: person.get(PERSON.DIVERSION_PLAN),
    edm: state.get(STATE.EDM),
    getInfoForEditCaseRequestState: person.getIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [JUDGE]: person.get(JUDGE),
    [JUDGES]: person.get(JUDGES),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PERSON_CASE]: person.get(PERSON_CASE),
  });
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    editPersonCase,
    editRequiredHours,
    getInfoForEditCase,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditCaseInfoForm);
