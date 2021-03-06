/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  Colors,
  Select,
  Table,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AssignWorksiteModal from './assignedworksites/AssignWorksiteModal';
import AssignedWorksitesContainer from './assignedworksites/AssignedWorksitesContainer';
import CreateWorkAppointmentModal from './schedule/CreateAppointmentModal';
import EnrollmentTableRow from './enrollment/EnrollmentTableRow';
import InfractionsContainer from './infractions/InfractionsContainer';
import ParticipantWorkScheduleContainer from './schedule/ParticipantWorkScheduleContainer';
import ProgramCompletionBanner from './outcome/ProgramCompletionBanner';
import generateDiversionPlanOptions from './utils/ParticipantProfileUtils';
import { getAllParticipantInfo, getEnrollmentFromDiversionPlan } from './ParticipantActions';
import { clearAppointmentsAndPlans } from './assignedworksites/WorksitePlanActions';

import LogoLoader from '../../components/LogoLoader';
import * as Routes from '../../core/router/Routes';
import { BackNavButton } from '../../components/controls/index';
import {
  CaseInfoSection,
  EnrollmentDates,
  EnrollmentStatusSection,
  ParticipantProfileSection,
  PersonNotes,
  ProgramNotes,
} from '../../components/participant/index';
import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../core/router/RoutingActions';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { getEntityKeyId, getEntityProperties, sortEntitiesByDateProperty } from '../../utils/DataUtils';
import { generateTableHeaders } from '../../utils/FormattingUtils';
import { isDefined } from '../../utils/LangUtils';
import {
  APP,
  CHARGES,
  PERSON,
  PERSON_CONTACTS,
  PERSON_INFRACTIONS,
  STATE,
  WORKSITES,
  WORKSITE_PLANS,
} from '../../utils/constants/ReduxStateConsts';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { NEUTRAL } = Colors;
const {
  CHECK_IN_DATETIME,
  CHECK_IN_DEADLINE,
  DATETIME_END,
  DATETIME_RECEIVED,
  DATETIME_START,
  FIRST_NAME,
  INCIDENT_START_DATETIME,
  NAME,
  NOTES,
  ORIENTATION_DATETIME,
  PERSON_NOTES,
  REQUIRED_HOURS,
  STATUS,
} = PROPERTY_TYPE_FQNS;

const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const { ARREST_CHARGE_MAPS_CREATED_IN_CWP, ARREST_CHARGE_MAPS_CREATED_IN_PSA } = CHARGES;
const {
  ACTIONS,
  ALL_DIVERSION_PLANS,
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  GET_ALL_PARTICIPANT_INFO,
  GET_ENROLLMENT_FROM_DIVERSION_PLAN,
  ENROLLMENT_HISTORY_DATA,
  JUDGE,
  PARTICIPANT,
  PERSON_CASE,
  PERSON_PHOTO,
  PROGRAM_OUTCOME,
  REQUEST_STATE,
} = PERSON;
const { EMAIL, PERSON_ADDRESS, PHONE } = PERSON_CONTACTS;
const { VIOLATIONS, WARNINGS } = PERSON_INFRACTIONS;
const { WORKSITES_LIST } = WORKSITES;
const {
  CHECK_INS_BY_APPOINTMENT,
  WORK_APPOINTMENTS_BY_WORKSITE_PLAN,
  WORKSITES_BY_WORKSITE_PLAN,
  WORKSITE_PLANS_LIST,
  WORKSITE_PLAN_STATUSES,
} = WORKSITE_PLANS;

const ENROLLMENT_STATUSES_EXCLUDING_PREENROLLMENT = Object.values(ENROLLMENT_STATUSES)
  .filter((status) => status !== ENROLLMENT_STATUSES.AWAITING_CHECKIN
    && status !== ENROLLMENT_STATUSES.AWAITING_ORIENTATION);

export const enrollmentHeaderNames = ['STATUS', 'SENTENCE', 'ORIENTATION', 'COMPLETION', 'HOURS'];

/* Constants for Modals */
const ASSIGN_WORKSITE = 'showAssignWorksiteModal';
const WORK_APPOINTMENT = 'showWorkAppointmentModal';

const ProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  width: ${PARTICIPANT_PROFILE_WIDTH}px;
  margin-top: 30px;
  position: relative;
