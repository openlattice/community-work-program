// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  List,
  Map,
  fromJS,
  getIn,
  hasIn,
  removeIn,
  setIn,
} from 'immutable';
import { DateTime } from 'luxon';
import {
  Card,
  CardHeader,
  CardSegment,
  CardStack,
  Spinner,
} from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons';
import { Form, DataProcessingUtils } from 'lattice-fabricate';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router-dom';

import LogoLoader from '../../components/LogoLoader';

import * as Routes from '../../core/router/Routes';
import { createNewEnrollment, getInfoForAddParticipant } from './ParticipantActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { hydrateSchema } from './utils/CreateNewEnrollmentUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { CWP, ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { schema, uiSchema } from './schemas/CreateNewEnrollmentSchemas';
import { getEntityKeyId } from '../../utils/DataUtils';
import { getCombinedDateTime } from '../../utils/ScheduleUtils';
import { BackNavButton } from '../../components/controls/index';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import {
  APP,
  EDM,
  PERSON,
  STATE
} from '../../utils/constants/ReduxStateConsts';
import { OL } from '../../core/style/Colors';
import type { GoToRoute } from '../../core/router/RoutingActions';

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
  ENROLLMENT_STATUS,
  JUDGES,
  MANUAL_CHARGED_WITH,
  MANUAL_PRETRIAL_COURT_CASES,
  MANUAL_SENTENCED_WITH,
  PRESIDES_OVER,
  REGISTERED_FOR,
  RELATED_TO,
} = APP_TYPE_FQNS;
const {
  CASE_NUMBER_TEXT,
  COMPLETED,
  COURT_CASE_TYPE,
  DATETIME_COMPLETED,
  DATETIME_RECEIVED,
  EFFECTIVE_DATE,
  ENTITY_KEY_ID,
  NAME,
  STATUS,
} = PROPERTY_TYPE_FQNS;
const {
  ACTIONS,
  CHARGES,
  CREATE_NEW_ENROLLMENT,
  GET_INFO_FOR_ADD_PARTICIPANT,
  PARTICIPANT,
  REQUEST_STATE,
} = PERSON;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;

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

const SubmissionActionsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const SpinnerWrapper = styled(SubmissionActionsWrapper)`
  justify-content: center;
`;

const SubmittedWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-right: 8px;

  :last-of-type {
    margin: none;
  }
