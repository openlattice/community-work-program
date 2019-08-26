// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button, Card, CardSegment } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import GeneralInfo from '../../components/participant/GeneralInfo';
import KeyDates from '../../components/participant/KeyDates';
import CaseInfo from '../../components/participant/CaseInfo';
import ParticipantWorkSchedule from './schedule/ParticipantWorkSchedule';
import PlanNotes from '../../components/participant/PlanNotes';

import AssignedWorksitesContainer from './assignedworksites/AssignedWorksitesContainer';
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

const { DATETIME_RECEIVED, NOTES, ORIENTATION_DATETIME } = DIVERSION_PLAN_FQNS;
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { FIRST_NAME, LAST_NAME } = PEOPLE_FQNS;
const { NAME } = WORKSITE_FQNS;
const {
  ACTIONS,
  ADDRESS,
  CASE_NUMBER,
  CHECK_IN_DATE,
  CHECK_INS_BY_APPOINTMENT,
  DIVERSION_PLAN,
  EMAIL,
  ENROLLMENT_STATUS,
  GET_ALL_PARTICIPANT_INFO,
  PARTICIPANT,
  PHONE,
  REQUEST_STATE,
  REQUIRED_HOURS,
  VIOLATIONS,
  WARNINGS,
  WORK_APPOINTMENTS_BY_WORKSITE_PLAN,
  WORKSITES_BY_WORKSITE_PLAN,
  WORKSITE_PLANS,
} = PERSON;
const { WORKSITES_LIST } = WORKSITES;

const ENROLLMENT_STATUSES_EXCLUDING_PREENROLLMENT = Object.values(ENROLLMENT_STATUSES)
  .filter(status => status !== ENROLLMENT_STATUSES.AWAITING_CHECKIN
    && status !== ENROLLMENT_STATUSES.AWAITING_ORIENTATION);

const ProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  width: ${PARTICIPANT_PROFILE_WIDTH}px;
  margin-top: 30px;
  position: relative;
`;

const ProfileBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  overflow-y: auto;
  width: 100%;
  margin-bottom: 30px;
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

const BasicInfoWrapper = styled.div`
  margin-top: 15px;
  width: 100%;
  height: 500px;
  display: flex;
  justify-content: space-between;
`;

const InnerColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 610px;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 0 10px;
`;

