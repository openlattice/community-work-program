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
  editEnrollmentDates,
  getEnrollmentStatus,
} from './ParticipantActions';
import { goToRoute } from '../../core/router/RoutingActions';
import {
  APP_TYPE_FQNS,
  DATETIME_END,
  DATETIME_START,
  DIVERSION_PLAN_FQNS,
  ENTITY_KEY_ID,
} from '../../core/edm/constants/FullyQualifiedNames';
import {
  diversionPlanSchema,
  diversionPlanUiSchema,
  sentenceTermSchema,
  sentenceTermUiSchema,
} from './schemas/EditEnrollmentDatesSchemas';
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

const { DIVERSION_PLAN, PEOPLE } = APP_TYPE_FQNS;
const { CHECK_IN_DATETIME, ORIENTATION_DATETIME } = DIVERSION_PLAN_FQNS;

const {
  ACTIONS,
  GET_ENROLLMENT_STATUS,
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
    getEnrollmentStatus :RequestSequence;
    goToRoute :RequestSequence;
  },
  app :Map;
  diversionPlan :Map;
  edm :Map;
  getEnrollmentStatusRequestState :RequestState;
  initializeAppRequestState :RequestState;
  match :Match;
  sentenceTerm :Map;
};

type State = {
  diversionPlanFormData :Object;
  diversionPlanPrepopulated :boolean;
  sentenceTermFormData :Object;
  sentenceTermPrepopulated :boolean;
};

class EditCaseInfoForm extends Component<Props, State> {

