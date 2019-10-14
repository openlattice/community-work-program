// @flow
import {
  List,
  Map,
  fromJS,
  getIn,
} from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import type { FQN } from 'lattice';

import {
  addChargesToCase,
  addInfraction,
  addNewDiversionPlanStatus,
  addNewParticipantContacts,
  addToAvailableCharges,
  addWorksitePlan,
  checkInForAppointment,
  createWorkAppointments,
  deleteAppointment,
  editAppointment,
  editEnrollmentDates,
  editParticipantContacts,
  editPersonCase,
  editPersonDetails,
  editPersonNotes,
  editPlanNotes,
  editRequiredHours,
  editWorksitePlan,
  getAllParticipantInfo,
  getAppointmentCheckIns,
  getCaseInfo,
  getCharges,
  getChargesForCase,
  getContactInfo,
  getEnrollmentFromDiversionPlan,
  getEnrollmentStatus,
  getInfoForEditCase,
  getInfoForEditPerson,
  getInfractionTypes,
  getJudgeForCase,
  getJudges,
  getParticipant,
  getParticipantAddress,
  getParticipantInfractions,
  getProgramOutcome,
  getWorkAppointments,
  getWorksiteByWorksitePlan,
  getWorksitePlanStatuses,
  getWorksitePlans,
  markDiversionPlanAsComplete,
  reassignJudge,
  removeChargeFromCase,
  updateHoursWorked,
} from './ParticipantActions';
import {
  findEntityPathInMap,
  getEntityKeyId,
  getEntityProperties,
  getPropertyFqnFromEdm,
  getPropertyTypeIdFromEdm,
} from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import { PERSON } from '../../utils/constants/ReduxStateConsts';
import { INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import {
  APP_TYPE_FQNS,
  CASE_FQNS,
  DATETIME_END,
  DIVERSION_PLAN_FQNS,
  ENROLLMENT_STATUS_FQNS,
  ENTITY_KEY_ID,
  INCIDENT_START_DATETIME,
  INFRACTION_EVENT_FQNS,
  INFRACTION_FQNS,
  PEOPLE_FQNS,
  WORKSITE_PLAN_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';

const { COURT_CHARGE_LIST, WORKSITE_PLAN } = APP_TYPE_FQNS;
const {
  CHECK_IN_DATETIME,
  COMPLETED,
  DATETIME_RECEIVED,
  ORIENTATION_DATETIME,
} = DIVERSION_PLAN_FQNS;
const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;
const { NOTES } = DIVERSION_PLAN_FQNS;
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { TYPE } = INFRACTION_EVENT_FQNS;
const { CATEGORY } = INFRACTION_FQNS;
const { PERSON_NOTES } = PEOPLE_FQNS;
const { HOURS_WORKED, REQUIRED_HOURS } = WORKSITE_PLAN_FQNS;
const {
  ACTIONS,
  ADD_CHARGES_TO_CASE,
  ADD_INFRACTION_EVENT,
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADD_NEW_PARTICIPANT_CONTACTS,
  ADD_TO_AVAILABLE_CHARGES,
  ADD_WORKSITE_PLAN,
  ADDRESS,
  ALL_DIVERSION_PLANS,
  CHARGES,
  CHARGES_FOR_CASE,
  CHECK_INS_BY_APPOINTMENT,
  CHECK_IN_FOR_APPOINTMENT,
  CREATE_WORK_APPOINTMENTS,
  DELETE_APPOINTMENT,
  DIVERSION_PLAN,
  EDIT_APPOINTMENT,
  EDIT_ENROLLMENT_DATES,
  EDIT_PARTICIPANT_CONTACTS,
  EDIT_PERSON_CASE,
  EDIT_PERSON_DETAILS,
  EDIT_PERSON_NOTES,
  EDIT_PLAN_NOTES,
  EDIT_REQUIRED_HOURS,
  EDIT_WORKSITE_PLAN,
  EMAIL,
  ENROLLMENT_STATUS,
  ERRORS,
  GET_APPOINTMENT_CHECK_INS,
  GET_ALL_PARTICIPANT_INFO,
  GET_CASE_INFO,
  GET_CHARGES,
  GET_CHARGES_FOR_CASE,
  GET_CONTACT_INFO,
  GET_ENROLLMENT_FROM_DIVERSION_PLAN,
  GET_ENROLLMENT_STATUS,
  GET_INFO_FOR_EDIT_CASE,
  GET_INFO_FOR_EDIT_PERSON,
  GET_INFRACTION_TYPES,
  GET_JUDGE_FOR_CASE,
  GET_JUDGES,
  GET_PARTICIPANT,
  GET_PARTICIPANT_ADDRESS,
  GET_PARTICIPANT_INFRACTIONS,
  GET_PROGRAM_OUTCOME,
  GET_WORKSITE_BY_WORKSITE_PLAN,
  GET_WORKSITE_PLANS,
  GET_WORKSITE_PLAN_STATUSES,
  GET_WORK_APPOINTMENTS,
  INFRACTIONS_INFO,
  INFRACTION_TYPES,
  JUDGE,
  JUDGES,
  MARK_DIVERSION_PLAN_AS_COMPLETE,
  PARTICIPANT,
  PERSON_CASE,
  PHONE,
  PROGRAM_OUTCOME,
  REASSIGN_JUDGE,
  REMOVE_CHARGE_FROM_CASE,
  REQUEST_STATE,
  UPDATE_HOURS_WORKED,
  VIOLATIONS,
  WARNINGS,
  WORKSITES_BY_WORKSITE_PLAN,
  WORKSITE_PLANS,
  WORKSITE_PLAN_STATUSES,
  WORK_APPOINTMENTS_BY_WORKSITE_PLAN,
} = PERSON;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_CHARGES_TO_CASE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_INFRACTION_EVENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_NEW_DIVERSION_PLAN_STATUS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_TO_AVAILABLE_CHARGES]: {
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
    [EDIT_APPOINTMENT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_ENROLLMENT_DATES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_PERSON_CASE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_PERSON_DETAILS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_PERSON_NOTES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_PLAN_NOTES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_REQUIRED_HOURS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [EDIT_WORKSITE_PLAN]: {
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
    [GET_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_CHARGES_FOR_CASE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_CONTACT_INFO]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ENROLLMENT_FROM_DIVERSION_PLAN]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ENROLLMENT_STATUS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_INFO_FOR_EDIT_CASE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_INFO_FOR_EDIT_PERSON]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_INFRACTION_TYPES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_JUDGE_FOR_CASE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_JUDGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PROGRAM_OUTCOME]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [MARK_DIVERSION_PLAN_AS_COMPLETE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT_ADDRESS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_PARTICIPANT_INFRACTIONS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORK_APPOINTMENTS]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_WORKSITE_PLAN_STATUSES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [REASSIGN_JUDGE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [UPDATE_HOURS_WORKED]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ADDRESS]: Map(),
  [ALL_DIVERSION_PLANS]: List(),
  [CHARGES]: List(),
  [CHARGES_FOR_CASE]: List(),
  [CHECK_INS_BY_APPOINTMENT]: Map(),
  [DIVERSION_PLAN]: Map(),
  [EMAIL]: Map(),
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
    [GET_PARTICIPANT_INFRACTIONS]: Map(),
    [UPDATE_HOURS_WORKED]: Map(),
  },
  [INFRACTIONS_INFO]: Map(),
  [INFRACTION_TYPES]: List(),
  [JUDGE]: Map(),
  [JUDGES]: List(),
  [PARTICIPANT]: Map(),
  [PERSON_CASE]: Map(),
  [PHONE]: Map(),
  [PROGRAM_OUTCOME]: Map(),
  [VIOLATIONS]: List(),
  [WARNINGS]: List(),
  [WORKSITES_BY_WORKSITE_PLAN]: Map(),
  [WORKSITE_PLANS]: List(),
  [WORKSITE_PLAN_STATUSES]: Map(),
  [WORK_APPOINTMENTS_BY_WORKSITE_PLAN]: Map(),
});