`;

const ProfileBody = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
  overflow-x: visible;
  overflow-y: auto;
  overflow-y: visible;
  width: 100%;
`;

const GeneralInfoSection = styled.div`
  display: grid;
  font-size: 13px;
  grid-gap: 16px 33px;
  grid-template-columns: 383px 1fr;
  height: 800px;
  margin-bottom: 30px;
  overflow-x: visible;
  overflow-y: auto;
  overflow-y: visible;
  width: 100%;
`;

const ProfileInfoColumnWrapper = styled.div`
  display: grid;
  grid-template-rows: 7% 78% 15%;
  height: 100%;
  row-gap: 15px;
  width: 100%;
`;

const ProgramInfoColumnWrapper = styled.div`
  display: grid;
  grid-template-rows: 7% 18% 28% 28.5% 15%;
  height: 100%;
  row-gap: 15px;
  width: 100%;
`;

const NameRowWrapper = styled.div`
  margin: 15px 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TopRowWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const NameHeader = styled.div`
  color: ${NEUTRAL.N900};
  font-size: 26px;
  font-weight: 600;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 0 10px;
`;

const ScheduleButtonsWrapper = styled(ButtonsWrapper)`
  grid-template-columns: repeat(2, 1fr);
`;

const EnrollmentControlsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 0 20px;
  margin-top: 8px;
  width: 100%;
  height: 42px;
`;

type Props = {
  actions:{
    clearAppointmentsAndPlans :() => { type :string };
    getAllParticipantInfo :RequestSequence;
    getEnrollmentFromDiversionPlan :RequestSequence;
    goToRoute :GoToRoute;
  };
  allDiversionPlans :List;
  arrestChargeMapsCreatedInCWP :List;
  arrestChargeMapsCreatedInPSA :List;
  checkInsByAppointment :Map;
  diversionPlan :Map;
  email :Map;
  enrollmentHistoryData :List;
  enrollmentStatus :Map;
  entitySetIds :Map;
  getAllParticipantInfoRequestState :RequestState;
  getEnrollmentFromDiversionPlanRequestState :RequestState;
  initializeAppRequestState :RequestState;
  judge :Map;
  participant :Map;
  personAddress :Map;
  personCase :Map;
  personEKID :string;
  personPhoto :Map;
  phone :Map;
  programOutcome :Map;
  violations :List;
  warnings :List;
  workAppointmentsByWorksitePlan :Map;
  worksitesByWorksitePlan :Map;
  worksitePlansList :List;
  worksitePlanStatuses :Map;
  worksitesList :List;
};

type State = {
  workStartDateTime :string;
  showAssignWorksiteModal :boolean;
  showWorkAppointmentModal :boolean;
  worksiteNamesByWorksitePlan :Map;
};

