// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  CardStack,
  IconSplash,
} from 'lattice-ui-kit';
import { faTools } from '@fortawesome/pro-light-svg-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  CaseInfoSection,
  EnrollmentDates,
  EnrollmentStatusSection,
  ParticipantProfileSection,
  PersonNotes,
  ProgramNotes,
} from '../../components/participant/index';
import ParticipantWorkSchedule from './schedule/ParticipantWorkSchedule';
import ProgramCompletionBanner from './ProgramCompletionBanner';

import AssignedWorksite from './assignedworksites/AssignedWorksite';
import AddNewPlanStatusModal from './AddNewPlanStatusModal';
import AssignWorksiteModal from './assignedworksites/AssignWorksiteModal';
import InfractionsContainer from './infractions/InfractionsContainer';
import CreateWorkAppointmentModal from './schedule/CreateAppointmentModal';
import AddOrientationDateModal from './AddOrientationDateModal';
import EditSentenceDateModal from './EditSentenceDateModal';
import EditCheckInDateModal from './EditCheckInDateModal';
import LogoLoader from '../../components/LogoLoader';

import { getAllParticipantInfo } from './ParticipantActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { OL } from '../../core/style/Colors';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import * as Routes from '../../core/router/Routes';
import { BackNavButton } from '../../components/controls/index';
import { getEntityKeyId, getEntityProperties, sortEntitiesByDateProperty } from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import {
  APP_TYPE_FQNS,
  DATETIME_START,
  DIVERSION_PLAN_FQNS,
  ENROLLMENT_STATUS_FQNS,
  INCIDENT_START_DATETIME,
  PEOPLE_FQNS,
  WORKSITE_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import {
  APP,
  PERSON,
  STATE,
  WORKSITES
} from '../../utils/constants/ReduxStateConsts';

const {
  CHECK_IN_DATETIME,
  DATETIME_RECEIVED,
  NOTES,
  ORIENTATION_DATETIME,
  REQUIRED_HOURS,
} = DIVERSION_PLAN_FQNS;
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { FIRST_NAME, PERSON_NOTES } = PEOPLE_FQNS;
const { NAME } = WORKSITE_FQNS;
const {
  ACTIONS,
  ADDRESS,
  CHECK_INS_BY_APPOINTMENT,
  DIVERSION_PLAN,
  EMAIL,
  ENROLLMENT_STATUS,
  GET_ALL_PARTICIPANT_INFO,
  PARTICIPANT,
  PERSON_CASE,
  PHONE,
  PROGRAM_OUTCOME,
  REQUEST_STATE,
  VIOLATIONS,
  WARNINGS,
  WORK_APPOINTMENTS_BY_WORKSITE_PLAN,
  WORKSITES_BY_WORKSITE_PLAN,
  WORKSITE_PLANS,
  WORKSITE_PLAN_STATUSES,
} = PERSON;
const { WORKSITES_LIST } = WORKSITES;

const ENROLLMENT_STATUSES_EXCLUDING_PREENROLLMENT = Object.values(ENROLLMENT_STATUSES)
  .filter(status => status !== ENROLLMENT_STATUSES.AWAITING_CHECKIN
    && status !== ENROLLMENT_STATUSES.AWAITING_ORIENTATION);

/* Constants for Modals */
const ASSIGN_WORKSITE = 'showAssignWorksiteModal';
const CHECK_IN_DATE = 'showCheckInDateModal';
const ENROLLMENT = 'showEnrollmentModal';
const ORIENTATION_DATE = 'showOrientationDateModal';
const SENTENCE_DATE = 'showSentenceDateModal';
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
  justify-content: space-between;
  margin-bottom: 30px;
  overflow-x: visible;
  overflow-y: auto;
  overflow-y: visible;
  width: 100%;
`;

const GeneralInfoSection = styled(ProfileBody)`
  height: 790px;
  align-items: center;
  flex-direction: row;
`;

const ProfileInfoColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 383px;
`;

const ProgramInfoColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 547px;
`;

const NameRowWrapper = styled.div`
  margin: 15px 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NameHeader = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: ${OL.BLACK};
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 0 10px;
`;

const ScheduleButtonsWrapper = styled(ButtonsWrapper)`
  grid-template-columns: repeat(2, 1fr);
`;

type Props = {
  actions:{
    getAllParticipantInfo :RequestSequence;
    goToRoute :RequestSequence;
  };
  address :string;
  app :Map;
  checkInsByAppointment :Map;
  diversionPlan :Map;
  email :string;
  enrollmentStatus :Map;
  getAllParticipantInfoRequestState :RequestState;
  getInitializeAppRequestState :RequestState;
  participant :Map;
  personCase :Map;
  personEKID :string;
  phone :string;
  programOutcome :Map;
  violations :List;
  warnings :List;
  workAppointmentsByWorksitePlan :Map;
  worksitesByWorksitePlan :Map;
  worksitePlans :List;
  worksitePlanStatuses :Map;
  worksitesList :List;
};

type State = {
  workStartDateTime :string;
  showAssignWorksiteModal :boolean;
  showCheckInDateModal :boolean;
  showEnrollmentModal :boolean;
  showOrientationDateModal :boolean;
  showSentenceDateModal :boolean;
  showWorkAppointmentModal :boolean;
  worksiteNamesByWorksitePlan :Map;
};

class ParticipantProfile extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      workStartDateTime: '',
      [ASSIGN_WORKSITE]: false,
      [CHECK_IN_DATE]: false,
      [ENROLLMENT]: false,
      [ORIENTATION_DATE]: false,
      [SENTENCE_DATE]: false,
      [WORK_APPOINTMENT]: false,
      worksiteNamesByWorksitePlan: Map(),
    };
  }

  componentDidMount() {
    const { app } = this.props;
    if (app.get(APP_TYPE_FQNS.PEOPLE)) {
      this.loadProfile();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { app, workAppointmentsByWorksitePlan, worksitesByWorksitePlan } = this.props;
    if (!prevProps.app.get(APP_TYPE_FQNS.PEOPLE) && app.get(APP_TYPE_FQNS.PEOPLE)) {
      this.loadProfile();
    }
    if (prevProps.worksitesByWorksitePlan.count() !== worksitesByWorksitePlan.count()) {
      this.createWorksiteNameMap();
    }
    if (prevProps.workAppointmentsByWorksitePlan.count() !== workAppointmentsByWorksitePlan.count()) {
      this.setWorkStartDate();
    }
  }

  loadProfile = () => {
    const { actions, personEKID } = this.props;
    actions.getAllParticipantInfo({ personEKID });
  }

  createWorksiteNameMap = () => {
    const { worksitesByWorksitePlan } = this.props;
    const worksiteNamesByWorksitePlan = Map().withMutations((map :Map) => {
      worksitesByWorksitePlan.forEach((worksite :Map, worksitePlanEKID :UUID) => {
        const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);
        map.set(worksitePlanEKID, worksiteName);
      });
    });
    this.setState({ worksiteNamesByWorksitePlan });
  }

  setWorkStartDate = () => {
    const { checkInsByAppointment, workAppointmentsByWorksitePlan } = this.props;
    if (!checkInsByAppointment.isEmpty()) {
      const appointments :List = workAppointmentsByWorksitePlan
        .valueSeq()
        .toList()
        .flatten(1);
      const sortedAppointments :List = sortEntitiesByDateProperty(appointments, INCIDENT_START_DATETIME);
      sortedAppointments.forEach((appointment :Map) => {
        const appointmentEKID :UUID = getEntityKeyId(appointment);
        const checkIn :Map = checkInsByAppointment.get(appointmentEKID, Map());
        if (!checkIn.isEmpty()) {
          const { [DATETIME_START]: workStartDateTime } = getEntityProperties(checkIn, [DATETIME_START]);
          if (workStartDateTime) this.setState({ workStartDateTime });
        }
      });
    }
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
    actions.goToRoute(Routes.PRINT_PARTICIPANT_SCHEDULE.replace(':subjectId', personEKID));
  }

  render() {
    const {
      actions,
      address,
      diversionPlan,
      email,
      enrollmentStatus,
      getAllParticipantInfoRequestState,
      getInitializeAppRequestState,
      participant,
      personCase,
      phone,
      programOutcome,
      violations,
      warnings,
      workAppointmentsByWorksitePlan,
      worksitesByWorksitePlan,
      worksitePlans,
      worksitePlanStatuses,
      worksitesList,
    } = this.props;
    const {
      showAssignWorksiteModal,
      showCheckInDateModal,
      showEnrollmentModal,
      showOrientationDateModal,
      showSentenceDateModal,
      showWorkAppointmentModal,
      workStartDateTime,
      worksiteNamesByWorksitePlan
    } = this.state;

    if (getInitializeAppRequestState === RequestStates.PENDING
        || getAllParticipantInfoRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const personEKID :UUID = getEntityKeyId(participant);
    const {
      [FIRST_NAME]: firstName,
      [PERSON_NOTES]: personNotes
    } = getEntityProperties(participant, [FIRST_NAME, PERSON_NOTES]);
    let { [STATUS]: status } = getEntityProperties(enrollmentStatus, [STATUS]);
    if (!isDefined(status)) status = ENROLLMENT_STATUSES.AWAITING_CHECKIN;

    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    const {
      [CHECK_IN_DATETIME]: checkInDate,
      [DATETIME_RECEIVED]: sentenceDate,
      [ORIENTATION_DATETIME]: orientationDateTime,
      [NOTES]: planNotes,
      [REQUIRED_HOURS]: requiredHours,
    } = getEntityProperties(diversionPlan, [
      CHECK_IN_DATETIME,
      DATETIME_RECEIVED,
      NOTES,
      ORIENTATION_DATETIME,
      REQUIRED_HOURS,
    ]);

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
          <NameRowWrapper>
            <BackNavButton
                onClick={() => {
                  actions.goToRoute(Routes.PARTICIPANTS);
                }}>
              Back to Participants
            </BackNavButton>
          </NameRowWrapper>
          <GeneralInfoSection>
            <ProfileInfoColumnWrapper>
              <ParticipantProfileSection
                  address={address}
                  email={email}
                  person={participant}
                  phone={phone} />
              <PersonNotes
                  notes={personNotes} />
            </ProfileInfoColumnWrapper>
            <ProgramInfoColumnWrapper>
              <EnrollmentStatusSection
                  enrollmentStatus={enrollmentStatus}
                  firstName={firstName}
                  violations={violations}
                  warnings={warnings} />
              <EnrollmentDates
                  checkInDate={checkInDate}
                  orientationDateTime={orientationDateTime}
                  sentenceDateTime={sentenceDate}
                  workStartDateTime={workStartDateTime} />
              <CaseInfoSection
                  personCase={personCase}
                  hours={requiredHours} />
              <ProgramNotes
                  notes={planNotes} />
            </ProgramInfoColumnWrapper>
          </GeneralInfoSection>
          {
            ENROLLMENT_STATUSES_EXCLUDING_PREENROLLMENT.includes(status) && (
              <ProfileBody>
                <NameRowWrapper>
                  <NameHeader>Assigned Work Sites</NameHeader>
                  <Button onClick={() => this.handleShowModal(ASSIGN_WORKSITE)}>Add Work Site</Button>
                </NameRowWrapper>
                {
                  worksitePlans.isEmpty()
                    ? (
                      <Card>
                        <CardSegment>
                          <IconSplash
                              caption="No Assigned Work Sites"
                              icon={faTools}
                              size="3x" />
                        </CardSegment>
                      </Card>
                    )
                    : (
                      <CardStack>
                        {
                          worksitePlans.map((worksitePlan :Map) => {
                            const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
                            const worksite :Map = worksitesByWorksitePlan.get(worksitePlanEKID);
                            const worksitePlanStatus :Map = worksitePlanStatuses.get(worksitePlanEKID);
                            return (
                              <AssignedWorksite
                                  key={worksitePlanEKID}
                                  status={worksitePlanStatus}
                                  worksite={worksite}
                                  worksitePlan={worksitePlan} />
                            );
                          })
                        }
                      </CardStack>
                    )
                }
              </ProfileBody>
            )
          }
          {
            !worksitePlans.isEmpty() && (
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
                <ParticipantWorkSchedule
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
                personEKID={personEKID} />
          </ProfileBody>
          <AddNewPlanStatusModal
              currentStatus={status}
              isOpen={showEnrollmentModal}
              onClose={() => this.handleHideModal(ENROLLMENT)}
              personName={firstName} />
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
          <AddOrientationDateModal
              isOpen={showOrientationDateModal}
              onClose={() => this.handleHideModal(ORIENTATION_DATE)} />
          <EditSentenceDateModal
              isOpen={showSentenceDateModal}
              onClose={() => this.handleHideModal(SENTENCE_DATE)} />
          <EditCheckInDateModal
              isOpen={showCheckInDateModal}
              onClose={() => this.handleHideModal(CHECK_IN_DATE)} />
        </ProfileWrapper>
      </>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const person = state.get(STATE.PERSON);
  const worksites = state.get(STATE.WORKSITES);
  return {
    [ADDRESS]: person.get(ADDRESS),
    app,
    [CHECK_INS_BY_APPOINTMENT]: person.get(CHECK_INS_BY_APPOINTMENT),
    [DIVERSION_PLAN]: person.get(DIVERSION_PLAN),
    [EMAIL]: person.get(EMAIL),
    [ENROLLMENT_STATUS]: person.get(ENROLLMENT_STATUS),
    getAllParticipantInfoRequestState: person.getIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE]),
    getInitializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PERSON_CASE]: person.get(PERSON_CASE),
    [PHONE]: person.get(PHONE),
    [PROGRAM_OUTCOME]: person.get(PROGRAM_OUTCOME),
    [VIOLATIONS]: person.get(VIOLATIONS),
    [WARNINGS]: person.get(WARNINGS),
    [WORK_APPOINTMENTS_BY_WORKSITE_PLAN]: person.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN),
    [WORKSITES_BY_WORKSITE_PLAN]: person.get(WORKSITES_BY_WORKSITE_PLAN),
    [WORKSITE_PLANS]: person.get(WORKSITE_PLANS),
    [WORKSITE_PLAN_STATUSES]: person.get(WORKSITE_PLAN_STATUSES),
    [WORKSITES_LIST]: worksites.get(WORKSITES_LIST),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getAllParticipantInfo,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ParticipantProfile);