export default function participantReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

    case addChargesToCase.case(action.type): {

      return addChargesToCase.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_CHARGES_TO_CASE, action.id], action)
          .setIn([ACTIONS, ADD_CHARGES_TO_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;

          const successValue :Object = seqAction.value;
          const { chargeEKIDs } = successValue;
          let { newChargeMaps } = successValue;

          const charges :List = state.get(CHARGES);
          chargeEKIDs.forEach((chargeEKID :UUID, index :number) => {
            const chargeEntity :Map = charges.find((charge :Map) => getEntityKeyId(charge) === chargeEKID);
            let chargeMap :Map = newChargeMaps.get(index);
            chargeMap = chargeMap.set(COURT_CHARGE_LIST, chargeEntity);
            newChargeMaps = newChargeMaps.set(index, chargeMap);
          });

          let existingChargesForCase :List = state.get(CHARGES_FOR_CASE);
          existingChargesForCase = existingChargesForCase.concat(newChargeMaps);

          return state
            .set(CHARGES_FOR_CASE, existingChargesForCase)
            .setIn([ACTIONS, ADD_CHARGES_TO_CASE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(CHARGES_FOR_CASE, List())
          .setIn([ACTIONS, ADD_CHARGES_TO_CASE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_CHARGES_TO_CASE, action.id]),
      });
    }

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
            const {
              edm,
              enrollmentStatusEKID,
              enrollmentStatusESID,
              programOutcomeEKID,
              programOutcomeESID,
            } = value;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;
            const storedEnrollmentEntity :Map = fromJS(entityData[enrollmentStatusESID][0]);
            const storedProgramOutcomeEntity :Map = entityData[programOutcomeESID]
              ? fromJS(entityData[programOutcomeESID][0])
              : Map();

            let newEnrollmentStatus :Map = Map();
            storedEnrollmentEntity.forEach((enrollmentValue, id) => {
              const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
              newEnrollmentStatus = newEnrollmentStatus.set(propertyTypeFqn, enrollmentValue);
            });
            newEnrollmentStatus = newEnrollmentStatus.set(ENTITY_KEY_ID, enrollmentStatusEKID);

            let programOutcome :Map = state.get(PROGRAM_OUTCOME, Map());
            if (!storedProgramOutcomeEntity.isEmpty()) {

              storedProgramOutcomeEntity.forEach((outcomeValue, id) => {
                const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
                programOutcome = programOutcome.set(propertyTypeFqn, outcomeValue);
              });
              programOutcome = programOutcome.set(ENTITY_KEY_ID, programOutcomeEKID);
            }

            return state
              .set(ENROLLMENT_STATUS, newEnrollmentStatus)
              .set(PROGRAM_OUTCOME, programOutcome)
              .setIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_NEW_DIVERSION_PLAN_STATUS, action.id]),
      });
    }

    case addNewParticipantContacts.case(action.type): {

      return addNewParticipantContacts.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_NEW_PARTICIPANT_CONTACTS, action.id], action)
          .setIn([ACTIONS, ADD_NEW_PARTICIPANT_CONTACTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const successValue :Object = seqAction.value;
          const { newAddress, newPhone, newEmail } = successValue;

          return state
            .set(ADDRESS, newAddress)
            .set(PHONE, newPhone)
            .set(EMAIL, newEmail)
            .setIn([ACTIONS, ADD_NEW_PARTICIPANT_CONTACTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(ADDRESS, Map())
          .set(PHONE, Map())
          .set(EMAIL, Map())
          .setIn([ACTIONS, ADD_NEW_PARTICIPANT_CONTACTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_NEW_PARTICIPANT_CONTACTS, action.id]),
      });
    }

    case addToAvailableCharges.case(action.type): {

      return addToAvailableCharges.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_TO_AVAILABLE_CHARGES, action.id], action)
          .setIn([ACTIONS, ADD_TO_AVAILABLE_CHARGES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const successValue :Object = seqAction.value;
          const { newCharge } = successValue;

          let charges = state.get(CHARGES);
          charges = charges.push(newCharge);

          return state
            .set(CHARGES, charges)
            .setIn([ACTIONS, ADD_TO_AVAILABLE_CHARGES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_TO_AVAILABLE_CHARGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_TO_AVAILABLE_CHARGES, action.id]),
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
            const hoursWorkedPTID :UUID = getPropertyTypeIdFromEdm(edm, HOURS_WORKED);
            const hoursWorked :number = storedCheckInDetailsEntity.getIn([hoursWorkedPTID, 0]);
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

            const [keyEKID, index] = findEntityPathInMap(workAppointmentsByWorksitePlan, entityKeyId);
            if (index !== -1) {
              workAppointmentsByWorksitePlan = workAppointmentsByWorksitePlan
                .deleteIn([keyEKID, index]);
              return state
                .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, workAppointmentsByWorksitePlan)
                .setIn([ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
            }
          }

          return state
            .setIn([ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, DELETE_APPOINTMENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, DELETE_APPOINTMENT, action.id]),
      });
    }

    case editParticipantContacts.case(action.type): {

      return editParticipantContacts.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PARTICIPANT_CONTACTS, action.id], action)
          .setIn([ACTIONS, EDIT_PARTICIPANT_CONTACTS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const successValue :Object = seqAction.value;
          const { newAddressData, newEmailData, newPhoneData } = successValue;

          let address :Map = state.get(ADDRESS);
          let email :Map = state.get(EMAIL);
          let phone :Map = state.get(PHONE);

          newAddressData.forEach((value, fqn) => {
            address = address.set(fqn, value);
          });
          newEmailData.forEach((value, fqn) => {
            email = email.set(fqn, value);
          });
          newPhoneData.forEach((value, fqn) => {
            phone = phone.set(fqn, value);
          });

          return state
            .set(ADDRESS, address)
            .set(EMAIL, email)
            .set(PHONE, phone)
            .setIn([ACTIONS, EDIT_PARTICIPANT_CONTACTS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_PARTICIPANT_CONTACTS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PARTICIPANT_CONTACTS, action.id]),
      });
    }

    case editPersonDetails.case(action.type): {

      return editPersonDetails.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PERSON_DETAILS, action.id], action)
          .setIn([ACTIONS, EDIT_PERSON_DETAILS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const successValue :Object = seqAction.value;
          const { newPersonData } = successValue;

          let person :Map = state.get(PARTICIPANT);

          newPersonData.forEach((value, fqn) => {
            person = person.set(fqn, value);
          });

          return state
            .set(PARTICIPANT, person)
            .setIn([ACTIONS, EDIT_PERSON_DETAILS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_PERSON_DETAILS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PERSON_DETAILS, action.id]),
      });
    }

    case editPersonNotes.case(action.type): {

      return editPersonNotes.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PLAN_NOTES, action.id], action)
          .setIn([ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, EDIT_PLAN_NOTES, seqAction.id]);

          if (storedSeqAction) {

            const { value } :Object = seqAction;
            const { peopleESID } = value;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;

            let person :Map = state.get(PARTICIPANT);

            const personEKID = Object.keys(entityData[peopleESID])[0];
            const storedPropertyValueMap = entityData[peopleESID][personEKID];
            const personNotes = Object.values(storedPropertyValueMap)[0];

            let personNotesPlaceholder = person.get(PERSON_NOTES, 0);
            personNotesPlaceholder = personNotes[0];
            person = person.set(PERSON_NOTES, personNotesPlaceholder);

            return state
              .set(PARTICIPANT, person)
              .setIn([ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PLAN_NOTES, action.id]),
      });
    }

    case editAppointment.case(action.type): {

      return editAppointment.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_APPOINTMENT, action.id], action)
          .setIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, EDIT_APPOINTMENT, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const { appointmentESID, edm } = successValue;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;
            const appointmentEKID = Object.keys(entityData[appointmentESID])[0];

            let workAppointmentsByWorksitePlan = state.get(WORK_APPOINTMENTS_BY_WORKSITE_PLAN);
            const [keyEKID, index] = findEntityPathInMap(workAppointmentsByWorksitePlan, appointmentEKID);
            if (index !== -1) {

              const newAppointmentData :Map = fromJS(entityData[appointmentESID][appointmentEKID]);
              const startDateTimePTID :UUID = getPropertyTypeIdFromEdm(edm, INCIDENT_START_DATETIME);
              const newStartDateTime :string = newAppointmentData.getIn([startDateTimePTID, 0]);

              const endDateTimePTID :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_END);
              const newEndDateTime :string = newAppointmentData.getIn([endDateTimePTID, 0]);

              if (newStartDateTime) {
                workAppointmentsByWorksitePlan = workAppointmentsByWorksitePlan.setIn([
                  keyEKID,
                  index,
                  INCIDENT_START_DATETIME,
                ], List([newStartDateTime]));
              }
              if (newEndDateTime) {
                workAppointmentsByWorksitePlan = workAppointmentsByWorksitePlan.setIn([
                  keyEKID,
                  index,
                  DATETIME_END,
                ], List([newEndDateTime]));
              }

              return state
                .set(WORK_APPOINTMENTS_BY_WORKSITE_PLAN, workAppointmentsByWorksitePlan)
                .setIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
            }
          }

          return state
            .setIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_APPOINTMENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_APPOINTMENT, action.id]),
      });
    }

    case editPlanNotes.case(action.type): {

      return editPlanNotes.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PLAN_NOTES, action.id], action)
          .setIn([ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, EDIT_PLAN_NOTES, seqAction.id]);

          if (storedSeqAction) {

            const { value } :Object = seqAction;
            const { diversionPlanESID } = value;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;

            let diversionPlan :Map = state.get(DIVERSION_PLAN);

            const diversionPlanEKID = Object.keys(entityData[diversionPlanESID])[0];
            const storedPropertyValueMap = entityData[diversionPlanESID][diversionPlanEKID];
            const planNotes = Object.values(storedPropertyValueMap)[0];

            let planNotesPlaceholder = diversionPlan.get(NOTES, 0);
            planNotesPlaceholder = planNotes[0];
            diversionPlan = diversionPlan.set(NOTES, planNotesPlaceholder);

            return state
              .set(DIVERSION_PLAN, diversionPlan)
              .setIn([ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_PLAN_NOTES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PLAN_NOTES, action.id]),
      });
    }

    case editEnrollmentDates.case(action.type): {

      return editEnrollmentDates.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_ENROLLMENT_DATES, action.id], action)
          .setIn([ACTIONS, EDIT_ENROLLMENT_DATES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const { value } :Object = seqAction;
          const { edm, newDiversionPlanData } = value;

          if (!newDiversionPlanData.isEmpty()) {

            const checkInDateTime :UUID = getPropertyTypeIdFromEdm(edm, CHECK_IN_DATETIME);
            const orientationDateTime :UUID = getPropertyTypeIdFromEdm(edm, ORIENTATION_DATETIME);
            const sentenceDate :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_RECEIVED);
            const sentenceEndDate :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_END);

            let diversionPlan = state.get(DIVERSION_PLAN);
            if (newDiversionPlanData.get(checkInDateTime)) {
              diversionPlan = diversionPlan.set(CHECK_IN_DATETIME, newDiversionPlanData.get(checkInDateTime));
            }
            if (newDiversionPlanData.get(orientationDateTime)) {
              diversionPlan = diversionPlan.set(ORIENTATION_DATETIME, newDiversionPlanData.get(orientationDateTime));
            }
            if (newDiversionPlanData.get(sentenceDate)) {
              diversionPlan = diversionPlan.set(DATETIME_RECEIVED, newDiversionPlanData.get(sentenceDate));
            }
            if (newDiversionPlanData.get(sentenceEndDate)) {
              diversionPlan = diversionPlan.set(DATETIME_END, newDiversionPlanData.get(sentenceEndDate));
            }

            return state
              .set(DIVERSION_PLAN, diversionPlan)
              .setIn([ACTIONS, EDIT_ENROLLMENT_DATES, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_ENROLLMENT_DATES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_ENROLLMENT_DATES, action.id]),
      });
    }

    case editPersonCase.case(action.type): {

      return editPersonCase.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PERSON_CASE, action.id], action)
          .setIn([ACTIONS, EDIT_PERSON_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const { value } :Object = seqAction;
          const { edm, newCaseData } = value;

          if (!newCaseData.isEmpty()) {

            const caseNumberTextPTID :UUID = getPropertyTypeIdFromEdm(edm, CASE_NUMBER_TEXT);
            const courtCaseTypePTID :UUID = getPropertyTypeIdFromEdm(edm, COURT_CASE_TYPE);

            let personCase = state.get(PERSON_CASE);
            if (newCaseData.get(caseNumberTextPTID)) {
              personCase = personCase.set(CASE_NUMBER_TEXT, newCaseData.get(caseNumberTextPTID));
            }
            if (newCaseData.get(courtCaseTypePTID)) {
              personCase = personCase.set(COURT_CASE_TYPE, newCaseData.get(courtCaseTypePTID));
            }

            return state
              .set(PERSON_CASE, personCase)
              .setIn([ACTIONS, EDIT_PERSON_CASE, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_PERSON_CASE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_PERSON_CASE, action.id]),
      });
    }

    case editRequiredHours.case(action.type): {

      return editRequiredHours.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_REQUIRED_HOURS, action.id], action)
          .setIn([ACTIONS, EDIT_REQUIRED_HOURS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const { value } :Object = seqAction;

          let diversionPlan :Map = state.get(DIVERSION_PLAN);
          if (isDefined(value)) diversionPlan = diversionPlan.setIn([REQUIRED_HOURS], value);

          return state
            .set(DIVERSION_PLAN, diversionPlan)
            .setIn([ACTIONS, EDIT_REQUIRED_HOURS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_REQUIRED_HOURS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_REQUIRED_HOURS, action.id]),
      });
    }

    case editWorksitePlan.case(action.type): {

      return editWorksitePlan.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, EDIT_WORKSITE_PLAN, action.id], action)
          .setIn([ACTIONS, EDIT_WORKSITE_PLAN, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, EDIT_WORKSITE_PLAN, seqAction.id]);

          if (storedSeqAction) {

            const successValue :Object = seqAction.value;
            const {
              edm,
              enrollmentStatusESID,
              worksitePlanEKID,
              worksitePlanESID,
              worksitePlanStatusEKID,
            } = successValue;

            const requestValue :Object = storedSeqAction.value;
            let { statusEntityData, worksitePlanDataToEdit } :Object = requestValue;

            statusEntityData = fromJS(statusEntityData);
            worksitePlanDataToEdit = fromJS(worksitePlanDataToEdit);

            let worksitePlanStatuses :Map = state.get(WORKSITE_PLAN_STATUSES);
            let worksitePlans :List = state.get(WORKSITE_PLANS);

            if (!statusEntityData.isEmpty()) {
              const storedStatusEntity :Map = statusEntityData.getIn([enrollmentStatusESID, 0]);

              let newWorksitePlanStatus :Map = Map();
              storedStatusEntity.forEach((statusValue, id) => {
                const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
                newWorksitePlanStatus = newWorksitePlanStatus.set(propertyTypeFqn, statusValue);
              });
              newWorksitePlanStatus = newWorksitePlanStatus.set(ENTITY_KEY_ID, worksitePlanStatusEKID);

              let currentWorksitePlanStatus = worksitePlanStatuses.get(worksitePlanEKID, Map());
              currentWorksitePlanStatus = newWorksitePlanStatus;
              worksitePlanStatuses = worksitePlanStatuses.set(worksitePlanEKID, currentWorksitePlanStatus);
            }

            if (!worksitePlanDataToEdit.isEmpty()) {
              const storedWorksitePlanEntity :Map = worksitePlanDataToEdit.getIn([worksitePlanESID, worksitePlanEKID]);

              let worksitePlan :Map = worksitePlans.find((plan :Map) => getEntityKeyId(plan) === worksitePlanEKID);
              const indexOfWorksitePlan :number = worksitePlans.indexOf(worksitePlan);

              storedWorksitePlanEntity.forEach((planValue, id) => {
                const propertyTypeFqn :FQN = getPropertyFqnFromEdm(edm, id);
                let entityValue = worksitePlan.get(propertyTypeFqn, '');
                entityValue = planValue;
                worksitePlan = worksitePlan.set(propertyTypeFqn, entityValue);
              });

              worksitePlans = worksitePlans.set(indexOfWorksitePlan, worksitePlan);
            }

            return state
              .set(WORKSITE_PLANS, worksitePlans)
              .set(WORKSITE_PLAN_STATUSES, worksitePlanStatuses)
              .setIn([ACTIONS, EDIT_WORKSITE_PLAN, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_WORKSITE_PLAN, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_WORKSITE_PLAN, action.id]),
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

    case getCharges.case(action.type): {

      return getCharges.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_CHARGES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_CHARGES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_CHARGES, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(CHARGES, value)
            .setIn([ACTIONS, GET_CHARGES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(CHARGES, List())
          .setIn([ACTIONS, GET_CHARGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_CHARGES, action.id])
      });
    }

    case getChargesForCase.case(action.type): {

      return getChargesForCase.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_CHARGES_FOR_CASE, action.id], fromJS(action))
          .setIn([ACTIONS, GET_CHARGES_FOR_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_CHARGES_FOR_CASE, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(CHARGES_FOR_CASE, value)
            .setIn([ACTIONS, GET_CHARGES_FOR_CASE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(CHARGES_FOR_CASE, List())
          .setIn([ACTIONS, GET_CHARGES_FOR_CASE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_CHARGES_FOR_CASE, action.id])
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
            .set(EMAIL, value.email)
            .set(PHONE, value.phone)
            .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;

          return state
            .set(EMAIL, Map())
            .set(PHONE, Map())
            .setIn([ERRORS, GET_CONTACT_INFO], value)
            .setIn([ACTIONS, GET_CONTACT_INFO, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_CONTACT_INFO, action.id])
      });
    }

    case getEnrollmentFromDiversionPlan.case(action.type): {

      return getEnrollmentFromDiversionPlan.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(ENROLLMENT_STATUS, value.enrollmentStatus)
            .set(DIVERSION_PLAN, value.diversionPlan)
            .setIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, action.id])
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
            .set(ALL_DIVERSION_PLANS, value.allDiversionPlans)
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

    case getInfoForEditCase.case(action.type): {

      return getInfoForEditCase.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, action.id], fromJS(action))
          .setIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, action.id])) {
            return state;
          }

          return state
            .setIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, action.id])
      });
    }

    case getInfoForEditPerson.case(action.type): {

      return getInfoForEditPerson.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_INFO_FOR_EDIT_PERSON, action.id], fromJS(action))
          .setIn([ACTIONS, GET_INFO_FOR_EDIT_PERSON, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_INFO_FOR_EDIT_PERSON, action.id])) {
            return state;
          }

          return state
            .setIn([ACTIONS, GET_INFO_FOR_EDIT_PERSON, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_INFO_FOR_EDIT_PERSON, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_INFO_FOR_EDIT_PERSON, action.id])
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

    case getJudgeForCase.case(action.type): {

      return getJudgeForCase.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_JUDGE_FOR_CASE, action.id], fromJS(action))
          .setIn([ACTIONS, GET_JUDGE_FOR_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_JUDGE_FOR_CASE, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(JUDGE, value)
            .setIn([ACTIONS, GET_JUDGE_FOR_CASE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(JUDGE, Map())
          .setIn([ACTIONS, GET_JUDGE_FOR_CASE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_JUDGE_FOR_CASE, action.id])
      });
    }

    case getJudges.case(action.type): {

      return getJudges.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_JUDGES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_JUDGES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_JUDGES, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(JUDGES, value)
            .setIn([ACTIONS, GET_JUDGES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(JUDGES, List())
          .setIn([ACTIONS, GET_JUDGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_JUDGES, action.id])
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

    case getParticipantAddress.case(action.type): {

      return getParticipantAddress.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_PARTICIPANT_ADDRESS, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(ADDRESS, value)
            .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(ADDRESS, Map())
          .setIn([ACTIONS, GET_PARTICIPANT_ADDRESS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT_ADDRESS, action.id])
      });
    }

    case getProgramOutcome.case(action.type): {

      return getProgramOutcome.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_PROGRAM_OUTCOME, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PROGRAM_OUTCOME, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_PROGRAM_OUTCOME, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(PROGRAM_OUTCOME, value)
            .setIn([ACTIONS, GET_PROGRAM_OUTCOME, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set(PROGRAM_OUTCOME, Map())
          .setIn([ACTIONS, GET_PROGRAM_OUTCOME, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PROGRAM_OUTCOME, action.id])
      });
    }

    case markDiversionPlanAsComplete.case(action.type): {

      return markDiversionPlanAsComplete.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, MARK_DIVERSION_PLAN_AS_COMPLETE, action.id], action)
          .setIn([ACTIONS, MARK_DIVERSION_PLAN_AS_COMPLETE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          let diversionPlan :Map = state.get(DIVERSION_PLAN);
          let isCompleted = diversionPlan.getIn([COMPLETED, 0], true);
          isCompleted = true;
          diversionPlan = diversionPlan.setIn([COMPLETED, 0], isCompleted);

          return state
            .set(DIVERSION_PLAN, diversionPlan)
            .setIn([ACTIONS, MARK_DIVERSION_PLAN_AS_COMPLETE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, MARK_DIVERSION_PLAN_AS_COMPLETE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, MARK_DIVERSION_PLAN_AS_COMPLETE, action.id]),
      });
    }

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

    case getWorksitePlanStatuses.case(action.type): {

      return getWorksitePlanStatuses.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(WORKSITE_PLAN_STATUSES, value)
            .setIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => {

          const { value } = action;
          return state
            .set(WORKSITE_PLAN_STATUSES, Map())
            .setIn([ERRORS, GET_WORKSITE_PLAN_STATUSES], value)
            .setIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, REQUEST_STATE], RequestStates.FAILURE);
        },
        FINALLY: () => state.deleteIn([ACTIONS, GET_WORKSITE_PLAN_STATUSES, action.id])
      });
    }

    case reassignJudge.case(action.type): {

      return reassignJudge.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, REASSIGN_JUDGE, action.id], action)
          .setIn([ACTIONS, REASSIGN_JUDGE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([ACTIONS, REASSIGN_JUDGE, seqAction.id]);

          if (storedSeqAction) {

            const requestValue = storedSeqAction.value;
            const { associationEntityData, entityData } = requestValue;
            const successValue = seqAction.value;
            const { edm, judgesESID, presidesOverESID } = successValue;

            let judgeEKID :UUID = '';
            if (entityData) {
              judgeEKID = getIn(entityData, [judgesESID, 0, getPropertyTypeIdFromEdm(edm, ENTITY_KEY_ID), 0]);
            }
            if (associationEntityData) {
              judgeEKID = getIn(associationEntityData, [presidesOverESID, 0, 'src', 'entityKeyId']);
            }

            const judges = state.get(JUDGES);
            const judge :Map = judges.find((storedJudge :Map) => {
              return getEntityKeyId(storedJudge) === judgeEKID;
            });

            return state
              .set(JUDGE, judge)
              .setIn([ACTIONS, JUDGE, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .setIn([ACTIONS, REASSIGN_JUDGE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, REASSIGN_JUDGE, action.id])
      });
    }

    case removeChargeFromCase.case(action.type): {

      return removeChargeFromCase.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, REMOVE_CHARGE_FROM_CASE, action.id], action)
          .setIn([ACTIONS, REMOVE_CHARGE_FROM_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, REMOVE_CHARGE_FROM_CASE, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, REMOVE_CHARGE_FROM_CASE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, REMOVE_CHARGE_FROM_CASE, action.id])
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