class ParticipantProfile extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      workStartDateTime: '',
      [ASSIGN_WORKSITE]: false,
      [WORK_APPOINTMENT]: false,
      worksiteNamesByWorksitePlan: Map(),
    };
  }

  componentDidMount() {
    const { entitySetIds } = this.props;
    if (entitySetIds.has(APP_TYPE_FQNS.PEOPLE)) {
      this.loadProfile();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      checkInsByAppointment,
      entitySetIds,
      getAllParticipantInfoRequestState,
      worksitesByWorksitePlan,
      worksitesList,
    } = this.props;
    if (!prevProps.entitySetIds.has(APP_TYPE_FQNS.PEOPLE) && entitySetIds.has(APP_TYPE_FQNS.PEOPLE)) {
      this.loadProfile();
    }
    if ((prevProps.getAllParticipantInfoRequestState === RequestStates.PENDING
        && getAllParticipantInfoRequestState === RequestStates.SUCCESS)
        || !prevProps.worksitesList.equals(worksitesList)
        || !prevProps.worksitesByWorksitePlan.equals(worksitesByWorksitePlan)
        || !prevProps.checkInsByAppointment.equals(checkInsByAppointment)) {
      this.setWorkAndWorksiteInfo();
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearAppointmentsAndPlans();
  }

  loadProfile = () => {
    const { actions, personEKID } = this.props;
    actions.getAllParticipantInfo({ personEKID });
  }

  setWorkAndWorksiteInfo = () => {
    const { worksitesByWorksitePlan } = this.props;
    const worksiteNamesByWorksitePlan = Map().withMutations((map :Map) => {
      worksitesByWorksitePlan.forEach((worksite :Map, worksitePlanEKID :UUID) => {
        const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
        map.set(worksitePlanEKID, worksiteName);
      });
    });

    const workStartDateTime :string = this.getWorkStartDate();
    this.setState({ worksiteNamesByWorksitePlan, workStartDateTime });
  }

  getWorkStartDate = () => {
    const { checkInsByAppointment, workAppointmentsByWorksitePlan } = this.props;
    let workStartDateTime :string = '';
    if (!checkInsByAppointment.isEmpty()) {
      const appointments :List = workAppointmentsByWorksitePlan
        .valueSeq()
        .toList()
        .flatten(1);
      const sortedAppointments :List = sortEntitiesByDateProperty(appointments, [INCIDENT_START_DATETIME]);
      sortedAppointments.forEach((appointment :Map) => {
        const appointmentEKID :UUID = getEntityKeyId(appointment);
        const checkIn :Map = checkInsByAppointment.get(appointmentEKID, Map());
        if (!checkIn.isEmpty()) {
          const { [DATETIME_START]: datetimeStart } = getEntityProperties(checkIn, [DATETIME_START]);
          if (datetimeStart) workStartDateTime = datetimeStart;
          return false;
        }
        return true;
      });
    }
    return workStartDateTime;
  }

  handleShowModal = (modalName :string) => {
    this.setState({
      [modalName]: true,
    });
  }

  handleHideModal = (modalName :string) => {
    this.setState({
      [modalName]: false,
    });
  }

  goToPrintSchedule = () => {
    const { actions, personEKID } = this.props;
    actions.goToRoute(Routes.PRINT_PARTICIPANT_SCHEDULE.replace(':participantId', personEKID));
  }

  editParticipant = () => {
    const { actions, personEKID } = this.props;
    actions.goToRoute(Routes.EDIT_PARTICIPANT.replace(':participantId', personEKID));
  }

  editCaseInfo = () => {
    const { actions, diversionPlan, personEKID } = this.props;
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    actions.goToRoute(Routes.EDIT_CASE_INFO
      .replace(':participantId', personEKID)
      .replace(':diversionPlanId', diversionPlanEKID));
  }

  editEnrollmentDates = () => {
    const { actions, diversionPlan, personEKID } = this.props;
    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    actions.goToRoute(Routes.EDIT_DATES
      .replace(':participantId', personEKID)
      .replace(':diversionPlanId', diversionPlanEKID));
  }

  goToNewEnrollmentForm = () => {
    const { actions, personEKID } = this.props;
    actions.goToRoute(Routes.CREATE_NEW_ENROLLMENT.replace(':participantId', personEKID));
  }

  goBackToParticipants = () => {
    const { actions } = this.props;
    actions.goToRoute(Routes.PARTICIPANTS);
  }

  selectDiversionPlan = (option :Object) => {
    const { actions } = this.props;
    const { value } = option;
    actions.getEnrollmentFromDiversionPlan({ diversionPlan: value });
  }

  render() {
    const {
      allDiversionPlans,
      arrestChargeMapsCreatedInCWP,
      arrestChargeMapsCreatedInPSA,
      diversionPlan,
      email,
      enrollmentHistoryData,
      enrollmentStatus,
      getAllParticipantInfoRequestState,
      getEnrollmentFromDiversionPlanRequestState,
      initializeAppRequestState,
      judge,
      participant,
      personAddress,
      personCase,
      personPhoto,
      phone,
      programOutcome,
      violations,
      warnings,
      workAppointmentsByWorksitePlan,
      worksitePlanStatuses,
      worksitePlansList,
      worksitesByWorksitePlan,
      worksitesList,
    } = this.props;
    const {
      showAssignWorksiteModal,
      showWorkAppointmentModal,
      workStartDateTime,
      worksiteNamesByWorksitePlan
    } = this.state;

    if (initializeAppRequestState === RequestStates.PENDING
        || getAllParticipantInfoRequestState === RequestStates.PENDING
        || getEnrollmentFromDiversionPlanRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const personEKID :UUID = getEntityKeyId(participant);
    const { [PERSON_NOTES]: personNotes } = getEntityProperties(participant, [FIRST_NAME, PERSON_NOTES]);
    let { [STATUS]: status } = getEntityProperties(enrollmentStatus, [STATUS]);
    if (!isDefined(status)) status = ENROLLMENT_STATUSES.AWAITING_CHECKIN;

    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    const {
      [CHECK_IN_DATETIME]: checkInDate,
      [CHECK_IN_DEADLINE]: checkInDeadline,
      [DATETIME_END]: sentenceEndDateTime,
      [DATETIME_RECEIVED]: sentenceDate,
      [ORIENTATION_DATETIME]: orientationDateTime,
      [NOTES]: planNotes,
      [REQUIRED_HOURS]: requiredHours,
    } = getEntityProperties(diversionPlan, [
      CHECK_IN_DATETIME,
      CHECK_IN_DEADLINE,
      DATETIME_END,
      DATETIME_RECEIVED,
      NOTES,
      ORIENTATION_DATETIME,
      REQUIRED_HOURS,
    ]);
    const diversionPlanOptions :Object[] = generateDiversionPlanOptions(allDiversionPlans);
    const enrollmentHeaders :Object[] = generateTableHeaders(enrollmentHeaderNames);
    const enrollmentData :Object[] = enrollmentHistoryData.toJS();

    return (
      <>
        {
          programOutcome.isEmpty()
            ? null
            : (
              <ProgramCompletionBanner
                  programOutcome={programOutcome}
                  resultingStatus={status} />
            )
        }
        <ProfileWrapper>
          <GeneralInfoSection>
            <ProfileInfoColumnWrapper>
              <TopRowWrapper>
                <BackNavButton onClick={this.goBackToParticipants}>
                  Back to Participants
                </BackNavButton>
              </TopRowWrapper>
              <ParticipantProfileSection
                  address={personAddress}
                  edit={this.editParticipant}
                  email={email}
                  person={participant}
                  personPhoto={personPhoto}
                  phone={phone} />
              <PersonNotes
                  notes={personNotes} />
            </ProfileInfoColumnWrapper>
            <ProgramInfoColumnWrapper>
              <EnrollmentControlsWrapper>
                <Select
                    onChange={this.selectDiversionPlan}
                    options={diversionPlanOptions}
                    value={diversionPlanOptions.find((option) => (option.value).equals(diversionPlan))} />
                <Button onClick={this.goToNewEnrollmentForm}>Create New Enrollment</Button>
              </EnrollmentControlsWrapper>
              <EnrollmentStatusSection
                  enrollmentStatus={enrollmentStatus}
                  violations={violations}
                  warnings={warnings} />
              <EnrollmentDates
                  checkInDate={checkInDate}
                  checkInDeadline={checkInDeadline}
                  edit={this.editEnrollmentDates}
                  orientationDateTime={orientationDateTime}
                  sentenceDateTime={sentenceDate}
                  sentenceEndDateTime={sentenceEndDateTime}
                  workStartDateTime={workStartDateTime} />
              <CaseInfoSection
                  arrestChargeMapsCreatedInCWP={arrestChargeMapsCreatedInCWP}
                  arrestChargeMapsCreatedInPSA={arrestChargeMapsCreatedInPSA}
                  edit={this.editCaseInfo}
                  hours={requiredHours}
                  judge={judge}
                  personCase={personCase} />
              <ProgramNotes
                  notes={planNotes} />
            </ProgramInfoColumnWrapper>
          </GeneralInfoSection>
          {
            ENROLLMENT_STATUSES_EXCLUDING_PREENROLLMENT.includes(status) && (
              <ProfileBody>
                <AssignedWorksitesContainer
                    assignWorksiteModal={ASSIGN_WORKSITE}
                    handleShowModal={this.handleShowModal}
                    worksitePlanStatuses={worksitePlanStatuses}
                    worksitePlansList={worksitePlansList}
                    worksitesByWorksitePlan={worksitesByWorksitePlan} />
              </ProfileBody>
            )
          }
          {
            !worksitePlansList.isEmpty() && (
              <ProfileBody>
                <NameRowWrapper>
                  <NameHeader>Work Schedule</NameHeader>
                  <ScheduleButtonsWrapper>
                    <Button onClick={this.goToPrintSchedule}>
                      Print Schedule
                    </Button>
                    <Button onClick={() => this.handleShowModal(WORK_APPOINTMENT)}>Create Appointment</Button>
                  </ScheduleButtonsWrapper>
                </NameRowWrapper>
                <ParticipantWorkScheduleContainer
                    workAppointmentsByWorksitePlan={workAppointmentsByWorksitePlan}
                    worksitesByWorksitePlan={worksitesByWorksitePlan}
                    worksiteNamesByWorksitePlan={worksiteNamesByWorksitePlan} />
              </ProfileBody>
            )
          }
          <ProfileBody>
            <NameRowWrapper>
              <NameHeader>Warnings & Violations</NameHeader>
            </NameRowWrapper>
            <InfractionsContainer
                currentStatus={status}
                participant={participant} />
          </ProfileBody>
          <ProfileBody>
            <NameRowWrapper>
              <NameHeader>Enrollment History</NameHeader>
            </NameRowWrapper>
            <Card>
              <CardSegment>
                <Table
                    components={{
                      Row: EnrollmentTableRow
                    }}
                    data={enrollmentData}
                    headers={enrollmentHeaders}
                    isLoading={false} />
              </CardSegment>
            </Card>
          </ProfileBody>
          <AssignWorksiteModal
              diversionPlanEKID={diversionPlanEKID}
              isOpen={showAssignWorksiteModal}
              onClose={() => this.handleHideModal(ASSIGN_WORKSITE)}
              personEKID={personEKID}
              worksites={worksitesList} />
          <CreateWorkAppointmentModal
              isOpen={showWorkAppointmentModal}
              onClose={() => this.handleHideModal(WORK_APPOINTMENT)}
              personEKID={personEKID} />
        </ProfileWrapper>
      </>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const infractions = state.get(STATE.INFRACTIONS);
  const person = state.get(STATE.PERSON);
  const personContacts = state.get(STATE.PERSON_CONTACTS);
  const worksitePlans = state.get(STATE.WORKSITE_PLANS);
  const worksites = state.get(STATE.WORKSITES);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return {
    [ALL_DIVERSION_PLANS]: person.get(ALL_DIVERSION_PLANS),
    [ARREST_CHARGE_MAPS_CREATED_IN_CWP]: charges.get(ARREST_CHARGE_MAPS_CREATED_IN_CWP),
    [ARREST_CHARGE_MAPS_CREATED_IN_PSA]: charges.get(ARREST_CHARGE_MAPS_CREATED_IN_PSA),
    [CHECK_INS_BY_APPOINTMENT]: worksitePlans.get(CHECK_INS_BY_APPOINTMENT),
    [DIVERSION_PLAN]: person.get(DIVERSION_PLAN),
    [EMAIL]: personContacts.get(EMAIL),
    [ENROLLMENT_HISTORY_DATA]: person.get(ENROLLMENT_HISTORY_DATA),
    [ENROLLMENT_STATUS]: person.get(ENROLLMENT_STATUS),
    [JUDGE]: person.get(JUDGE),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PERSON_ADDRESS]: personContacts.get(PERSON_ADDRESS),
    [PERSON_CASE]: person.get(PERSON_CASE),
    [PERSON_PHOTO]: person.get(PERSON_PHOTO),
    [PHONE]: personContacts.get(PHONE),
    [PROGRAM_OUTCOME]: person.get(PROGRAM_OUTCOME),
    [VIOLATIONS]: infractions.get(VIOLATIONS),
    [WARNINGS]: infractions.get(WARNINGS),
    [WORKSITES_BY_WORKSITE_PLAN]: worksitePlans.get(WORKSITES_BY_WORKSITE_PLAN),
    [WORKSITES_LIST]: worksites.get(WORKSITES_LIST),
    [WORKSITE_PLANS_LIST]: worksitePlans.get(WORKSITE_PLANS_LIST),
    [WORKSITE_PLAN_STATUSES]: worksitePlans.get(WORKSITE_PLAN_STATUSES),
    [WORK_APPOINTMENTS_BY_WORKSITE_PLAN]: worksitePlans.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    getAllParticipantInfoRequestState: person.getIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE]),
    getEnrollmentFromDiversionPlanRequestState: person
      .getIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    clearAppointmentsAndPlans,
    getAllParticipantInfo,
    getEnrollmentFromDiversionPlan,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantProfile);
