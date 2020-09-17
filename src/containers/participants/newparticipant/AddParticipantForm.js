// @flow
import React, { Component } from 'react';

import styled from 'styled-components';
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  List,
  Map,
  fromJS,
  get,
  getIn,
  hasIn,
  removeIn,
  setIn,
} from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import {
  Button,
  Card,
  CardHeader,
  CardSegment,
  CardStack,
  Colors,
  Spinner,
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { resetSearchedParticipants } from './NewParticipantActions';

import LogoLoader from '../../../components/LogoLoader';
import * as Routes from '../../../core/router/Routes';
import { BackNavButton } from '../../../components/controls/index';
import { CWP, ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../../core/router/RoutingActions';
import { PARTICIPANT_PROFILE_WIDTH } from '../../../core/style/Sizes';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { requestIsPending, requestIsSuccess } from '../../../utils/RequestStateUtils';
import { getCombinedDateTime } from '../../../utils/ScheduleUtils';
import { isValidUUID } from '../../../utils/ValidationUtils';
import {
  APP,
  CHARGES,
  EDM,
  PEOPLE,
  PERSON,
  STATE
} from '../../../utils/constants/ReduxStateConsts';
import { getInfoForAddParticipant } from '../../participant/ParticipantActions';
import { formatNewArrestChargeDataAndAssociations } from '../../participant/charges/utils/ChargesUtils';
import { addParticipant } from '../ParticipantsActions';
import { schema, uiSchema } from '../schemas/AddParticipantFormSchemas';
import { hydrateSchema, setPersonValues } from '../utils/AddParticipantFormUtils';
import type { GoToRoute } from '../../../core/router/RoutingActions';

const {
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
} = DataProcessingUtils;
const { PURPLE } = Colors;
const {
  ADDRESS,
  APPEARS_IN,
  CONTACT_INFORMATION,
  CONTACT_INFO_GIVEN,
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  LOCATED_AT,
  JUDGES,
  MANUAL_PRETRIAL_COURT_CASES,
  MANUAL_SENTENCED_WITH,
  PRESIDES_OVER,
  RELATED_TO,
} = APP_TYPE_FQNS;
const {
  CASE_NUMBER_TEXT,
  COMPLETED,
  COURT_CASE_TYPE,
  DATETIME_RECEIVED,
  EFFECTIVE_DATE,
  EMAIL,
  ENTITY_KEY_ID,
  FULL_ADDRESS,
  LAST_NAME,
  NAME,
  ORIENTATION_DATETIME,
  PHONE_NUMBER,
  PREFERRED,
  STATUS,
} = PROPERTY_TYPE_FQNS;
const {
  ACTIONS,
  GET_INFO_FOR_ADD_PARTICIPANT,
  REQUEST_STATE,
} = PERSON;
const { ADD_PARTICIPANT, EXISTING_PERSON, NEW_PARTICIPANT_EKID } = PEOPLE;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { PROPERTY_TYPES, TYPE_IDS_BY_FQNS } = EDM;
const { ARREST_CHARGES } = CHARGES;

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

const AddButtonWrapper = styled.div`
  display: flex;
  margin-left: 15px;
`;

const Wrapper = styled.div`
  display: flex;
`;

type Props = {
  actions:{
    addParticipant :RequestSequence;
    getInfoForAddParticipant :RequestSequence;
    goToRoute :GoToRoute;
    resetSearchedParticipants :() => { type :string };
  };
  arrestCharges :List;
  entitySetIds :Map;
  existingPerson :Map;
  judges :List;
  newParticipantEKID :UUID;
  propertyTypeIds :Map;
  requestStates :{
    ADD_PARTICIPANT :RequestState;
    GET_INFO_FOR_ADD_PARTICIPANT :RequestState;
  };
};

type State = {
  formData :Object;
  formIsVisible :boolean;
};

class AddParticipantForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      formData: {},
      formIsVisible: true,
    };
  }

  componentDidMount() {
    const { actions, entitySetIds } = this.props;
    if (entitySetIds.has(JUDGES)) {
      actions.getInfoForAddParticipant();
      this.prepopulateFormData();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { actions, entitySetIds, requestStates } = this.props;
    if (!prevProps.entitySetIds.has(JUDGES) && entitySetIds.has(JUDGES)) {
      actions.getInfoForAddParticipant();
      this.prepopulateFormData();
    }
    if (requestIsPending(prevProps.requestStates[ADD_PARTICIPANT])
      && requestIsSuccess(requestStates[ADD_PARTICIPANT])) {
      this.hideForm();
    }
  }

  prepopulateFormData = () => {
    const { existingPerson } = this.props;
    const { formData } = this.state;
    if (isDefined(existingPerson) && !existingPerson.isEmpty()) {
      const prepopulatedFormData = setPersonValues(existingPerson, formData, getPageSectionKey(1, 1));
      this.setState({ formData: prepopulatedFormData });
    }
  }

  onFormChange = ({ formData } :Object) => {
    this.setState({ formData });
  }

  hideForm = () => {
    this.setState({ formIsVisible: false });
  }

  showForm = () => {
    this.setState({ formIsVisible: true });
  }

  goToParticipantProfile = () => {
    const { actions, newParticipantEKID } = this.props;
    actions.resetSearchedParticipants();
    actions.goToRoute(Routes.PARTICIPANT_PROFILE.replace(':participantId', newParticipantEKID));
  }

  handleOnSubmit = ({ formData } :Object) => {
    const {
      actions,
      entitySetIds,
      existingPerson,
      propertyTypeIds,
    } = this.props;

    let dataToSubmit :Object = formData;

    const now = DateTime.local();
    const currentTime = now.toLocaleString(DateTime.TIME_24_SIMPLE);
    dataToSubmit = setIn(dataToSubmit, [getPageSectionKey(1, 3), getEntityAddressKey(0, DIVERSION_PLAN, NAME)], CWP);
    dataToSubmit = setIn(
      dataToSubmit,
      [getPageSectionKey(1, 3), getEntityAddressKey(0, DIVERSION_PLAN, COMPLETED)],
      false
    );
    const sentenceDateKey :string[] = [
      getPageSectionKey(1, 3),
      getEntityAddressKey(0, DIVERSION_PLAN, DATETIME_RECEIVED)
    ];
    if (hasIn(dataToSubmit, sentenceDateKey)) {
      const sentenceDate :string = getIn(dataToSubmit, sentenceDateKey);
      const sentenceDateTime :string = getCombinedDateTime(sentenceDate, currentTime);
      dataToSubmit = setIn(dataToSubmit, sentenceDateKey, sentenceDateTime);
    }

    const orientationDateKey :string[] = [
      getPageSectionKey(1, 3),
      getEntityAddressKey(0, DIVERSION_PLAN, ORIENTATION_DATETIME)
    ];
    if (hasIn(dataToSubmit, orientationDateKey)) {
      const orientationDate :string = getIn(dataToSubmit, orientationDateKey);
      const orientationDateTime :string = getCombinedDateTime(orientationDate, currentTime);
      dataToSubmit = setIn(dataToSubmit, orientationDateKey, orientationDateTime);
    }

    dataToSubmit = setIn(dataToSubmit, [getPageSectionKey(1, 5)], {
      [getEntityAddressKey(0, ENROLLMENT_STATUS, EFFECTIVE_DATE)]: now.toISO(),
      [getEntityAddressKey(0, ENROLLMENT_STATUS, STATUS)]: ENROLLMENT_STATUSES.AWAITING_CHECKIN,
    });

    /* ensure person and case entities are created */
    if (!Object.keys(dataToSubmit[getPageSectionKey(1, 1)]).length) {
      dataToSubmit = setIn(
        dataToSubmit,
        [getPageSectionKey(1, 1), getEntityAddressKey(0, APP_TYPE_FQNS.PEOPLE, LAST_NAME)],
        ''
      );
    }

    const docketNumberKey :string[] = [
      getPageSectionKey(1, 3),
      getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, CASE_NUMBER_TEXT)
    ];
    if (!hasIn(dataToSubmit, [
      getPageSectionKey(1, 3),
      getEntityAddressKey(0, MANUAL_PRETRIAL_COURT_CASES, COURT_CASE_TYPE)
    ])
      || !hasIn(dataToSubmit, docketNumberKey)) {
      dataToSubmit = setIn(dataToSubmit, docketNumberKey, getIn(dataToSubmit, docketNumberKey) || '');
    }

    const personIndexOrEKID :number | string = !existingPerson.isEmpty()
      ? getEntityKeyId(existingPerson)
      : 0;
    /* required associations */
    let associations = [];
    associations.push([MANUAL_SENTENCED_WITH, personIndexOrEKID, APP_TYPE_FQNS.PEOPLE, 0, DIVERSION_PLAN, {}]);
    associations.push([RELATED_TO, 0, ENROLLMENT_STATUS, 0, DIVERSION_PLAN, {}]);
    associations.push([RELATED_TO, 0, DIVERSION_PLAN, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);
    associations.push([APPEARS_IN, personIndexOrEKID, APP_TYPE_FQNS.PEOPLE, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);

    /* should only submit contacts/address if there's at least one of those in the form */
    const sectionTwo :string = getPageSectionKey(1, 2);
    const phoneKey = getEntityAddressKey(0, CONTACT_INFORMATION, PHONE_NUMBER);
    const emailKey = getEntityAddressKey(1, CONTACT_INFORMATION, EMAIL);
    const addressKey = getEntityAddressKey(0, ADDRESS, FULL_ADDRESS);
    if (Object.keys(dataToSubmit[sectionTwo]).length) {
      dataToSubmit = setIn(dataToSubmit, [sectionTwo, phoneKey], getIn(dataToSubmit, [sectionTwo, phoneKey]) || '');
      dataToSubmit = setIn(dataToSubmit, [sectionTwo, emailKey], getIn(dataToSubmit, [sectionTwo, emailKey]) || '');
      dataToSubmit = setIn(dataToSubmit, [sectionTwo, addressKey], getIn(dataToSubmit, [sectionTwo, addressKey]) || '');
      dataToSubmit = setIn(
        dataToSubmit,
        [getPageSectionKey(1, 2), getEntityAddressKey(0, CONTACT_INFORMATION, PREFERRED)],
        true
      );
      dataToSubmit = setIn(
        dataToSubmit,
        [getPageSectionKey(1, 2), getEntityAddressKey(1, CONTACT_INFORMATION, PREFERRED)],
        true
      );

      associations.push([CONTACT_INFO_GIVEN, 0, CONTACT_INFORMATION, personIndexOrEKID, APP_TYPE_FQNS.PEOPLE, {}]);
      associations.push([CONTACT_INFO_GIVEN, 1, CONTACT_INFORMATION, personIndexOrEKID, APP_TYPE_FQNS.PEOPLE, {}]);
      associations.push([LOCATED_AT, personIndexOrEKID, APP_TYPE_FQNS.PEOPLE, 0, ADDRESS, {}]);
    }

    /* should only submit judge entity if there's judge data in the form */
    const judgesPath :string[] = [getPageSectionKey(1, 3), getEntityAddressKey(0, JUDGES, ENTITY_KEY_ID)];
    if (hasIn(dataToSubmit, judgesPath)) {
      const judgeEKID :UUID = getIn(dataToSubmit, judgesPath);
      associations.push([PRESIDES_OVER, judgeEKID, JUDGES, 0, MANUAL_PRETRIAL_COURT_CASES, {}]);
      associations.push([PRESIDES_OVER, judgeEKID, JUDGES, 0, DIVERSION_PLAN, {}]);
      dataToSubmit = removeIn(dataToSubmit, judgesPath);
    }
    /* should only submit charge event entities if there's charge data in the form */
    const charges = get(dataToSubmit, getPageSectionKey(1, 4), []);
    const { newChargeEntities, newChargeAssociations } = formatNewArrestChargeDataAndAssociations(
      charges,
      0,
      { personIndexOrEKID: 0, diversionPlanIndexOrEKID: 0 }
    );
    dataToSubmit[getPageSectionKey(1, 4)] = newChargeEntities;
    associations = associations.concat(newChargeAssociations);

    if (isValidUUID(personIndexOrEKID)) delete dataToSubmit[getPageSectionKey(1, 1)];

    const entityData :Object = processEntityData(dataToSubmit, entitySetIds, propertyTypeIds);
    const associationEntityData :Object = processAssociationEntityData(
      fromJS(associations),
      entitySetIds,
      propertyTypeIds
    );
    actions.addParticipant({ associationEntityData, entityData, personIndexOrEKID });
  }

  handleOnClickBackButton = () => {
    const { actions } = this.props;
    actions.resetSearchedParticipants();
    actions.goToRoute(Routes.PARTICIPANTS);
  }

  render() {
    const {
      arrestCharges,
      existingPerson,
      judges,
      requestStates,
    } = this.props;
    const { formData, formIsVisible } = this.state;

    if (requestIsPending(requestStates[GET_INFO_FOR_ADD_PARTICIPANT])) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const { newSchema, newUiSchema } = hydrateSchema(schema, uiSchema, judges, arrestCharges, existingPerson);
    return (
      <FormWrapper>
        <ButtonWrapper>
          <BackNavButton
              onClick={this.handleOnClickBackButton}>
            Back to Participants
          </BackNavButton>
        </ButtonWrapper>
        <CardStack>
          <Card>
            <CardHeader padding="md">Add New Participant</CardHeader>
            {
              (formIsVisible && !requestIsPending(requestStates[ADD_PARTICIPANT])) && (
                <Form
                    formData={formData}
                    onChange={this.onFormChange}
                    onSubmit={this.handleOnSubmit}
                    schema={newSchema}
                    uiSchema={newUiSchema} />
              )
            }
            {
              requestIsPending(requestStates[ADD_PARTICIPANT]) && (
                <CardSegment padding="md">
                  <SpinnerWrapper>
                    <Spinner size="2x" />
                  </SpinnerWrapper>
                </CardSegment>
              )
            }
            {
              !formIsVisible && (
                <CardSegment padding="md">
                  <SubmissionActionsWrapper>
                    <SubmittedWrapper>
                      <SubmittedWrapper>
                        <FontAwesomeIcon icon={faCheckCircle} color={PURPLE.P300} />
                      </SubmittedWrapper>
                      <SubmittedWrapper>
                        Participant Added!
                      </SubmittedWrapper>
                    </SubmittedWrapper>
                    <Wrapper>
                      <Button onClick={this.goToParticipantProfile}>Go To Profile</Button>
                      <AddButtonWrapper>
                        <Button onClick={this.showForm}>Add Another</Button>
                      </AddButtonWrapper>
                    </Wrapper>
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
  const charges = state.get(STATE.CHARGES);
  const edm = state.get(STATE.EDM);
  const person = state.get(STATE.PERSON);
  const people = state.get(STATE.PEOPLE);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return ({
    [ARREST_CHARGES]: charges.get(ARREST_CHARGES),
    [EXISTING_PERSON]: people.get(EXISTING_PERSON),
    [NEW_PARTICIPANT_EKID]: people.get(NEW_PARTICIPANT_EKID),
    [PERSON.JUDGES]: person.get(PERSON.JUDGES),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    propertyTypeIds: edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES], Map()),
    requestStates: {
      [ADD_PARTICIPANT]: people.getIn([ACTIONS, ADD_PARTICIPANT, REQUEST_STATE]),
      [GET_INFO_FOR_ADD_PARTICIPANT]: person.getIn([ACTIONS, GET_INFO_FOR_ADD_PARTICIPANT, REQUEST_STATE]),
    },
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    addParticipant,
    getInfoForAddParticipant,
    goToRoute,
    resetSearchedParticipants,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(AddParticipantForm);