`;

type Props = {
  actions:{
    createNewEnrollment :RequestSequence;
    getInfoForAddParticipant :RequestSequence;
    goToRoute :GoToRoute;
  };
  createNewEnrollmentRequestState :RequestState;
  charges :List;
  entitySetIds :Map;
  getInfoRequestState :RequestState;
  judges :List;
  match :Match;
  participant :Map;
  propertyTypeIds :Map;
};

class CreateNewEnrollmentForm extends Component<Props> {

  componentDidMount() {
    const {
      actions,
      entitySetIds,
      match: {
        params: {
          participantId: personEKID
        }
      }
    } = this.props;
    if (entitySetIds.has(JUDGES)) {
      actions.getInfoForAddParticipant({ personEKID });
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      entitySetIds,
      match: {
        params: {
          participantId: personEKID
        }
      }
    } = this.props;
    if (!prevProps.entitySetIds.has(JUDGES) && entitySetIds.has(JUDGES)) {
      actions.getInfoForAddParticipant({ personEKID });
    }
  }

  handleOnSubmit = ({ formData } :Object) => {
    const {
      actions,
      entitySetIds,
      participant,
      propertyTypeIds
    } = this.props;

    const personEKID :UUID = getEntityKeyId(participant);
    let dataToSubmit :Object = formData;

    const now = DateTime.local();
    const currentTime = now.toLocaleString(DateTime.TIME_24_SIMPLE);
    dataToSubmit = setIn(dataToSubmit, [getPageSectionKey(1, 1), getEntityAddressKey(0, DIVERSION_PLAN, NAME)], CWP);
    dataToSubmit = setIn(
      dataToSubmit,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, DIVERSION_PLAN, COMPLETED)],
      false
    );
    const sentenceDateKey :string[] = [
      getPageSectionKey(1, 1),
      getEntityAddressKey(0, DIVERSION_PLAN, DATETIME_RECEIVED)
    ];
    if (hasIn(dataToSubmit, sentenceDateKey)) {
      const sentenceDate :string = getIn(dataToSubmit, sentenceDateKey);
      const sentenceDateTime :string = getCombinedDateTime(sentenceDate, currentTime);
      dataToSubmit = setIn(dataToSubmit, sentenceDateKey, sentenceDateTime);
    }

    /* add in enrollment status */
    dataToSubmit = setIn(dataToSubmit, [getPageSectionKey(1, 3)], {
      [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: now.toISO(),
      [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: ENROLLMENT_STATUSES.AWAITING_CHECKIN,
    });

    /* ensure case entity is created */
    const docketNumberKey :string[] = [
      getPageSectionKey(1, 1),
      getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)
    ];
    const hasCourtType :boolean = hasIn(dataToSubmit, [
      getPageSectionKey(1, 1),
      getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, COURT_CASE_TYPE)
    ]);
    const hasDocketNumber :boolean = hasIn(dataToSubmit, docketNumberKey);
    if (!hasCourtType || !hasDocketNumber) {
      dataToSubmit = setIn(dataToSubmit, docketNumberKey, getIn(dataToSubmit, docketNumberKey) || '');
    }

    /* required associations */
    const associations = [];
    associations.push([MANUAL_SENTENCED_WITH, personEKID, APP_TYPE_FQNS.PEOPLE, 0, DIVERSION_PLAN, {}]);
    associations.push([RELATED_TO, 0, ENROLLMENT_STATUS, 0, DIVERSION_PLAN, {}]);
    associations.push([RELATED_TO, 0, DIVERSION_PLAN, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);
    associations.push([APPEARS_IN, personEKID, APP_TYPE_FQNS.PEOPLE, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);

    /* should only submit judge entity if there's judge data in the form */
    const judgesPath :string[] = [getPageSectionKey(1, 1), getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)];
    if (hasIn(dataToSubmit, judgesPath)) {
      const judgeEKID :UUID = getIn(dataToSubmit, judgesPath);
      associations.push([PRESIDES_OVER, judgeEKID, JUDGES, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);
      associations.push([PRESIDES_OVER, judgeEKID, JUDGES, 0, DIVERSION_PLAN, {}]);
      dataToSubmit = removeIn(dataToSubmit, judgesPath);
    }
    /* should only submit charge event entities if there's charge data in the form */
    const charges = dataToSubmit[getPageSectionKey(1, 2)];
    if (charges.length && Object.keys(charges[0]).length) {
      const storedChargeData :[] = getIn(dataToSubmit, [getPageSectionKey(1, 2)]);
      const chargeKey = getEntityAddressKey(-1, COURT_CHARGE_LIST, ENTITY_KEY_ID);
      const chargeEventKey = getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED);

      storedChargeData.forEach((charge :Object, index :number) => {
        const courtChargeEKID :UUID = charge[chargeKey];
        const date :UUID = charge[chargeEventKey];
        const datetime = getCombinedDateTime(date, currentTime);

        dataToSubmit = setIn(dataToSubmit, [getPageSectionKey(1, 2), index], {
          [getEntityAddressKey(index, CHARGE_EVENT, DATETIME_COMPLETED)]: datetime
        });
        associations.push([APPEARS_IN, courtChargeEKID, COURT_CHARGE_LIST, 0, MANUAL_PRETRIAL_COURT_CASES]);
        associations.push([REGISTERED_FOR, index, CHARGE_EVENT, courtChargeEKID, COURT_CHARGE_LIST]);
        associations.push([MANUAL_CHARGED_WITH, personEKID, APP_TYPE_FQNS.PEOPLE, courtChargeEKID, COURT_CHARGE_LIST]);
        associations.push([MANUAL_CHARGED_WITH, personEKID, APP_TYPE_FQNS.PEOPLE, index, CHARGE_EVENT]);
      });
    }

    const entityData :Object = processEntityData(dataToSubmit, entitySetIds, propertyTypeIds);
    const associationEntityData :Object = processAssociationEntityData(
      fromJS(associations),
      entitySetIds,
      propertyTypeIds
    );
    actions.createNewEnrollment({ associationEntityData, entityData });
  }

  handleOnClickBackButton = () => {
    const { actions, participant } = this.props;
    const personEKID :UUID = getEntityKeyId(participant);
    actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':participantId', personEKID));
  }

  render() {
    const {
      createNewEnrollmentRequestState,
      charges,
      getInfoRequestState,
      judges,
    } = this.props;

    if (getInfoRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const formSchema = hydrateSchema(schema, judges, charges);

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
            <CardHeader mode="primary" padding="md">Create New Enrollment</CardHeader>
            {
              (createNewEnrollmentRequestState !== RequestStates.PENDING
                  && createNewEnrollmentRequestState !== RequestStates.SUCCESS)
                && (
                  <Form
                      onSubmit={this.handleOnSubmit}
                      schema={formSchema}
                      uiSchema={uiSchema} />
                )
            }
            {
              createNewEnrollmentRequestState === RequestStates.PENDING
              && (
                <CardSegment padding="md">
                  <SpinnerWrapper>
                    <Spinner size="2x" />
                  </SpinnerWrapper>
                </CardSegment>
              )
            }
            {
              createNewEnrollmentRequestState === RequestStates.SUCCESS
              && (
                <CardSegment padding="md">
                  <SubmissionActionsWrapper>
                    <SubmittedWrapper>
                      <SubmittedWrapper>
                        <FontAwesomeIcon icon={faCheckCircle} color={OL.PURPLE02} />
                      </SubmittedWrapper>
                      <SubmittedWrapper>
                        CWP Enrollment Created!
                      </SubmittedWrapper>
                    </SubmittedWrapper>
                  </SubmissionActionsWrapper>
                </CardSegment>
              )
            }
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
    [CHARGES]: person.get(CHARGES),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PERSON.JUDGES]: person.get(PERSON.JUDGES),
    createNewEnrollmentRequestState: person.getIn([ACTIONS, CREATE_NEW_ENROLLMENT, REQUEST_STATE]),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    getInfoRequestState: person.getIn([ACTIONS, GET_INFO_FOR_ADD_PARTICIPANT, REQUEST_STATE]),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    createNewEnrollment,
    getInfoForAddParticipant,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CreateNewEnrollmentForm);