type Props = {
  actions:{
    getAllParticipantInfo :RequestSequence;
    goToRoute :RequestSequence;
  };
  address :string;
  app :Map;
  caseNumber :string;
  checkInDate :string;
  checkInsByAppointment :Map;
  diversionPlan :Map;
  email :string;
  enrollmentStatus :Map;
  getAllParticipantInfoRequestState :RequestState;
  getInitializeAppRequestState :RequestState;
  participant :Map;
  personEKID :string;
  phone :string;
  requiredHours :number;
  violations :List;
  warnings :List;
  workAppointmentsByWorksitePlan :Map;
  worksitesByWorksitePlan :Map;
  worksitePlans :List;
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
      showAssignWorksiteModal: false,
      showCheckInDateModal: false,
      showEnrollmentModal: false,
      showOrientationDateModal: false,
      showSentenceDateModal: false,
      showWorkAppointmentModal: false,
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

  handleShowEnrollmentModal = () => {
    this.setState({
      showEnrollmentModal: true
    });
  }

  handleHideEnrollmentModal = () => {
    this.setState({
      showEnrollmentModal: false
    });
  }

  handleShowAssignWorksiteModal = () => {
    this.setState({
      showAssignWorksiteModal: true
    });
  }

  handleHideAssignWorksiteModal = () => {
    this.setState({
      showAssignWorksiteModal: false
    });
  }

  handleShowWorkAppointmentModal = () => {
    this.setState({
      showWorkAppointmentModal: true
    });
  }

  handleHideWorkAppointmentModal = () => {
    this.setState({
      showWorkAppointmentModal: false
    });
  }

  handleShowOrientationDateModal = () => {
    this.setState({
      showOrientationDateModal: true
    });
  }

  handleHideOrientationDateModal = () => {
    this.setState({
      showOrientationDateModal: false
    });
  }

  handleShowSentenceDateModal = () => {
    this.setState({
      showSentenceDateModal: true
    });
  }

  handleHideSentenceDateModal = () => {
    this.setState({
      showSentenceDateModal: false
    });
  }

  handleShowCheckInDateModal = () => {
    this.setState({
      showCheckInDateModal: true
    });
  }

  handleHideCheckInDateModal = () => {
    this.setState({
      showCheckInDateModal: false
    });
  }

  render() {
    const {
      actions,
      address,
      caseNumber,
      checkInDate,
      diversionPlan,
      email,
      enrollmentStatus,
      getAllParticipantInfoRequestState,
      getInitializeAppRequestState,
      participant,
      phone,
      requiredHours,
      violations,
      warnings,
      workAppointmentsByWorksitePlan,
      worksitesByWorksitePlan,
      worksitePlans,
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
    const { [FIRST_NAME]: firstName } = getEntityProperties(
      participant, [FIRST_NAME, LAST_NAME]
    );
    let { [STATUS]: status } = getEntityProperties(enrollmentStatus, [STATUS]);
    if (!isDefined(status)) status = ENROLLMENT_STATUSES.AWAITING_CHECKIN;

    const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
    const {
      [DATETIME_RECEIVED]: sentenceDate,
      [ORIENTATION_DATETIME]: orientationDateTime,
      [NOTES]: planNotes
    } = getEntityProperties(diversionPlan, [DATETIME_RECEIVED, NOTES, ORIENTATION_DATETIME]);

    const orientationDateAlreadyRecorded :boolean = isDefined(diversionPlan.get(ORIENTATION_DATETIME));
    const addOrEditButtonText :string = orientationDateAlreadyRecorded
      ? 'Edit Orientation Date'
      : 'Add Orientation Date';
    return (
      <ProfileWrapper>
        <ProfileBody>
          <NameRowWrapper>
            <BackNavButton
                onClick={() => {
                  actions.goToRoute(Routes.PARTICIPANTS);
                }}>
              Back to Participants
            </BackNavButton>
            <ButtonsWrapper>
              <Button onClick={this.handleShowSentenceDateModal}>Edit Sentence Date</Button>
              <Button onClick={this.handleShowCheckInDateModal}>Edit Check-In Date</Button>
              <Button onClick={this.handleShowOrientationDateModal}>{ addOrEditButtonText }</Button>
              <Button mode="primary" onClick={this.handleShowEnrollmentModal}>
                Change Enrollment Status
              </Button>
            </ButtonsWrapper>
          </NameRowWrapper>
          <BasicInfoWrapper>
            <GeneralInfo
                address={address}
                email={email}
                person={participant}
                phone={phone}
                status={status} />
            <InnerColumnWrapper>
              <KeyDates
                  checkInDate={checkInDate}
                  orientationDateTime={orientationDateTime}
                  sentenceDateTime={sentenceDate}
                  workStartDateTime={workStartDateTime} />
              <CaseInfo
                  caseNumber={caseNumber}
                  hours={requiredHours}
                  warnings={warnings}
                  violations={violations} />
              <PlanNotes
                  notes={planNotes} />
            </InnerColumnWrapper>
          </BasicInfoWrapper>
        </ProfileBody>
        {
          ENROLLMENT_STATUSES_EXCLUDING_PREENROLLMENT.includes(status)
            ? (
              <ProfileBody>
                <NameRowWrapper>
                  <NameHeader>Assigned Work Sites</NameHeader>
                  <Button onClick={this.handleShowAssignWorksiteModal}>Add Work Site</Button>
                </NameRowWrapper>
                <AssignedWorksitesContainer
                    worksitePlans={worksitePlans}
                    worksitesByWorksitePlan={worksitesByWorksitePlan} />
              </ProfileBody>
            )
            : null
        }
        <ProfileBody>
          <NameRowWrapper>
            <NameHeader>Work Schedule</NameHeader>
            <Button onClick={this.handleShowWorkAppointmentModal}>Create Appointment</Button>
          </NameRowWrapper>
          <ParticipantWorkSchedule
              workAppointmentsByWorksitePlan={workAppointmentsByWorksitePlan}
              worksitesByWorksitePlan={worksitesByWorksitePlan}
              worksiteNamesByWorksitePlan={worksiteNamesByWorksitePlan} />
        </ProfileBody>
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
            onClose={this.handleHideEnrollmentModal}
            personName={firstName} />
        <AssignWorksiteModal
            diversionPlanEKID={diversionPlanEKID}
            isOpen={showAssignWorksiteModal}
            onClose={this.handleHideAssignWorksiteModal}
            personEKID={personEKID}
            worksites={worksitesList} />
        <CreateWorkAppointmentModal
            isOpen={showWorkAppointmentModal}
            onClose={this.handleHideWorkAppointmentModal}
            personEKID={personEKID} />
        <AddOrientationDateModal
            isOpen={showOrientationDateModal}
            onClose={this.handleHideOrientationDateModal} />
        <EditSentenceDateModal
            isOpen={showSentenceDateModal}
            onClose={this.handleHideSentenceDateModal} />
        <EditCheckInDateModal
            isOpen={showCheckInDateModal}
            onClose={this.handleHideCheckInDateModal} />
      </ProfileWrapper>
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
    [CASE_NUMBER]: person.get(CASE_NUMBER),
    [CHECK_IN_DATE]: person.get(CHECK_IN_DATE),
    [CHECK_INS_BY_APPOINTMENT]: person.get(CHECK_INS_BY_APPOINTMENT),
    [DIVERSION_PLAN]: person.get(DIVERSION_PLAN),
    [EMAIL]: person.get(EMAIL),
    [ENROLLMENT_STATUS]: person.get(ENROLLMENT_STATUS),
    getAllParticipantInfoRequestState: person.getIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE]),
    getInitializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [PARTICIPANT]: person.get(PARTICIPANT),
    [PHONE]: person.get(PHONE),
    [REQUIRED_HOURS]: person.get(REQUIRED_HOURS),
    [VIOLATIONS]: person.get(VIOLATIONS),
    [WARNINGS]: person.get(WARNINGS),
    [WORK_APPOINTMENTS_BY_WORKSITE_PLAN]: person.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN),
    [WORKSITES_BY_WORKSITE_PLAN]: person.get(WORKSITES_BY_WORKSITE_PLAN),
    [WORKSITE_PLANS]: person.get(WORKSITE_PLANS),
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
