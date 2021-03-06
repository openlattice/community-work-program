// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Card, CardHeader, CardStack } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { editEnrollmentDates, getDiversionPlan } from './ParticipantActions';
import { schema, uiSchema } from './schemas/EditEnrollmentDatesSchemas';

import LogoLoader from '../../components/LogoLoader';
import * as Routes from '../../core/router/Routes';
import { BackNavButton } from '../../components/controls/index';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../core/router/RoutingActions';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import {
  APP,
  EDM,
  PERSON,
  STATE
} from '../../utils/constants/ReduxStateConsts';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const { DIVERSION_PLAN } = APP_TYPE_FQNS;
const {
  CHECK_IN_DATETIME,
  CHECK_IN_DEADLINE,
  DATETIME_END,
  DATETIME_RECEIVED,
  ORIENTATION_DATETIME,
} = PROPERTY_TYPE_FQNS;

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const {
  ACTIONS,
  GET_DIVERSION_PLAN,
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
    editEnrollmentDates :RequestSequence;
    getDiversionPlan :RequestSequence;
    goToRoute :GoToRoute;
  },
  diversionPlan :Map;
  entitySetIds :Map;
  getDiversionPlanRequestState :RequestState;
  initializeAppRequestState :RequestState;
  match :Match;
  propertyTypeIds :Map;
};

type State = {
  formData :Object;
};

class EditCaseInfoForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {},
    };
  }

  componentDidMount() {
    const {
      actions,
      entitySetIds,
      match: {
        params: { diversionPlanId: diversionPlanEKID }
      },
    } = this.props;
    if (entitySetIds.has(DIVERSION_PLAN) && diversionPlanEKID) {
      actions.getDiversionPlan({ diversionPlanEKID });
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      entitySetIds,
      diversionPlan,
      getDiversionPlanRequestState,
      match: {
        params: { diversionPlanId: diversionPlanEKID }
      },
    } = this.props;
    if ((!prevProps.entitySetIds.has(DIVERSION_PLAN) && entitySetIds.has(DIVERSION_PLAN)) && diversionPlanEKID) {
      actions.getDiversionPlan({ diversionPlanEKID });
    }
    if ((prevProps.getDiversionPlanRequestState === RequestStates.PENDING
      && getDiversionPlanRequestState !== RequestStates.PENDING)
      || !prevProps.diversionPlan.equals(diversionPlan)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const { diversionPlan } = this.props;

    const sectionOneKey = getPageSectionKey(1, 1);
    const formData :{} = {};

    const {
      [CHECK_IN_DATETIME]: checkInDateTime,
      [CHECK_IN_DEADLINE]: checkInDeadline,
      [DATETIME_END]: sentenceEndDate,
      [DATETIME_RECEIVED]: sentenceDate,
      [ORIENTATION_DATETIME]: orientationDateTime,
    } = getEntityProperties(
      diversionPlan,
      [CHECK_IN_DATETIME, CHECK_IN_DEADLINE, DATETIME_END, DATETIME_RECEIVED, ORIENTATION_DATETIME]
    );
    formData[sectionOneKey] = {};
    if (checkInDateTime) {
      formData[sectionOneKey][getEntityAddressKey(
        0, DIVERSION_PLAN, CHECK_IN_DATETIME
      )] = DateTime.fromISO(checkInDateTime).toISODate();
    }
    if (checkInDeadline) {
      formData[sectionOneKey][getEntityAddressKey(
        0, DIVERSION_PLAN, CHECK_IN_DEADLINE
      )] = DateTime.fromISO(checkInDeadline).toISODate();
    }
    if (orientationDateTime) {
      formData[sectionOneKey][getEntityAddressKey(
        0, DIVERSION_PLAN, ORIENTATION_DATETIME
      )] = DateTime.fromISO(orientationDateTime).toISODate();
    }
    if (sentenceDate) {
      formData[sectionOneKey][getEntityAddressKey(
        0, DIVERSION_PLAN, DATETIME_RECEIVED
      )] = DateTime.fromISO(sentenceDate).toISODate();
    }
    if (sentenceEndDate) {
      formData[sectionOneKey][getEntityAddressKey(
        0, DIVERSION_PLAN, DATETIME_END
      )] = DateTime.fromISO(sentenceEndDate).toISODate();
    }

    this.setState({ formData });
  }

  createEntityIndexToIdMap = () => {
    const { diversionPlan } = this.props;

    const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
      map.setIn([DIVERSION_PLAN, 0], getEntityKeyId(diversionPlan));
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
      actions,
      entitySetIds,
      getDiversionPlanRequestState,
      initializeAppRequestState,
      propertyTypeIds,
    } = this.props;
    const { formData } = this.state;

    if (initializeAppRequestState === RequestStates.PENDING
      || getDiversionPlanRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const entityIndexToIdMap = this.createEntityIndexToIdMap();

    const formContext = {
      editAction: actions.editEnrollmentDates,
      entityIndexToIdMap,
      entitySetIds,
      propertyTypeIds,
    };

    return (
      <FormWrapper>
        <ButtonWrapper>
          <BackNavButton
              onClick={this.handleOnClickBackButton}>
            Back to Profile
          </BackNavButton>
        </ButtonWrapper>
        <CardStack>
          <Card>
            <CardHeader padding="sm">Edit Enrollment Dates</CardHeader>
            <Form
                disabled
                formContext={formContext}
                formData={formData}
                schema={schema}
                uiSchema={uiSchema} />
          </Card>
        </CardStack>
      </FormWrapper>
    );
  }
}

const mapStateToProps = (state :Map) => {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const person = state.get(STATE.PERSON);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    [PERSON.DIVERSION_PLAN]: person.get(PERSON.DIVERSION_PLAN),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    getDiversionPlanRequestState: person.getIn([ACTIONS, GET_DIVERSION_PLAN, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    editEnrollmentDates,
    getDiversionPlan,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditCaseInfoForm);
