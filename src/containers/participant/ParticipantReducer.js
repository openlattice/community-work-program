// @flow
import {
  List,
  Map,
  fromJS,
} from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { FQN } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  addNewDiversionPlanStatus,
  addPersonPhoto,
  createCase,
  createNewEnrollment,
  editEnrollmentDates,
  editPersonCase,
  editPersonDetails,
  editPersonNotes,
  editPlanNotes,
  editRequiredHours,
  getAllParticipantInfo,
  getCaseInfo,
  getDiversionPlan,
  getEnrollmentFromDiversionPlan,
  getEnrollmentHistory,
  getEnrollmentStatus,
  getInfoForAddParticipant,
  getInfoForEditCase,
  getInfoForEditPerson,
  getJudgeForCase,
  getJudges,
  getParticipant,
  getParticipantCases,
  getPersonPhoto,
  getProgramOutcome,
  markDiversionPlanAsComplete,
  reassignJudge,
  updatePersonPhoto,
} from './ParticipantActions';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  getEntityKeyId,
  getPropertyFqnFromEdm,
  getPropertyTypeIdFromEdm,
} from '../../utils/DataUtils';
import { isDefined } from '../../utils/LangUtils';
import { PERSON } from '../../utils/constants/ReduxStateConsts';

const {
  CASE_NUMBER_TEXT,
  CHECK_IN_DATETIME,
  CHECK_IN_DEADLINE,
  COMPLETED,
  COURT_CASE_TYPE,
  DATETIME_END,
  DATETIME_RECEIVED,
  ENTITY_KEY_ID,
  NOTES,
  ORIENTATION_DATETIME,
  PERSON_NOTES,
  REQUIRED_HOURS,
} = PROPERTY_TYPE_FQNS;

const {
  ACTIONS,
  ADD_CHARGES_TO_CASE,
  ADD_NEW_DIVERSION_PLAN_STATUS,
  ADD_PERSON_PHOTO,
  ALL_DIVERSION_PLANS,
  ALL_PARTICIPANT_CASES,
  CREATE_CASE,
  CREATE_NEW_ENROLLMENT,
  DIVERSION_PLAN,
  EDIT_ENROLLMENT_DATES,
  EDIT_PERSON_CASE,
  EDIT_PERSON_DETAILS,
  EDIT_PERSON_NOTES,
  EDIT_PLAN_NOTES,
  EDIT_REQUIRED_HOURS,
  ENROLLMENT_HISTORY_DATA,
  ENROLLMENT_STATUS,
  GET_ALL_PARTICIPANT_INFO,
  GET_CASE_INFO,
  GET_DIVERSION_PLAN,
  GET_ENROLLMENT_HISTORY,
  GET_ENROLLMENT_FROM_DIVERSION_PLAN,
  GET_ENROLLMENT_STATUS,
  GET_INFO_FOR_ADD_PARTICIPANT,
  GET_INFO_FOR_EDIT_CASE,
  GET_INFO_FOR_EDIT_PERSON,
  GET_JUDGE_FOR_CASE,
  GET_JUDGES,
  GET_PARTICIPANT,
  GET_PARTICIPANT_CASES,
  GET_PERSON_PHOTO,
  GET_PROGRAM_OUTCOME,
  JUDGE,
  JUDGES,
  JUDGES_BY_CASE,
  MARK_DIVERSION_PLAN_AS_COMPLETE,
  PARTICIPANT,
  PERSON_CASE,
  PERSON_PHOTO,
  PROGRAM_OUTCOME,
  REASSIGN_JUDGE,
  REQUEST_STATE,
  UPDATE_PERSON_PHOTO,
} = PERSON;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ACTIONS]: {
    [ADD_CHARGES_TO_CASE]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [ADD_NEW_DIVERSION_PLAN_STATUS]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [ADD_PERSON_PHOTO]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [CREATE_CASE]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [CREATE_NEW_ENROLLMENT]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [EDIT_ENROLLMENT_DATES]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [EDIT_PERSON_CASE]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [EDIT_PERSON_DETAILS]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [EDIT_PERSON_NOTES]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [EDIT_PLAN_NOTES]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [EDIT_REQUIRED_HOURS]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_ALL_PARTICIPANT_INFO]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_CASE_INFO]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_DIVERSION_PLAN]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_ENROLLMENT_HISTORY]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_ENROLLMENT_FROM_DIVERSION_PLAN]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_ENROLLMENT_STATUS]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_INFO_FOR_ADD_PARTICIPANT]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_INFO_FOR_EDIT_CASE]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_INFO_FOR_EDIT_PERSON]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_JUDGE_FOR_CASE]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_JUDGES]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [MARK_DIVERSION_PLAN_AS_COMPLETE]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_PARTICIPANT]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_PARTICIPANT_CASES]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_PERSON_PHOTO]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [GET_PROGRAM_OUTCOME]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [REASSIGN_JUDGE]: { [REQUEST_STATE]: RequestStates.STANDBY },
    [UPDATE_PERSON_PHOTO]: { [REQUEST_STATE]: RequestStates.STANDBY },
  },
  [ALL_DIVERSION_PLANS]: List(),
  [ALL_PARTICIPANT_CASES]: List(),
  [DIVERSION_PLAN]: Map(),
  [ENROLLMENT_HISTORY_DATA]: List(),
  [ENROLLMENT_STATUS]: Map(),
  [JUDGE]: Map(),
  [JUDGES]: List(),
  [PARTICIPANT]: Map(),
  [PERSON_CASE]: Map(),
  [PERSON_PHOTO]: Map(),
  [PROGRAM_OUTCOME]: Map(),
});

