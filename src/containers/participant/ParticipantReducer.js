// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import type { FQN } from 'lattice';

import {
  addInfraction,
  addNewDiversionPlanStatus,
  addOrientationDate,
  addWorksitePlan,
  checkInForAppointment,
  createWorkAppointments,
  deleteAppointment,
  editCaseAndHours,
  editCheckInDate,
  editSentenceDate,
  getAppointmentCheckIns,
  getAllParticipantInfo,
  getCaseInfo,
  getContactInfo,
  getEnrollmentStatus,
  getInfractionTypes,
  getParticipant,
  // getParticipantAddress,
  getParticipantInfractions,
  getWorkAppointments,
  getWorksiteByWorksitePlan,
  getWorksitePlans,
  updateHoursWorked,
} from './ParticipantActions';
import { isDefined } from '../../utils/LangUtils';
import {
  getEntityKeyId,
  getEntityProperties,
  getPropertyFqnFromEdm,
  getPropertyTypeIdFromEdm,
} from '../../utils/DataUtils';
import { PERSON } from '../../utils/constants/ReduxStateConsts';
import { INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  ENROLLMENT_STATUS_FQNS,
  ENTITY_KEY_ID,
  INFRACTION_EVENT_FQNS,
  INFRACTION_FQNS,
  WORKSITE_PLAN_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';

const { WORKSITE_PLAN } = APP_TYPE_FQNS;
const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { TYPE } = INFRACTION_EVENT_FQNS;
const { CATEGORY } = INFRACTION_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;
const {
  ACTIONS,
  ADD_INFRACTION_EVENT,
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADD_ORIENTATION_DATE,
  ADD_WORKSITE_PLAN,
  ADDRESS,
  CHECK_INS_BY_APPOINTMENT,
  CHECK_IN_FOR_APPOINTMENT,
  CREATE_WORK_APPOINTMENTS,
  DELETE_APPOINTMENT,
  DIVERSION_PLAN,
  EDIT_CASE_AND_HOURS,
  EDIT_CHECK_IN_DATE,
  EDIT_SENTENCE_DATE,
  EMAIL,
  ENROLLMENT_STATUS,
  ERRORS,
  GET_APPOINTMENT_CHECK_INS,
  GET_ALL_PARTICIPANT_INFO,
  GET_CASE_INFO,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_STATUS,
  GET_INFRACTION_TYPES,
  GET_PARTICIPANT,
  // GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_INFRACTIONS,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORK_APPOINTMENTS,
  INFRACTIONS_INFO,
  INFRACTION_TYPES,
  PARTICIPANT,
  PERSON_CASE,
  PHONE,
  REQUEST_STATE,
  UPDATE_HOURS_WORKED,
  VIOLATIONS,
  WARNINGS,
  WORKSITES_BY_WORKSITE_PLAN,
  WORKSITE_PLANS,
  WORK_APPOINTMENTS_BY_WORKSITE_PLAN,
} = PERSON;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_INFRACTION_EVENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_NEW_DIVERSION_PLAN_STATUS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_ORIENTATION_DATE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_WORKSITE_PLAN]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [CHECK_IN_FOR_APPOINTMENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [CREATE_WORK_APPOINTMENTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [DELETE_APPOINTMENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_CASE_AND_HOURS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_CHECK_IN_DATE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_SENTENCE_DATE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_APPOINTMENT_CHECK_INS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ALL_PARTICIPANT_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_CASE_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_CONTACT_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ENROLLMENT_STATUS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_INFRACTION_TYPES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    // [GET_PARTICIPANT_ADDRESS]: {
    //   [REQUEST_STATE]: RequestStates.STANDBY
    // },
    [GET_PARTICIPANT_INFRACTIONS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORK_APPOINTMENTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [UPDATE_HOURS_WORKED]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ADDRESS]: '',
  [CHECK_INS_BY_APPOINTMENT]: Map(),
  [DIVERSION_PLAN]: Map(),
  [EMAIL]: '',
  [ENROLLMENT_STATUS]: Map(),
  [ERRORS]: {
    [ADD_INFRACTION_EVENT]: Map(),
    [ADD_NEW_DIVERSION_PLAN_STATUS]: Map(),
    [CHECK_IN_FOR_APPOINTMENT]: Map(),
    [CREATE_WORK_APPOINTMENTS]: Map(),
    [GET_APPOINTMENT_CHECK_INS]: Map(),
    [GET_ALL_PARTICIPANT_INFO]: Map(),
    [GET_CASE_INFO]: Map(),
    [GET_CONTACT_INFO]: Map(),
    [GET_ENROLLMENT_STATUS]: Map(),
    [GET_INFRACTION_TYPES]: Map(),
    [GET_PARTICIPANT]: Map(),
    // [GET_PARTICIPANT_ADDRESS]: Map(),
    [GET_PARTICIPANT_INFRACTIONS]: Map(),
    [UPDATE_HOURS_WORKED]: Map(),
  },
  [INFRACTIONS_INFO]: Map(),
  [INFRACTION_TYPES]: List(),
  [PARTICIPANT]: Map(),
  [PERSON_CASE]: Map(),
  [PHONE]: '',
  [VIOLATIONS]: List(),
  [WARNINGS]: List(),
  [WORKSITES_BY_WORKSITE_PLAN]: Map(),
  [WORKSITE_PLANS]: List(),
  [WORK_APPOINTMENTS_BY_WORKSITE_PLAN]: Map(),
});

export default function participantReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case addInfraction.case(action.type): {

      return addInfraction.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_INFRACTION_EVENT, action.id], action)
          .setIn([ACTIONS, ADD_INFRACTION_EVENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, ADD_INFRACTION_EVENT, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const {
              edm,
              enrollmentStatusESID,
              infractionESID,
              infractionEventEKID,
              infractionEventESID,
              resultsInESID,
              registeredForESID,
              worksitePlanESID,
            } = successValue;

            const requestValue :Object = storedSeqAction.value;
            const { associationEntityData, entityData } :Object = requestValue;

            const storedInfractionEventEntity :Map = fromJS(entityData[infractionEventESID][0]);
            const storedEnrollmentStatusEntity :Map = entityData[enrollmentStatusESID]
              ? fromJS(entityData[enrollmentStatusESID][0])
              : Map();

            const worksitePlan :Map = associationEntityData[resultsInESID]
              ? fromJS(associationEntityData[resultsInESID])
                .find((association :Map) => association.get('srcEntitySetId') === worksitePlanESID)
              : Map();
            const worksitePlanEKID :UUID = worksitePlan ? worksitePlan.get('srcEntityKeyId', '') : '';

            const infraction = associationEntityData[registeredForESID]
              ? fromJS(associationEntityData[registeredForESID])
                .find((association :Map) => association.get('dstEntitySetId') === infractionESID)
              : Map();
            const infractionEKID :UUID = infraction ? infraction.get('dstEntityKeyId', '') : '';

            const newInfractionEvent = Map().withMutations((map) => {
              map.set(ENTITY_KEY_ID, infractionEventEKID);
              storedInfractionEventEntity.forEach((infractionEventValue, id) => {
                const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
                map.set(propertyTypeFqn, infractionEventValue);
              });
            });

            let violations = state.get(VIOLATIONS);
            let warnings = state.get(WARNINGS);
            const { [TYPE]: infractionType } = getEntityProperties(newInfractionEvent, [TYPE]);
            if (infractionType === INFRACTIONS_CONSTS.VIOLATION) violations = violations.push(newInfractionEvent);
            if (infractionType === INFRACTIONS_CONSTS.WARNING) warnings = warnings.push(newInfractionEvent);

            const infractionTypes :List = state.get(INFRACTION_TYPES);
            const infractionEntity = infraction
              ? infractionTypes.find((type :Map) => getEntityKeyId(type) === infractionEKID)
              : Map();
            const { [CATEGORY]: category } = getEntityProperties(infractionEntity, [CATEGORY]);
            const statusPTID = getPropertyTypeIdFromEdm(edm, STATUS);
            const status = storedEnrollmentStatusEntity.getIn([statusPTID, 0], '');
            const info :Map = fromJS({
              [CATEGORY]: category,
              [STATUS]: status,
              [WORKSITE_PLAN]: worksitePlanEKID,
            });
            const infractionsInfo = state.get(INFRACTIONS_INFO)
              .set(infractionEventEKID, info);

            return state
              .set(VIOLATIONS, violations)
              .set(WARNINGS, warnings)
              .set(INFRACTIONS_INFO, infractionsInfo)
              .setIn([ACTIONS, ADD_INFRACTION_EVENT, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .set(INFRACTIONS_INFO, List())
          .setIn([ACTIONS, ADD_INFRACTION_EVENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_INFRACTION_EVENT, action.id]),
      });
    }

    case addNewDiversionPlanStatus.case(action.type): {

      return addNewDiversionPlanStatus.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, action.id], action)
          .setIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, seqAction.id]);

          if (storedSeqAction) {

            const { value } :Object = seqAction;
            const { edm, enrollmentStatusEKID, enrollmentStatusESID } = value;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;
            const storedEnrollmentEntity :Map = fromJS(entityData[enrollmentStatusESID][0]);


            let newEnrollmentStatus :Map = Map();
            storedEnrollmentEntity.forEach((enrollmentValue, id) => {
              const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
              newEnrollmentStatus = newEnrollmentStatus.set(propertyTypeFqn, enrollmentValue);
            });
            newEnrollmentStatus = newEnrollmentStatus.set(ENTITY_KEY_ID, enrollmentStatusEKID);

            return state
              .set(ENROLLMENT_STATUS, newEnrollmentStatus)
              .setIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, action.id]),
      });
    }

    case addOrientationDate.case(action.type): {

      return addOrientationDate.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_ORIENTATION_DATE, action.id], action)
          .setIn([ACTIONS, ADD_ORIENTATION_DATE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, ADD_ORIENTATION_DATE, seqAction.id]);

          if (storedSeqAction) {

            const { value } :Object = seqAction;
            const { diversionPlanESID, edm } = value;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;
            const diversionPlanEKID = Object.keys(entityData[diversionPlanESID])[0];
            const storedPropertyValueMap = entityData[diversionPlanESID][diversionPlanEKID];
            const orientationDatePTID = Object.keys(storedPropertyValueMap)[0];
            const orientationDate = Object.values(storedPropertyValueMap)[0];

            let diversionPlan :Map = state.get(DIVERSION_PLAN);
            const orientationDateTimeFqn :FQN = getPropertyFqnFromEdm(edm, orientationDatePTID);
            diversionPlan = diversionPlan.set(orientationDateTimeFqn, orientationDate);

            return state
              .set(DIVERSION_PLAN, diversionPlan)
              .setIn([ACTIONS, ADD_ORIENTATION_DATE, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_ORIENTATION_DATE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_ORIENTATION_DATE, action.id]),
      });
    }

    case addWorksitePlan.case(action.type): {

      return addWorksitePlan.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_WORKSITE_PLAN, action.id], action)
          .setIn([ACTIONS, ADD_WORKSITE_PLAN, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, ADD_WORKSITE_PLAN, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const {
              basedOnESID,
              edm,
              worksitePlanEKID,
              worksitePlanESID,
              worksitesList
            } = successValue;

            const requestValue :Object = storedSeqAction.value;
            const { associationEntityData, entityData } :Object = requestValue;
            const storedWorksitePlanEntity :Map = fromJS(entityData[worksitePlanESID][0]);
            const worksiteEKID = associationEntityData[basedOnESID][0].dstEntityKeyId;

            let newWorksitePlan :Map = Map();
            storedWorksitePlanEntity.forEach((enrollmentValue, id) => {
              const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
              newWorksitePlan = newWorksitePlan.set(propertyTypeFqn, enrollmentValue);
            });
            newWorksitePlan = newWorksitePlan.set(ENTITY_KEY_ID, worksitePlanEKID);

            const worksitePlans = state.get(WORKSITE_PLANS)
              .push(newWorksitePlan);

            const worksite :Map = worksitesList.find((site :Map) => getEntityKeyId(site) === worksiteEKID);
            const worksitesByWorksitePlan = state.get(WORKSITES_BY_WORKSITE_PLAN)
              .set(worksitePlanEKID[0], worksite);

            return state
              .set(WORKSITE_PLANS, worksitePlans)
              .set(WORKSITES_BY_WORKSITE_PLAN, worksitesByWorksitePlan)
              .setIn([ACTIONS, ADD_WORKSITE_PLAN, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_WORKSITE_PLAN, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_WORKSITE_PLAN, action.id]),
      });
    }

    case checkInForAppointment.case(action.type): {

      return checkInForAppointment.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, action.id], action)
          .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const {
              appointmentEKID,
              checkInDetailsESID,
              checkInEKID,
              checkInESID,
              edm,
            } = successValue;
            const requestValue :Object = storedSeqAction.value;
            const { entityData } = requestValue;

            const storedCheckInEntity :Map = fromJS(entityData[checkInESID][0]);
            const storedCheckInDetailsEntity :Map = fromJS(entityData[checkInDetailsESID][0]);

            let newCheckIn :Map = Map();
            storedCheckInEntity.forEach((value, id) => {
              const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
              newCheckIn = newCheckIn.set(propertyTypeFqn, value);
            });
            newCheckIn = newCheckIn.set(ENTITY_KEY_ID, checkInEKID);
            const hoursWorked :number = storedCheckInDetailsEntity.getIn([HOURS_WORKED, 0]);
            newCheckIn = newCheckIn.set(HOURS_WORKED, hoursWorked);

            let checkInsByAppointment :Map = state.get(CHECK_INS_BY_APPOINTMENT);
            checkInsByAppointment = checkInsByAppointment.set(appointmentEKID, newCheckIn);

            return state
              .set(CHECK_INS_BY_APPOINTMENT, checkInsByAppointment)
              .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state
            .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, CHECK_IN_FOR_APPOINTMENT, action.id])
      });
    }

    case createWorkAppointments.case(action.type): {

      return createWorkAppointments.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, CREATE_WORK_APPOINTMENTS, action.id], action)
          .setIn([ACTIONS, CREATE_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, CREATE_WORK_APPOINTMENTS, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const {
              addressesESID,
              appointmentEKIDs,
              appointmentESID,
              edm,
            } = successValue;
            const requestValue :Object = storedSeqAction.value;
            const { associationEntityData, entityData } :Object = requestValue;

            const worksitePlanEKID :UUID = associationEntityData[addressesESID][0].dstEntityKeyId;

            const storedAppointmentEntities :List = fromJS(entityData[appointmentESID]);
            let newAppointmentEntities :List = List();
            storedAppointmentEntities.forEach((appointment :Map, i :number) => {

              let newAppointment :Map = Map();
              appointment.forEach((value, id) => {
                const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
                newAppointment = newAppointment.set(propertyTypeFqn, value);
              });

              newAppointment = newAppointment.set(ENTITY_KEY_ID, appointmentEKIDs[i]);
              newAppointmentEntities = newAppointmentEntities.push(newAppointment);
            });

            let workAppointmentsByWorksitePlan :Map = state.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN);
            let worksitePlanAppointments :List = workAppointmentsByWorksitePlan.get(worksitePlanEKID, List());

            worksitePlanAppointments = worksitePlanAppointments.concat(newAppointmentEntities);
            workAppointmentsByWorksitePlan = workAppointmentsByWorksitePlan
              .set(worksitePlanEKID, worksitePlanAppointments);

            return state
              .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, workAppointmentsByWorksitePlan)
              .setIn([ACTIONS, CREATE_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, CREATE_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, CREATE_WORK_APPOINTMENTS, action.id])
      });
    }

    case deleteAppointment.case(action.type): {

      return deleteAppointment.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, DELETE_APPOINTMENT, action.id], action)
          .setIn([ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, DELETE_APPOINTMENT, seqAction.id]);

          if (storedSeqAction) {

            const requestValue :Object = storedSeqAction.value;
            const { entityKeyId } :Object = requestValue[0];

            let workAppointmentsByWorksitePlan = state.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN);
            let worksitePlanEKID = '';
            let indexToDelete = -1;
            workAppointmentsByWorksitePlan.forEach((appointments :List, ekid :UUID) => {
              const targetIndex :number = appointments.findIndex(
                (appointment :Map) => getEntityKeyId(appointment) === entityKeyId
              );
              if (targetIndex !== -1) {
                worksitePlanEKID = ekid;
                indexToDelete = targetIndex;
                return false;
              }
              return true;
            });
            if (indexToDelete !== -1) {
              workAppointmentsByWorksitePlan = workAppointmentsByWorksitePlan
                .deleteIn([worksitePlanEKID, indexToDelete]);
              return state
                .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, workAppointmentsByWorksitePlan)
                .setIn([ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
            }
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, DELETE_APPOINTMENT, action.id]),
      });
    }

    case editCaseAndHours.case(action.type): {

      return editCaseAndHours.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_CASE_AND_HOURS, action.id], action)
          .setIn([ACTIONS, EDIT_CASE_AND_HOURS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, EDIT_CASE_AND_HOURS, seqAction.id]);

          if (storedSeqAction) {

            const { value } :Object = seqAction;
            const { caseESID, diversionPlanESID, edm } = value;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;

            let diversionPlan :Map = state.get(DIVERSION_PLAN);
            let personCase :Map = state.get(PERSON_CASE);

            if (entityData[diversionPlanESID]) {
              const diversionPlanEKID = Object.keys(entityData[diversionPlanESID])[0];
              const storedPropertyValueMap = entityData[diversionPlanESID][diversionPlanEKID];
              const requiredHours = Object.values(storedPropertyValueMap)[0];

              let requiredHoursPlaceholder = diversionPlan.get(REQUIRED_HOURS, 0);
              requiredHoursPlaceholder = requiredHours[0];
              diversionPlan = diversionPlan.set(REQUIRED_HOURS, requiredHoursPlaceholder);
            }

            if (entityData[caseESID]) {
              const caseEKID = Object.keys(entityData[caseESID])[0];
              const storedPropertyValueMaps = entityData[caseESID][caseEKID];

              const caseNumberTextPTID :UUID = getPropertyTypeIdFromEdm(edm, CASE_NUMBER_TEXT);
              const courtCaseTypePTID :UUID = getPropertyTypeIdFromEdm(edm, COURT_CASE_TYPE);

              if (storedPropertyValueMaps[caseNumberTextPTID]) {
                const newCaseNumber = Object.values(storedPropertyValueMaps[caseNumberTextPTID]);
                let caseNumberPlaceholder = personCase.get(CASE_NUMBER_TEXT, '');
                caseNumberPlaceholder = newCaseNumber;
                personCase = personCase.set(CASE_NUMBER_TEXT, caseNumberPlaceholder);
              }
              if (storedPropertyValueMaps[courtCaseTypePTID]) {
                const newCourtType = Object.values(storedPropertyValueMaps[courtCaseTypePTID]);
                let courtTypePlaceholder = personCase.get(COURT_CASE_TYPE, '');
                courtTypePlaceholder = newCourtType;
                personCase = personCase.set(COURT_CASE_TYPE, courtTypePlaceholder);
              }
            }

            return state
              .set(PERSON_CASE, personCase)
              .set(DIVERSION_PLAN, diversionPlan)
              .setIn([ACTIONS, EDIT_CASE_AND_HOURS, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_CASE_AND_HOURS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_CASE_AND_HOURS, action.id]),
      });
    }

    case editCheckInDate.case(action.type): {

      return editCheckInDate.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_CHECK_IN_DATE, action.id], action)
          .setIn([ACTIONS, EDIT_CHECK_IN_DATE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, EDIT_CHECK_IN_DATE, seqAction.id]);

          if (storedSeqAction) {

            const { value } :Object = seqAction;
            const { diversionPlanESID, edm } = value;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;
            const diversionPlanEKID = Object.keys(entityData[diversionPlanESID])[0];
            const storedPropertyValueMap = entityData[diversionPlanESID][diversionPlanEKID];
            const checkInDatePTID = Object.keys(storedPropertyValueMap)[0];
            const checkInDate = Object.values(storedPropertyValueMap)[0];

            let diversionPlan :Map = state.get(DIVERSION_PLAN);
            const sentenceDateTimeFqn :FQN = getPropertyFqnFromEdm(edm, checkInDatePTID);
            diversionPlan = diversionPlan.set(sentenceDateTimeFqn, checkInDate);

            return state
              .set(DIVERSION_PLAN, diversionPlan)
              .setIn([ACTIONS, EDIT_CHECK_IN_DATE, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_CHECK_IN_DATE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_CHECK_IN_DATE, action.id]),
      });
    }

    case editSentenceDate.case(action.type): {

      return editSentenceDate.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_SENTENCE_DATE, action.id], action)
          .setIn([ACTIONS, EDIT_SENTENCE_DATE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, EDIT_SENTENCE_DATE, seqAction.id]);

          if (storedSeqAction) {

            const { value } :Object = seqAction;
            const { diversionPlanESID, edm } = value;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;
            const diversionPlanEKID = Object.keys(entityData[diversionPlanESID])[0];
            const storedPropertyValueMap = entityData[diversionPlanESID][diversionPlanEKID];
            const sentenceDatePTID = Object.keys(storedPropertyValueMap)[0];
            const sentenceDate = Object.values(storedPropertyValueMap)[0];

            let diversionPlan :Map = state.get(DIVERSION_PLAN);
            const sentenceDateTimeFqn :FQN = getPropertyFqnFromEdm(edm, sentenceDatePTID);
            diversionPlan = diversionPlan.set(sentenceDateTimeFqn, sentenceDate);

            return state
              .set(DIVERSION_PLAN, diversionPlan)
              .setIn([ACTIONS, EDIT_SENTENCE_DATE, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_SENTENCE_DATE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_SENTENCE_DATE, action.id]),
      });
    }

    case getAppointmentCheckIns.case(action.type): {

      return getAppointmentCheckIns.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(CHECK_INS_BY_APPOINTMENT, value)
            .setIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(CHECK_INS_BY_APPOINTMENT, Map())
            .setIn([ERRORS, GET_APPOINTMENT_CHECK_INS], value)
            .setIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_APPOINTMENT_CHECK_INS, action.id])
      });
    }

    case getAllParticipantInfo.case(action.type): {

      return getAllParticipantInfo.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, action.id])) {
            return state;
          }

          return state
            .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .setIn([ERRORS, GET_ALL_PARTICIPANT_INFO], value)
            .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, action.id])
      });
    }

    case getCaseInfo.case(action.type): {

      return getCaseInfo.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_CASE_INFO, action.id], fromJS(action))
          .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_CASE_INFO, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(PERSON_CASE, value)
            .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;
          return state
            .set(PERSON_CASE, Map())
            .setIn([ERRORS, GET_CASE_INFO], value)
            .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_CASE_INFO, action.id])
      });
    }

    case getContactInfo.case(action.type): {

      return getContactInfo.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_CONTACT_INFO, action.id], fromJS(action))
          .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_CONTACT_INFO, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(EMAIL, value.get('email'))
            .set(PHONE, value.get('phone'))
            .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(EMAIL, '')
            .set(PHONE, '')
            .setIn([ERRORS, GET_CONTACT_INFO], value)
            .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_CONTACT_INFO, action.id])
      });
    }

    case getEnrollmentStatus.case(action.type): {

      return getEnrollmentStatus.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_STATUS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ENROLLMENT_STATUS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(ENROLLMENT_STATUS, value.enrollmentStatus)
            .set(DIVERSION_PLAN, value.diversionPlan)
            .setIn([ACTIONS, GET_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(ENROLLMENT_STATUS, Map())
            .setIn([ERRORS, GET_ENROLLMENT_STATUS], value)
            .setIn([ACTIONS, GET_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_ENROLLMENT_STATUS, action.id])
      });
    }

    case getInfractionTypes.case(action.type): {

      return getInfractionTypes.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_INFRACTION_TYPES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_INFRACTION_TYPES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_INFRACTION_TYPES, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(INFRACTION_TYPES, value)
            .setIn([ACTIONS, GET_INFRACTION_TYPES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(INFRACTION_TYPES, List())
            .setIn([ERRORS, GET_INFRACTION_TYPES], value)
            .setIn([ACTIONS, GET_INFRACTION_TYPES, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_INFRACTION_TYPES, action.id])
      });
    }

    case getParticipantInfractions.case(action.type): {

      return getParticipantInfractions.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }
          const { infractionInfoMap, infractionsMap } = value;

          return state
            .set(VIOLATIONS, infractionsMap.get(INFRACTIONS_CONSTS.VIOLATION))
            .set(WARNINGS, infractionsMap.get(INFRACTIONS_CONSTS.WARNING))
            .set(INFRACTIONS_INFO, infractionInfoMap)
            .setIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(VIOLATIONS, Map())
            .set(WARNINGS, Map())
            .setIn([ERRORS, GET_PARTICIPANT_INFRACTIONS], value)
            .setIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT_INFRACTIONS, action.id])
      });
    }

    case getParticipant.case(action.type): {

      return getParticipant.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_PARTICIPANT, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(PARTICIPANT, value)
            .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(PARTICIPANT, Map())
            .setIn([ERRORS, GET_PARTICIPANT], value)
            .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT, action.id])
      });
    }

    // case getParticipantAddress.case(action.type): {
    //
    //   return getParticipantAddress.reducer(state, action, {
    //
    //     REQUEST: () => state
    //       .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, action.id], fromJS(action))
    //       .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, REQUEST_STATE], RequestStates.PENDING),
    //     SUCCESS: () => {
    //
    //       if (!state.hasIn([ACTIONS, GET_PARTICIPANT_ADDRESS, action.id])) {
    //         return state;
    //       }
    //
    //       const { value } = action;
    //       if (value === null || value === undefined) {
    //         return state;
    //       }
    //
    //       return state
    //         .set(ADDRESS, value)
    //         .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, REQUEST_STATE], RequestStates.SUCCESS);
    //     },
    //     FAILURE: () => {
    //
    //       const { value } = action;
    //
    //       return state
    //         .set(ADDRESS, '')
    //         .setIn([ERRORS, GET_PARTICIPANT_ADDRESS], value)
    //         .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, REQUEST_STATE], RequestStates.FAILURE);
    //     },
    //     FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT_ADDRESS, action.id])
    //   });
    // }

    case getWorkAppointments.case(action.type): {

      return getWorkAppointments.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORK_APPOINTMENTS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORK_APPOINTMENTS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, value)
            .setIn([ACTIONS, GET_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, Map())
            .setIn([ERRORS, GET_WORK_APPOINTMENTS], value)
            .setIn([ACTIONS, GET_WORK_APPOINTMENTS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORK_APPOINTMENTS, action.id])
      });
    }

    case getWorksitePlans.case(action.type): {

      return getWorksitePlans.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_PLANS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE_PLANS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORKSITE_PLANS, value)
            .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(WORKSITE_PLANS, Map())
            .setIn([ERRORS, GET_WORKSITE_PLANS], value)
            .setIn([ACTIONS, GET_WORKSITE_PLANS, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_PLANS, action.id])
      });
    }

    case getWorksiteByWorksitePlan.case(action.type): {

      return getWorksiteByWorksitePlan.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORKSITES_BY_WORKSITE_PLAN, value)
            .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(WORKSITES_BY_WORKSITE_PLAN, Map())
            .setIn([ERRORS, GET_WORKSITE_BY_WORKSITE_PLAN], value)
            .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, action.id])
      });
    }

    case updateHoursWorked.case(action.type): {

      return updateHoursWorked.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, UPDATE_HOURS_WORKED, action.id], action)
          .setIn([ACTIONS, UPDATE_HOURS_WORKED, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, UPDATE_HOURS_WORKED, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          const worksitePlanEKID :UUID = getEntityKeyId(value);
          let worksitePlans :List = state.get(WORKSITE_PLANS);
          const worksitePlanToReplace :number = worksitePlans
            .findKey((worksitePlan :Map) => worksitePlanEKID === getEntityKeyId(worksitePlan));
          worksitePlans = worksitePlans.set(worksitePlanToReplace, value);

          return state
            .set(WORKSITE_PLANS, worksitePlans)
            .setIn([ACTIONS, GET_WORKSITE_BY_WORKSITE_PLAN, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(WORKSITE_PLANS, List())
          .setIn([ACTIONS, UPDATE_HOURS_WORKED, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, UPDATE_HOURS_WORKED, action.id]),
      });
    }

    default:
      return state;
  }
}