  state = {
    diversionPlanFormData: {},
    diversionPlanPrepopulated: true,
    sentenceTermFormData: {},
    sentenceTermPrepopulated: false,
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
      actions.getEnrollmentStatus({ personEKID });
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      app,
      diversionPlan,
      getEnrollmentStatusRequestState,
      match: {
        params: { subjectId: personEKID }
      },
      sentenceTerm,
    } = this.props;
    if (!prevProps.app.get(PEOPLE) && app.get(PEOPLE) && personEKID) {
      actions.getEnrollmentStatus({ personEKID, populateProfile: false });
    }
    if ((prevProps.getEnrollmentStatusRequestState === RequestStates.PENDING
      && getEnrollmentStatusRequestState !== RequestStates.PENDING)
      || !prevProps.diversionPlan.equals(diversionPlan)
      || !prevProps.sentenceTerm.equals(sentenceTerm)) {
      this.prepopulateFormData();
    }
  }

  prepopulateFormData = () => {
    const {
      diversionPlan,
      sentenceTerm,
    } = this.props;

    const sectionOneKey = getPageSectionKey(1, 1);

    //   const { [DATETIME_END]: sentenceEndDate, [DATETIME_START]: sentenceDate } = getEntityProperties(
    //     sentenceTerm,
    //     [DATETIME_END, DATETIME_START]
    //   );
    const sentenceTermPrepopulated = !sentenceTerm.isEmpty(); /* CHANGE LATER */
    const sentenceTermFormData :{} = {};
    // if (sentenceTermPrepopulated) {
    //   sentenceTermFormData[sectionOneKey] = {};
    //   if (sentenceDate) {
    //     sentenceTermFormData[sectionOneKey][getEntityAddressKey(0, SENTENCE_TERM, DATETIME_START)] = [sentenceDate];
    //   }
    //   if (sentenceEndDate) {
    //     sentenceTermFormData[sectionOneKey][getEntityAddressKey(0, SENTENCE_TERM, DATETIME_END)] = [sentenceEndDate];
    //   }
    // }

    const diversionPlanFormData :{} = {};

    const { [CHECK_IN_DATETIME]: checkInDateTime, [ORIENTATION_DATETIME]: orientationDateTime } = getEntityProperties(
      diversionPlan,
      [CHECK_IN_DATETIME, ORIENTATION_DATETIME]
    );

    diversionPlanFormData[sectionOneKey] = {};
    if (checkInDateTime) {
      diversionPlanFormData[sectionOneKey][getEntityAddressKey(
        0, DIVERSION_PLAN, CHECK_IN_DATETIME
      )] = DateTime.fromISO(checkInDateTime).toISODate();
    }
    if (orientationDateTime) {
      diversionPlanFormData[sectionOneKey][getEntityAddressKey(
        0, DIVERSION_PLAN, ORIENTATION_DATETIME
      )] = DateTime.fromISO(orientationDateTime).toISODate();
    }

    this.setState({
      diversionPlanFormData,
      sentenceTermFormData,
      sentenceTermPrepopulated,
    });
  }

  createEntityIndexToIdMap = () => {
    const { diversionPlan, sentenceTerm } = this.props;

    const entityIndexToIdMap :Map = Map().withMutations((map :Map) => {
      map.setIn([DIVERSION_PLAN, 0], getEntityKeyId(diversionPlan));
      // map.setIn([MANUAL_PRETRIAL_COURT_CASES, 0], getEntityKeyId(sentenceTerm));
    });
    return entityIndexToIdMap;
  }

  createEntitySetIdsMap = () => {
    const { app } = this.props;
    return {
      [DIVERSION_PLAN]: getEntitySetIdFromApp(app, DIVERSION_PLAN),
      // [SENTENCE_TERM]: getEntitySetIdFromApp(app, SENTENCE_TERM),
    };
  }

  createPropertyTypeIdsMap = () => {
    const { edm } = this.props;
    return {
      [CHECK_IN_DATETIME]: getPropertyTypeIdFromEdm(edm, CHECK_IN_DATETIME),
      [DATETIME_END]: getPropertyTypeIdFromEdm(edm, DATETIME_END),
      [DATETIME_START]: getPropertyTypeIdFromEdm(edm, DATETIME_START),
      [ORIENTATION_DATETIME]: getPropertyTypeIdFromEdm(edm, ORIENTATION_DATETIME),
    };
  }

  render() {
    const {
      actions,
      getEnrollmentStatusRequestState,
      initializeAppRequestState,
      match: {
        params: { subjectId: personEKID }
      },
    } = this.props;
    const {
      diversionPlanFormData,
      diversionPlanPrepopulated,
      sentenceTermFormData,
      sentenceTermPrepopulated,
    } = this.state;

    if (initializeAppRequestState === RequestStates.PENDING
      || getEnrollmentStatusRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const entityIndexToIdMap = this.createEntityIndexToIdMap();
    const entitySetIds = this.createEntitySetIdsMap();
    const propertyTypeIds = this.createPropertyTypeIdsMap();

    // const caseFormContext = {
    //   editAction: actions.editPersonCase,
    //   entityIndexToIdMap,
    //   entitySetIds,
    //   propertyTypeIds,
    // };
    const diversionPlanFormContext = {
      editAction: actions.editEnrollmentDates,
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
            <CardHeader padding="sm">Edit Sentence Dates</CardHeader>
            <Form
                disabled={sentenceTermPrepopulated}
                formContext={{}}
                formData={sentenceTermFormData}
                schema={sentenceTermSchema}
                uiSchema={sentenceTermUiSchema} />
          </Card>
          <Card>
            <CardHeader padding="sm">Edit Enrollment Dates</CardHeader>
            <Form
                disabled={diversionPlanPrepopulated}
                formContext={diversionPlanFormContext}
                formData={diversionPlanFormData}
                schema={diversionPlanSchema}
                uiSchema={diversionPlanUiSchema} />
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
    [PERSON.DIVERSION_PLAN]: person.get(PERSON.DIVERSION_PLAN),
    edm: state.get(STATE.EDM),
    getEnrollmentStatusRequestState: person.getIn([ACTIONS, GET_ENROLLMENT_STATUS, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [PERSON.SENTENCE_TERM]: person.get(PERSON.SENTENCE_TERM),
  });
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    editEnrollmentDates,
    getEnrollmentStatus,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(EditCaseInfoForm);
