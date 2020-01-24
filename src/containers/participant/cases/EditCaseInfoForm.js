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
import EditArrestChargesForm from './EditArrestChargesForm';
import EditCaseForm from './EditCaseForm';
import EditCourtChargesForm from './EditCourtChargesForm';
import EditRequiredHoursForm from './EditRequiredHoursForm';
import LogoLoader from '../../../components/LogoLoader';

import * as Routes from '../../../core/router/Routes';
import { getInfoForEditCase } from '../ParticipantActions';
import { goToRoute } from '../../../core/router/RoutingActions';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { BackNavButton } from '../../../components/controls/index';
import { PARTICIPANT_PROFILE_WIDTH } from '../../../core/style/Sizes';
import {
  APP,
  CHARGES,
  EDM,
  PERSON,
  STATE
} from '../../../utils/constants/ReduxStateConsts';
import type { GoToRoute } from '../../../core/router/RoutingActions';

const {
  CHARGE_EVENT,
  COURT_CHARGE_LIST,
  DIVERSION_PLAN,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
} = APP_TYPE_FQNS;

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const {
  ACTIONS,
  GET_INFO_FOR_EDIT_CASE,
  JUDGE,
  PARTICIPANT,
  PERSON_CASE,
  REQUEST_STATE,
} = PERSON;
const {
  ARREST_CASE_EKID_BY_ARREST_CHARGE_EKID_FROM_PSA,
  ARREST_CHARGES,
  ARREST_CHARGES_FROM_PSA,
  COURT_CHARGES,
  COURT_CHARGES_FOR_CASE
} = CHARGES;

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
    goToRoute :GoToRoute;
  };
  arrestCaseEKIDByArrestChargeEKIDFromPSA :Map;
  arrestCharges :List;
  arrestChargesFromPSA :List;
  courtChargesForCase :List;
  courtCharges :List;
  diversionPlan :Map;
  entitySetIds :Map;
  getInfoForEditCaseRequestState :RequestState;
  initializeAppRequestState :RequestState;
  judge :Map;
  judges :List;
  match :Match;
  participant :Map;
  personCase :Map;
  propertyTypeIds :Map;
};

class EditCaseInfoForm extends Component<Props> {

  componentDidMount() {
    const {
      actions,
      entitySetIds,
      match: {
        params: { participantId: personEKID }
      },
    } = this.props;
    if (entitySetIds.has(PEOPLE) && personEKID) {
      actions.getInfoForEditCase({ personEKID });
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      entitySetIds,
      match: {
        params: { participantId: personEKID }
      },
    } = this.props;
    if ((!prevProps.entitySetIds.has(PEOPLE) && entitySetIds.has(PEOPLE)) && personEKID) {
      actions.getInfoForEditCase({ personEKID });
    }
  }

  createEntityIndexToIdMap = () => {
    const { courtChargesForCase, diversionPlan, personCase } = this.props;

    const chargeEKIDs :UUID[] = [];
    const chargeEventEKIDs :UUID[] = [];
    courtChargesForCase.forEach((chargeMap :Map) => {
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

  handleOnClickBackButton = () => {
    const {
      actions,
      match: {
        params: { participantId: personEKID }
      },
    } = this.props;
    if (personEKID) {
      actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':participantId', personEKID));
    }
  }

  render() {
    const {
      arrestCaseEKIDByArrestChargeEKIDFromPSA,
      arrestCharges,
      arrestChargesFromPSA,
      courtCharges,
      courtChargesForCase,
      diversionPlan,
      entitySetIds,
      getInfoForEditCaseRequestState,
      initializeAppRequestState,
      judge,
      judges,
      participant,
      personCase,
      propertyTypeIds,
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
    const personEKID :UUID = getEntityKeyId(participant);
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);

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
              diversionPlanEKID={diversionPlanEKID}
              entityIndexToIdMap={entityIndexToIdMap}
              entitySetIds={entitySetIds}
              personCase={personCase}
              personEKID={personEKID}
              propertyTypeIds={propertyTypeIds} />
          <EditArrestChargesForm
              arrestCaseEKIDByArrestChargeEKIDFromPSA={arrestCaseEKIDByArrestChargeEKIDFromPSA}
              arrestChargesFromPSA={arrestChargesFromPSA}
              arrestCharges={arrestCharges}
              chargesForCase={courtChargesForCase}
              entityIndexToIdMap={entityIndexToIdMap}
              entitySetIds={entitySetIds}
              participant={participant}
              personCase={personCase}
              propertyTypeIds={propertyTypeIds} />
          <EditCourtChargesForm
              charges={courtCharges}
              chargesForCase={courtChargesForCase}
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
  const charges = state.get(STATE.CHARGES);
  const edm = state.get(STATE.EDM);
  const person = state.get(STATE.PERSON);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    [ARREST_CASE_EKID_BY_ARREST_CHARGE_EKID_FROM_PSA]: charges.get(ARREST_CASE_EKID_BY_ARREST_CHARGE_EKID_FROM_PSA),
    [ARREST_CHARGES]: charges.get(ARREST_CHARGES),
    [ARREST_CHARGES_FROM_PSA]: charges.get(ARREST_CHARGES_FROM_PSA),
    [COURT_CHARGES]: charges.get(COURT_CHARGES),
    [COURT_CHARGES_FOR_CASE]: charges.get(COURT_CHARGES_FOR_CASE),
    [JUDGE]: person.get(JUDGE),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PERSON.DIVERSION_PLAN]: person.get(PERSON.DIVERSION_PLAN),
    [PERSON.JUDGES]: person.get(PERSON.JUDGES),
    [PERSON_CASE]: person.get(PERSON_CASE),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    getInfoForEditCaseRequestState: person.getIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getInfoForEditCase,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditCaseInfoForm);