export default function participantReducer(state :Map<*, *> = INITIAL_STATE, action :SequenceAction) :Map<*, *> {

  switch (action.type) {

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

    case addPersonPhoto.case(action.type): {
      return addPersonPhoto.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, ADD_PERSON_PHOTO, action.id], action)
          .setIn([ACTIONS, ADD_PERSON_PHOTO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, ADD_PERSON_PHOTO, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, ADD_PERSON_PHOTO, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_PERSON_PHOTO, action.id]),
      });
    }

    case createCase.case(action.type): {
      return createCase.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, CREATE_CASE, action.id], action)
          .setIn([ACTIONS, CREATE_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(PERSON_CASE, action.value.newCase)
          .setIn([ACTIONS, CREATE_CASE, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, CREATE_CASE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, CREATE_CASE, action.id]),
      });
    }

    case createNewEnrollment.case(action.type): {
      return createNewEnrollment.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, CREATE_NEW_ENROLLMENT, action.id], action)
          .setIn([ACTIONS, CREATE_NEW_ENROLLMENT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, CREATE_NEW_ENROLLMENT, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, CREATE_NEW_ENROLLMENT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, CREATE_NEW_ENROLLMENT, action.id]),
      });
    }

    case editPersonDetails.case(action.type): {
      return editPersonDetails.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, EDIT_PERSON_DETAILS, action.id], action)
          .setIn([ACTIONS, EDIT_PERSON_DETAILS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(PARTICIPANT, state.get(PARTICIPANT).mergeWith((oldVal, newVal) => newVal, action.value))
          .setIn([ACTIONS, EDIT_PERSON_DETAILS, REQUEST_STATE], RequestStates.SUCCESS),
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
            const { notesPTID, peopleESID } = value;

            const requestValue :Object = storedSeqAction.value;
            const { entityData } :Object = requestValue;

            let person :Map = state.get(PARTICIPANT);

            const personEKID = Object.keys(entityData[peopleESID])[0];
            const storedPropertyValueMap = entityData[peopleESID][personEKID];
            const notesValue :string[] = storedPropertyValueMap[notesPTID];
            const [personNotes] = notesValue;

            let personNotesPlaceholder = person.get(PERSON_NOTES, 0);
            personNotesPlaceholder = personNotes;
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
            diversionPlan = diversionPlan.set(NOTES, planNotes);

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
          const { edm, newDiversionPlanData } = action.value;

          if (!newDiversionPlanData.isEmpty()) {
            const checkInDateTime :UUID = getPropertyTypeIdFromEdm(edm, CHECK_IN_DATETIME);
            const checkInDeadline :UUID = getPropertyTypeIdFromEdm(edm, CHECK_IN_DEADLINE);
            const orientationDateTime :UUID = getPropertyTypeIdFromEdm(edm, ORIENTATION_DATETIME);
            const sentenceDate :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_RECEIVED);
            const sentenceEndDate :UUID = getPropertyTypeIdFromEdm(edm, DATETIME_END);

            let diversionPlan = state.get(DIVERSION_PLAN);
            if (newDiversionPlanData.get(checkInDateTime)) {
              diversionPlan = diversionPlan.set(CHECK_IN_DATETIME, newDiversionPlanData.get(checkInDateTime));
            }
            if (newDiversionPlanData.get(checkInDeadline)) {
              diversionPlan = diversionPlan.set(CHECK_IN_DEADLINE, newDiversionPlanData.get(checkInDeadline));
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
          const { edm, newCaseData } = action.value;
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
          let diversionPlan :Map = state.get(DIVERSION_PLAN);
          if (isDefined(action.value)) diversionPlan = diversionPlan.setIn([REQUIRED_HOURS], action.value);
          return state
            .set(DIVERSION_PLAN, diversionPlan)
            .setIn([ACTIONS, EDIT_REQUIRED_HOURS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, EDIT_REQUIRED_HOURS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, EDIT_REQUIRED_HOURS, action.id]),
      });
    }

    case getAllParticipantInfo.case(action.type): {
      return getAllParticipantInfo.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ALL_PARTICIPANT_INFO, action.id])
      });
    }

    case getCaseInfo.case(action.type): {
      return getCaseInfo.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_CASE_INFO, action.id], fromJS(action))
          .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(PERSON_CASE, action.value)
          .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_CASE_INFO, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_CASE_INFO, action.id])
      });
    }

    case getDiversionPlan.case(action.type): {
      return getDiversionPlan.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_DIVERSION_PLAN, action.id], fromJS(action))
          .setIn([ACTIONS, GET_DIVERSION_PLAN, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(DIVERSION_PLAN, action.value)
          .setIn([ACTIONS, GET_DIVERSION_PLAN, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_DIVERSION_PLAN, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_DIVERSION_PLAN, action.id])
      });
    }

    case getEnrollmentFromDiversionPlan.case(action.type): {
      return getEnrollmentFromDiversionPlan.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(ENROLLMENT_STATUS, action.value.enrollmentStatus)
          .set(DIVERSION_PLAN, action.value.diversionPlan)
          .setIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ENROLLMENT_FROM_DIVERSION_PLAN, action.id])
      });
    }

    case getEnrollmentHistory.case(action.type): {
      return getEnrollmentHistory.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_HISTORY, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ENROLLMENT_HISTORY, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(ENROLLMENT_HISTORY_DATA, action.value)
          .setIn([ACTIONS, GET_ENROLLMENT_HISTORY, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_HISTORY, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ENROLLMENT_HISTORY, action.id])
      });
    }

    case getEnrollmentStatus.case(action.type): {
      return getEnrollmentStatus.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_STATUS, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(ENROLLMENT_STATUS, action.value.enrollmentStatus)
          .set(DIVERSION_PLAN, action.value.diversionPlan)
          .set(ALL_DIVERSION_PLANS, action.value.allDiversionPlans)
          .setIn([ACTIONS, GET_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ENROLLMENT_STATUS, action.id])
      });
    }

    case getInfoForAddParticipant.case(action.type): {
      return getInfoForAddParticipant.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_INFO_FOR_ADD_PARTICIPANT, action.id], fromJS(action))
          .setIn([ACTIONS, GET_INFO_FOR_ADD_PARTICIPANT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, GET_INFO_FOR_ADD_PARTICIPANT, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_INFO_FOR_ADD_PARTICIPANT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_INFO_FOR_ADD_PARTICIPANT, action.id])
      });
    }

    case getInfoForEditCase.case(action.type): {
      return getInfoForEditCase.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, action.id], fromJS(action))
          .setIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, GET_INFO_FOR_EDIT_CASE, REQUEST_STATE], RequestStates.SUCCESS),
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
        SUCCESS: () => state
          .setIn([ACTIONS, GET_INFO_FOR_EDIT_PERSON, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_INFO_FOR_EDIT_PERSON, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_INFO_FOR_EDIT_PERSON, action.id]),
      });
    }

    case getJudgeForCase.case(action.type): {
      return getJudgeForCase.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_JUDGE_FOR_CASE, action.id], fromJS(action))
          .setIn([ACTIONS, GET_JUDGE_FOR_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(JUDGE, action.value.judge)
          .set(JUDGES_BY_CASE, action.value.judgesByCase)
          .setIn([ACTIONS, GET_JUDGE_FOR_CASE, REQUEST_STATE], RequestStates.SUCCESS),
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
        SUCCESS: () => state
          .set(JUDGES, action.value)
          .setIn([ACTIONS, GET_JUDGES, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .set(JUDGES, List())
          .setIn([ACTIONS, GET_JUDGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_JUDGES, action.id])
      });
    }

    case getParticipant.case(action.type): {
      return getParticipant.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(PARTICIPANT, action.value)
          .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_PARTICIPANT, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT, action.id])
      });
    }

    case getParticipantCases.case(action.type): {
      return getParticipantCases.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PARTICIPANT_CASES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PARTICIPANT_CASES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(ALL_PARTICIPANT_CASES, action.value)
          .setIn([ACTIONS, GET_PARTICIPANT_CASES, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_PARTICIPANT_CASES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PARTICIPANT_CASES, action.id])
      });
    }

    case getPersonPhoto.case(action.type): {
      return getPersonPhoto.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PERSON_PHOTO, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PERSON_PHOTO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(PERSON_PHOTO, action.value)
          .setIn([ACTIONS, GET_PERSON_PHOTO, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, GET_PERSON_PHOTO, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_PERSON_PHOTO, action.id])
      });
    }

    case getProgramOutcome.case(action.type): {
      return getProgramOutcome.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, GET_PROGRAM_OUTCOME, action.id], fromJS(action))
          .setIn([ACTIONS, GET_PROGRAM_OUTCOME, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set(PROGRAM_OUTCOME, action.value)
          .setIn([ACTIONS, GET_PROGRAM_OUTCOME, REQUEST_STATE], RequestStates.SUCCESS),
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
          const diversionPlan = state.get(DIVERSION_PLAN, Map()).setIn([COMPLETED, 0], true);
          return state
            .set(DIVERSION_PLAN, diversionPlan)
            .setIn([ACTIONS, MARK_DIVERSION_PLAN_AS_COMPLETE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, MARK_DIVERSION_PLAN_AS_COMPLETE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, MARK_DIVERSION_PLAN_AS_COMPLETE, action.id]),
      });
    }

    case reassignJudge.case(action.type): {
      return reassignJudge.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, REASSIGN_JUDGE, action.id], action)
          .setIn([ACTIONS, REASSIGN_JUDGE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const judge = state.get(JUDGES)
            .find((storedJudge :Map) => getEntityKeyId(storedJudge) === action.value);
          return state
            .set(JUDGE, judge)
            .setIn([ACTIONS, REASSIGN_JUDGE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, REASSIGN_JUDGE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, REASSIGN_JUDGE, action.id])
      });
    }

    case updatePersonPhoto.case(action.type): {
      return updatePersonPhoto.reducer(state, action, {
        REQUEST: () => state
          .setIn([ACTIONS, UPDATE_PERSON_PHOTO, action.id], action)
          .setIn([ACTIONS, UPDATE_PERSON_PHOTO, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, UPDATE_PERSON_PHOTO, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, UPDATE_PERSON_PHOTO, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, UPDATE_PERSON_PHOTO, action.id]),
      });
    }

    default:
      return state;
  }
}
