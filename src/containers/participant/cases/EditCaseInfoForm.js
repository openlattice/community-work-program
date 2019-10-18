// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { CardStack } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import AssignJudgeForm from './AssignJudgeForm';
import EditCaseForm from './EditCaseForm';
import EditChargesForm from './EditChargesForm';
import EditRequiredHoursForm from './EditRequiredHoursForm';
import LogoLoader from '../../../components/LogoLoader';

import { getInfoForEditCase } from '../ParticipantActions';
import { goToRoute } from '../../../core/router/RoutingActions';
import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  DATETIME_COMPLETED,
  DIVERSION_PLAN_FQNS,
  ENTITY_KEY_ID,
} from '../../../core/edm/constants/FullyQualifiedNames';
import {
  getEntityKeyId,
  getEntitySetIdFromApp,
  getPropertyTypeIdFromEdm
} from '../../../utils/DataUtils';
import { BackNavButton } from '../../../components/controls/index';
import { PARTICIPANT_PROFILE_WIDTH } from '../../../core/style/Sizes';
import { APP, PERSON, STATE } from '../../../utils/constants/ReduxStateConsts';
import * as Routes from '../../../core/router/Routes';

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

type Props = {
  actions:{
    getInfoForEditCase :RequestSequence;
    goToRoute :RequestSequence;
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

class EditCaseInfoForm extends Component<Props> {

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
      match: {
        params: { subjectId: personEKID }
      },
    } = this.props;
    if (!prevProps.app.get(PEOPLE) && app.get(PEOPLE) && personEKID) {
      actions.getInfoForEditCase({ personEKID });
    }
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

  handleOnClickBackButton = () => {
    const {
      actions,
      match: {
        params: { subjectId: personEKID }
      },
    } = this.props;
    actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':subjectId', personEKID));
  }

  render() {
    const {
      charges,
      chargesForCase,
      diversionPlan,
      getInfoForEditCaseRequestState,
      initializeAppRequestState,
      judge,
      judges,
      participant,
      personCase,
    } = this.props;

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

    return (
      <FormWrapper>
        <ButtonWrapper>
          <BackNavButton
              onClick={this.handleOnClickBackButton}>
            Back to Profile
          </BackNavButton>
        </ButtonWrapper>
        <CardStack>
          <AssignJudgeForm
              diversionPlan={diversionPlan}
              entityIndexToIdMap={entityIndexToIdMap}
              entitySetIds={entitySetIds}
              judge={judge}
              judges={judges}
              personCase={personCase}
              propertyTypeIds={propertyTypeIds} />
          <EditCaseForm
              entityIndexToIdMap={entityIndexToIdMap}
              entitySetIds={entitySetIds}
              personCase={personCase}
              propertyTypeIds={propertyTypeIds} />
          <EditChargesForm
              charges={charges}
              chargesForCase={chargesForCase}
              entityIndexToIdMap={entityIndexToIdMap}
              entitySetIds={entitySetIds}
              participant={participant}
              personCase={personCase}
              propertyTypeIds={propertyTypeIds} />
          <EditRequiredHoursForm
              diversionPlan={diversionPlan}
              entityIndexToIdMap={entityIndexToIdMap}
              entitySetIds={entitySetIds}
              propertyTypeIds={propertyTypeIds} />
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
    getInfoForEditCase,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditCaseInfoForm);
