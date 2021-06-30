/*
 * @flow
 */

import FS from 'file-saver';
import Papa from 'papaparse';
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, fromJS } from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { DataUtils, DateTimeUtils } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PARTICIPANT,
  DOWNLOAD_PARTICIPANTS,
  GET_COURT_TYPE,
  GET_DIVERSION_PLANS,
  GET_ENROLLMENT_STATUSES,
  GET_HOURS_WORKED,
  GET_INFRACTIONS,
  GET_PARTICIPANTS,
  GET_PARTICIPANT_PHOTOS,
  addParticipant,
  downloadParticipants,
  getCourtType,
  getDiversionPlans,
  getEnrollmentStatuses,
  getHoursWorked,
  getInfractions,
  getParticipantPhotos,
  getParticipants,
} from './ParticipantsActions';
import { COMPLETION_STATUSES } from './ParticipantsConstants';

import Logger from '../../utils/Logger';
import { ENROLLMENT_STATUSES, INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { selectEntitySetId, selectOrgId } from '../../core/redux/selectors';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';
import {
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
  sortEntitiesByDateProperty,
} from '../../utils/DataUtils';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import { isDefined } from '../../utils/LangUtils';
import { getPersonFullName } from '../../utils/PeopleUtils';
import { isValidUUID } from '../../utils/ValidationUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { getEntityKeyId, getPropertyValue } = DataUtils;
const { formatAsDate } = DateTimeUtils;

const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  IMAGE,
  INFRACTION_EVENT,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  PROGRAM_OUTCOME,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const {
  CHECK_IN_DATETIME,
  COMPLETED,
  COURT_CASE_TYPE,
  DATETIME,
  DATETIME_COMPLETED,
  DATETIME_RECEIVED,
  DOB,
  EFFECTIVE_DATE,
  ETHNICITY,
  HOURS_WORKED,
  ORIENTATION_DATETIME,
  RACE,
  REQUIRED_HOURS,
  SEX,
  STATUS,
  TYPE,
} = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());

const LOG = new Logger('ParticipantsSagas');

/*
 *
 * ParticipantsActions.addParticipant()
 *
 */

function* addParticipantWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(addParticipant.request(id, value));
    if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
    const { associationEntityData, entityData, personIndexOrEKID } = value;

    response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData, entityData }));
    if (response.error) throw response.error;

    let newParticipantEKID :UUID = '';
    if (isValidUUID(personIndexOrEKID)) newParticipantEKID = personIndexOrEKID;
    else {
      const { entityKeyIds } = response.data;
      const app = yield select(getAppFromState);
      const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
      [newParticipantEKID] = entityKeyIds[peopleESID];
    }

    yield put(addParticipant.success(id, newParticipantEKID));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addParticipantWorker()', error);
    yield put(addParticipant.failure(id, error));
  }
  finally {
    yield put(addParticipant.finally(id));
  }
}

function* addParticipantWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_PARTICIPANT, addParticipantWorker);
}

/*
 *
 * ParticipantsActions.downloadParticipants()
 *
 */

function* downloadParticipantsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(downloadParticipants.request(id, value));

    const selectedOrgId :UUID = yield select(selectOrgId());
    const diversionPlanESID :UUID = yield select(selectEntitySetId(selectedOrgId, DIVERSION_PLAN));
    let response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
    if (response.error) throw response.error;
    const diversionPlans :Object[] = response.data;
    const diversionPlanEKIDs = diversionPlans?.map((diversionPlan :Object) => getEntityKeyId(diversionPlan));

    const enrollmentStatusESID :UUID = yield select(selectEntitySetId(selectedOrgId, ENROLLMENT_STATUS));
    const peopleESID :UUID = yield select(selectEntitySetId(selectedOrgId, PEOPLE));
    const programOutcomeESID :UUID = yield select(selectEntitySetId(selectedOrgId, PROGRAM_OUTCOME));
    const worksitePlanESID :UUID = yield select(selectEntitySetId(selectedOrgId, WORKSITE_PLAN));

    const filter = {
      entityKeyIds: diversionPlanEKIDs,
      destinationEntitySetIds: [programOutcomeESID],
      sourceEntitySetIds: [enrollmentStatusESID, peopleESID, worksitePlanESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter })
    );
    if (response.error) throw response.error;
    const diversionPlanNeighbors :Map = fromJS(response.data);

    const csvData :Object[] = [];

    fromJS(diversionPlans).forEach((diversionPlan :Map) => {
      const diversionPlanEKID = getEntityKeyId(diversionPlan);
      const neighbors = diversionPlanNeighbors.get(diversionPlanEKID, List());

      const personNeighbor :Map = neighbors.find((neighbor) => getNeighborESID(neighbor) === peopleESID);
      const person :Map = getNeighborDetails(personNeighbor);

      const sentenceDateTime = getPropertyValue(diversionPlan, [DATETIME_RECEIVED, 0]);
      const checkInDateTime = getPropertyValue(diversionPlan, [CHECK_IN_DATETIME, 0]);
      const orientationDateTime = getPropertyValue(diversionPlan, [ORIENTATION_DATETIME, 0]);

      let startDate = '';
      if (DateTime.fromISO(sentenceDateTime).isValid) startDate = formatAsDate(sentenceDateTime);
      else if (DateTime.fromISO(checkInDateTime).isValid) startDate = formatAsDate(checkInDateTime);
      else if (DateTime.fromISO(orientationDateTime).isValid) startDate = formatAsDate(orientationDateTime);

      const enrollmentStatusNeighbors :List = neighbors
        .filter((neighbor) => getNeighborESID(neighbor) === enrollmentStatusESID);
      const sortedEnrollmentStatuses = enrollmentStatusNeighbors
        .map((neighbor :Map) => getNeighborDetails(neighbor))
        .filter((status :Map) => isDefined(status.get(EFFECTIVE_DATE)))
        .sortBy((status :Map) => DateTime.fromISO(getPropertyValue(status, [EFFECTIVE_DATE, 0])).valueOf())
        .sort((status :Map) => {
          const statusName = getPropertyValue(status, [STATUS, 0]);
          if (statusName === ENROLLMENT_STATUSES.AWAITING_CHECKIN) return -1;
          return 0;
        });
      const mostRecentEnrollmentStatus :Map = sortedEnrollmentStatuses.find((status :Map) => {
        const statusName = getPropertyValue(status, [STATUS, 0]);
        return COMPLETION_STATUSES.includes(statusName);
      }) || sortedEnrollmentStatuses.last() || Map();

      let hoursWorked = '';
      let endDate = '';

      const programOutcomeNeighbor = neighbors.find((neighbor) => getNeighborESID(neighbor) === programOutcomeESID);
      if (isDefined(programOutcomeNeighbor)) {
        const programOutcome :Map = getNeighborDetails(programOutcomeNeighbor);
        hoursWorked = getPropertyValue(programOutcome, [HOURS_WORKED, 0], '');
        endDate = formatAsDate(getPropertyValue(programOutcome, [DATETIME_COMPLETED, 0], ''));
      }
      else {
        const worksitePlans :List = diversionPlan
          .filter((neighbor :Map) => getNeighborESID(neighbor) === worksitePlanESID)
          .map((neighbor :Map) => getNeighborDetails(neighbor));
        const totalHoursWorkedToDate = worksitePlans
          .reduce((totalHours :number, worksitePlanNeighbor :Map) => {
            const worksitePlan = getNeighborDetails(worksitePlanNeighbor);
            const currentHours = getPropertyValue(worksitePlan, [HOURS_WORKED, 0], 0);
            return currentHours + totalHours;
          }, 0);
        hoursWorked = totalHoursWorkedToDate;
      }

      const csvRow = {
        Person: getPersonFullName(person),
        DOB: getPropertyValue(person, [DOB, 0], ''),
        Race: getPropertyValue(person, [RACE, 0], ''),
        Ethnicity: getPropertyValue(person, [ETHNICITY, 0], ''),
        Sex: getPropertyValue(person, [SEX, 0], ''),
        'Hours Worked': hoursWorked,
        Status: getPropertyValue(mostRecentEnrollmentStatus, [STATUS, 0], ''),
        'Start Date': startDate,
        'End Date': endDate,
      };

      csvData.push(csvRow);
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'application/json' });
    FS.saveAs(blob, 'CWP_Participants.csv');

    yield put(downloadParticipants.success(id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(downloadParticipants.failure(id, error));
  }
  finally {
    yield put(downloadParticipants.finally(id));
  }
}

function* downloadParticipantsWatcher() :Generator<*, *, *> {

  yield takeEvery(DOWNLOAD_PARTICIPANTS, downloadParticipantsWorker);
}

/*
 *
 * ParticipantActions.getParticipantPhotos()
 *
 */

function* getParticipantPhotosWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let participantPhotosByParticipantEKID :Map = Map();

  try {
    yield put(getParticipantPhotos.request(id));
    const { participants, peopleESID } = value;

    const app = yield select(getAppFromState);
    const imageESID :UUID = getEntitySetIdFromApp(app, IMAGE);
    const participantEKIDs :UUID[] = [];
    participants.forEach((participant :Map) => {
      const participantEKID :?UUID = getEntityKeyId(participant);
      if (participantEKID) participantEKIDs.push(participantEKID);
    });

    const searchFilter = {
      entityKeyIds: participantEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [imageESID],
    };
    const response :Object = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const result = fromJS(response.data);
    participantPhotosByParticipantEKID = result
      .map((neighborList :List) => neighborList.get(0))
      .map((neighbor :Map) => getNeighborDetails(neighbor));

    yield put(getParticipantPhotos.success(id, participantPhotosByParticipantEKID));
  }
  catch (error) {
    LOG.error('caught exception in getParticipantPhotosWorker()', error);
    yield put(getParticipantPhotos.failure(id, error));
  }
  finally {
    yield put(getParticipantPhotos.finally(id));
  }
}

function* getParticipantPhotosWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT_PHOTOS, getParticipantPhotosWorker);
}

/*
 *
 * ParticipantsActions.getHoursWorked()
 *
 */

function* getHoursWorkedWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getHoursWorked.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};

  try {
    yield put(getHoursWorked.request(id));
    const { currentDiversionPlansByParticipant } = value;

    /*
     * 1. Get required hours from each diversion plan.
     */
    const requiredHours = currentDiversionPlansByParticipant
      .map((diversionPlan :Map) => {
        const { [REQUIRED_HOURS]: reqHours } = getEntityProperties(diversionPlan, [REQUIRED_HOURS]);
        return reqHours;
      });

    /*
     * 2. Get hours worked from worksite plans.
     */
    const app = yield select(getAppFromState);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const diversionPlanEKIDs :UUID[] = currentDiversionPlansByParticipant
      .map((diversionPlan :Map) => getEntityKeyId(diversionPlan))
      .valueSeq()
      .toArray();
    const searchFilter = {
      entityKeyIds: diversionPlanEKIDs,
      destinationEntitySetIds: [],
      sourceEntitySetIds: [peopleESID, worksitePlanESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const diversionPlanNeighbors = fromJS(response.data); // people and worksite plan neighbors for each diversion plan
    let hoursWorkedMap :Map = Map();
    diversionPlanNeighbors.forEach((diversionPlan :Map) => {

      const person :Map = diversionPlan.find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
      const personEKID :?UUID = getEntityKeyId(getNeighborDetails(person));
      const worksitePlans :List = diversionPlan
        .filter((neighbor :Map) => getNeighborESID(neighbor) === worksitePlanESID);
      let hoursWorked :number = 0;

      if (worksitePlans.count() === 1) {
        const worksitePlan :Map = getNeighborDetails(worksitePlans.get(0));
        const { [HOURS_WORKED]: hoursWorkedFound } = getEntityProperties(worksitePlan, [HOURS_WORKED]);
        hoursWorked = hoursWorkedFound;
      }
      if (worksitePlans.count() > 1) {
        hoursWorked = worksitePlans
          .reduce((totalHours :number, worksitePlanNeighbor :Map) => {
            const worksitePlan = getNeighborDetails(worksitePlanNeighbor);
            const { [HOURS_WORKED]: hours } = getEntityProperties(worksitePlan, [HOURS_WORKED]);
            return hours + totalHours;
          }, hoursWorked);
      }
      const reqHoursFromMap :number = requiredHours.get(personEKID) ? requiredHours.get(personEKID) : 0;

      hoursWorkedMap = hoursWorkedMap.set(personEKID, Map({ worked: hoursWorked, required: reqHoursFromMap }));
    });

    yield put(getHoursWorked.success(id, hoursWorkedMap));
  }
  catch (error) {
    LOG.error('caught exception in getHoursWorkedWorker()', error);
    yield put(getHoursWorked.failure(id, error));
  }
  finally {
    yield put(getHoursWorked.finally(id));
  }
}

function* getHoursWorkedWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_HOURS_WORKED, getHoursWorkedWorker);
}

/*
 *
 * ParticipantsActions.getCourtType()
 *
 */

function* getCourtTypeWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getCourtType.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let courtTypeByParticipant :Map = Map();

  try {
    yield put(getCourtType.request(id));
    const { currentDiversionPlansByParticipant } = value;

    const app = yield select(getAppFromState);
    const manualCasesESID :UUID = getEntitySetIdFromApp(app, MANUAL_PRETRIAL_COURT_CASES);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);

    const diversionPlanEKIDs :UUID[] = [];
    currentDiversionPlansByParticipant.forEach((diversionPlan :Map) => {
      const diversionPlanEKID :?UUID = getEntityKeyId(diversionPlan);
      if (diversionPlanEKID) diversionPlanEKIDs.push(diversionPlanEKID);
    });

    const searchFilter = {
      entityKeyIds: diversionPlanEKIDs,
      destinationEntitySetIds: [manualCasesESID],
      sourceEntitySetIds: [peopleESID],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }
    const casesAndPeopleByDiversionPlan = fromJS(response.data);

    if (!casesAndPeopleByDiversionPlan.isEmpty()) {
      casesAndPeopleByDiversionPlan.forEach((caseAndPersonNeighbors :List) => {
        const person :Map = caseAndPersonNeighbors.find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
        const personEKID :?UUID = getEntityKeyId(getNeighborDetails(person));
        const courtCaseObj :Map = caseAndPersonNeighbors
          .find((neighbor :Map) => getNeighborESID(neighbor) === manualCasesESID);
        const courtCase :Map = getNeighborDetails(courtCaseObj);
        const { [COURT_CASE_TYPE]: courtCaseType } = getEntityProperties(courtCase, [COURT_CASE_TYPE]);
        courtTypeByParticipant = courtTypeByParticipant.set(personEKID, courtCaseType);
      });
    }

    yield put(getCourtType.success(id, courtTypeByParticipant));
  }
  catch (error) {
    LOG.error('caught exception in getCourtTypeWorker()', error);
    yield put(getCourtType.failure(id, error));
  }
  finally {
    yield put(getCourtType.finally(id));
  }
}

function* getCourtTypeWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_COURT_TYPE, getCourtTypeWorker);
}

/*
 *
 * ParticipantsActions.getEnrollmentStatuses()
 *
 */

function* getEnrollmentStatusesWorker(action :SequenceAction) :Generator<*, *, *> {

  /*
   The data model is as follows: participant -> sentenced with -> diversion plan,
   diversion plan -> related to -> enrollment status. There is 1 enrollment status entity for every enrollment
   status update. It is therefore unknown how many enrollment status entities might be tied to a given diversion plan
   until a search on that diversion plan's enrollment status neighbors is executed. Additionally, the only indicator of
   enrollment status on the diversion plan entity is the ol.completed boolean.
   */
  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getEnrollmentStatuses.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};
  let enrollmentMap :Map = Map();
  let currentDiversionPlansByParticipant :Map = Map();

  try {
    yield put(getEnrollmentStatuses.request(id));

    /*
     * 1. Get participant EKIDs.
     */
    const { allDiversionPlansByParticipant } = value;
    const participantEKIDs :UUID[] = allDiversionPlansByParticipant.keySeq().toArray();

    if (!allDiversionPlansByParticipant.isEmpty()) {

      /*
       * 2. Create map of { participant : [active diversion plan(s)] }.
       *    If participant doesn't have an active diversion plan: { participant: [all diversion plans] }.
       *    Also create map of all { diversionPlanEKID: participantEKID } for easy lookup later.
       */
      const activeDiversionPlansByParticipantIfAny = allDiversionPlansByParticipant
        .map((planList :List) => {
          const activePlans :List = planList.filter((plan :Map) => {
            const { [COMPLETED]: completed } = getEntityProperties(plan, [COMPLETED]);
            return !completed;
          });
          if (activePlans.isEmpty()) {
            return planList;
          }
          return activePlans;
        });

      const diversionPlanEKIDs = [];
      let diversionPlanEKIDMap :Map = Map();
      activeDiversionPlansByParticipantIfAny.forEach((participantPlans :List, participantEKID :UUID) => {
        let diversionPlanEKID = '';
        if (participantPlans.count() === 1) {
          diversionPlanEKID = getEntityKeyId(participantPlans.get(0));
          diversionPlanEKIDs.push(diversionPlanEKID);
          diversionPlanEKIDMap = diversionPlanEKIDMap.set(diversionPlanEKID, participantEKID);
        }
        if (participantPlans.count() > 1) {
          participantPlans.forEach((plan) => {
            diversionPlanEKID = getEntityKeyId(plan);
            diversionPlanEKIDs.push(diversionPlanEKID);
            diversionPlanEKIDMap = diversionPlanEKIDMap.set(diversionPlanEKID, participantEKID);
          });
        }
      });

      /*
       * 3. Search for enrollment statuses associated with all diversion plans in map above.
       */

      const app = yield select(getAppFromState);
      const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
      const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
      const enrollmentFilter :Object = {
        entityKeyIds: diversionPlanEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [enrollmentStatusESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: enrollmentFilter })
      );
      if (response.error) {
        throw response.error;
      }
      const enrollmentSearchResults :Map = fromJS(response.data)
        .map((planEnrollments :List) => planEnrollments
          .map((enrollment :Map) => getNeighborDetails(enrollment)));

      /*
       * 4. Create new map of { participantEKID: most recent enrollment status }.
       *    Create new map of { participantEKID: most recent diversionPlan }.
       */

      enrollmentSearchResults.forEach((enrollmentList :List, diversionPlanEKID :UUID) => {
        const participantEKID :UUID = diversionPlanEKIDMap.get(diversionPlanEKID);
        let personEnrollmentStatus :Map = enrollmentMap.get(participantEKID, Map());

        let personCurrentDiversionPlan :Map = currentDiversionPlansByParticipant.get(participantEKID, Map());
        const associatedDiversionPlan :Map = allDiversionPlansByParticipant.get(participantEKID)
          .filter((plan :Map) => getEntityKeyId(plan) === diversionPlanEKID)
          .get(0);

        /* filter out enrollment statuses that have blank effective date values before sorting */
        const statusesWithEffectiveDates :List = enrollmentList
          .filter((status :Map) => isDefined(status.get(EFFECTIVE_DATE)));
        let sortedEnrollmentStatuses :List = sortEntitiesByDateProperty(statusesWithEffectiveDates, [EFFECTIVE_DATE]);
        // sort list again, pushing "awaiting check-in" statuses to the front:
        sortedEnrollmentStatuses = sortedEnrollmentStatuses.sort((status :Map) => {
          const statusName = getPropertyValue(status, [STATUS, 0]);
          if (statusName === ENROLLMENT_STATUSES.AWAITING_CHECKIN) return -1;
          return 0;
        });
        const completionStatus :?Map = sortedEnrollmentStatuses.find((statusInList :Map) => {
          const status = getPropertyValue(statusInList, [STATUS, 0]);
          return COMPLETION_STATUSES.includes(status);
        });
        const mostRecentStatus :Map = completionStatus || sortedEnrollmentStatuses.last() || Map();
        // const mostRecentStatus = sortedEnrollmentStatuses.last();

        let { [EFFECTIVE_DATE]: storedStatusDate } = getEntityProperties(personEnrollmentStatus, [EFFECTIVE_DATE]);
        storedStatusDate = DateTime.fromISO(storedStatusDate);
        if (isDefined(mostRecentStatus)) {
          const mostRecentStatusDate = DateTime.fromISO(mostRecentStatus.getIn([EFFECTIVE_DATE, 0]));

          // $FlowFixMe
          if (storedStatusDate < mostRecentStatusDate || personEnrollmentStatus.count() === 0) {
            personEnrollmentStatus = mostRecentStatus;

            personCurrentDiversionPlan = associatedDiversionPlan;
            currentDiversionPlansByParticipant = currentDiversionPlansByParticipant
              .set(participantEKID, personCurrentDiversionPlan);
          }
        }
        enrollmentMap = enrollmentMap.set(participantEKID, personEnrollmentStatus);
      });
    }

    /*
     * 5. If no enrollment status for a person exists, set enrollment to empty Map().
     */
    const participantsWithoutEnrollmentStatus :UUID[] = participantEKIDs
      .filter((ekid) => !isDefined(enrollmentMap.get(ekid)));
    participantsWithoutEnrollmentStatus.forEach((ekid :string) => {
      enrollmentMap = enrollmentMap.set(ekid, Map());
    });

    if (currentDiversionPlansByParticipant.count() === 0 && allDiversionPlansByParticipant.count() !== 0) {
      currentDiversionPlansByParticipant = allDiversionPlansByParticipant
        .map((planList :List) => planList.get(0));
    }

    yield call(getHoursWorkedWorker, getHoursWorked({ currentDiversionPlansByParticipant }));
    yield call(getCourtTypeWorker, getCourtType({ currentDiversionPlansByParticipant }));

    yield put(getEnrollmentStatuses.success(id, { currentDiversionPlansByParticipant, enrollmentMap }));
  }
  catch (error) {
    LOG.error('caught exception in getEnrollmentStatusesWorker()', error);
    yield put(getEnrollmentStatuses.failure(id, error));
  }
  finally {
    yield put(getEnrollmentStatuses.finally(id));
  }
}

function* getEnrollmentStatusesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENROLLMENT_STATUSES, getEnrollmentStatusesWorker);
}

/*
 *
 * ParticipantsActions.getInfractions()
 *
 */

function* getInfractionsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getEnrollmentStatuses.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let response :Object = {};

  try {
    yield put(getInfractions.request(id));
    const { participants, peopleESID } = value;

    const participantEKIDs :UUID[] = participants
      .map((participant :Map) => getEntityKeyId(participant))
      .toJS();
    const app = yield select(getAppFromState);
    const infractionEventESID :UUID = getEntitySetIdFromApp(app, INFRACTION_EVENT);

    const searchFilter = {
      entityKeyIds: participantEKIDs,
      destinationEntitySetIds: [infractionEventESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: peopleESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    const infractionsMap :Map = fromJS(response.data)
      .map((participantInfractions :List) => {
        const mappedList :List = participantInfractions
          .map((infraction :Map) => getNeighborDetails(infraction));
        const sorted :List = sortEntitiesByDateProperty(mappedList, [DATETIME]);
        return sorted;
      });

    const infractionCountMap :Map = infractionsMap.map((infractions :List) => {
      const infractionCount = { [INFRACTIONS_CONSTS.WARNING]: 0, [INFRACTIONS_CONSTS.VIOLATION]: 0 };
      infractions.forEach((infraction :Map) => {
        const { [TYPE]: type } = getEntityProperties(infraction, [TYPE]);
        if (type === INFRACTIONS_CONSTS.WARNING) {
          infractionCount[INFRACTIONS_CONSTS.WARNING] += 1;
        }
        if (type === INFRACTIONS_CONSTS.VIOLATION) {
          infractionCount[INFRACTIONS_CONSTS.VIOLATION] += 1;
        }
      });
      return fromJS(infractionCount);
    });

    yield put(getInfractions.success(id, { infractionCountMap, infractionsMap }));
  }
  catch (error) {
    LOG.error('caught exception in getInfractionsWorker()', error);
    yield put(getInfractions.failure(id, error));
  }
  finally {
    yield put(getInfractions.finally(id));
  }
}

function* getInfractionsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INFRACTIONS, getInfractionsWorker);
}

/*
 *
 * ParticipantsActions.getParticipants()
 *
 */

function* getParticipantsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (value === null || value === undefined) {
    yield put(getParticipants.failure(id, ERR_ACTION_VALUE_NOT_DEFINED));
    return;
  }
  let participants :List = List();
  let allDiversionPlansByParticipant :Map = Map();
  let response :Object = {};

  try {
    yield put(getParticipants.request(id));
    const { diversionPlanESID, diversionPlans } = value;
    const app = yield select(getAppFromState);
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);

    if (diversionPlans.count() > 0) {

      const diversionPlanEKIDs = [];
      diversionPlans.forEach((diversionPlan :Map) => {
        const diversionPlanEKID :?UUID = getEntityKeyId(diversionPlan);
        if (diversionPlanEKID) diversionPlanEKIDs.push(diversionPlanEKID);
      });

      const searchFilter = {
        entityKeyIds: diversionPlanEKIDs,
        destinationEntitySetIds: [],
        sourceEntitySetIds: [peopleESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: diversionPlanESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }

      const participantsByDiversionPlanEKID :Map = fromJS(response.data)
        .map((participantsList :List) => getNeighborDetails(participantsList.get(0)));
      participants = participantsByDiversionPlanEKID.toIndexedSeq()
        .toSet()
        .toList();

      diversionPlans.forEach((diversionPlan :Map) => {
        const diversionPlanEKID :?UUID = getEntityKeyId(diversionPlan);
        const person :Map = participantsByDiversionPlanEKID.get(diversionPlanEKID);
        const personEKID :?UUID = getEntityKeyId(person);
        let personDiversionPlans = allDiversionPlansByParticipant.get(personEKID, List());
        personDiversionPlans = personDiversionPlans.push(diversionPlan);
        allDiversionPlansByParticipant = allDiversionPlansByParticipant.set(personEKID, personDiversionPlans);
      });
    }

    if (participants.count() > 0) {
      yield all([
        call(getEnrollmentStatusesWorker, getEnrollmentStatuses({ allDiversionPlansByParticipant })),
        call(getInfractionsWorker, getInfractions({ participants, peopleESID })),
        call(getParticipantPhotosWorker, getParticipantPhotos({ participants, peopleESID })),
      ]);
    }

    yield put(getParticipants.success(id, participants));
  }
  catch (error) {
    LOG.error('caught exception in getParticipantsWorker()', error);
    yield put(getParticipants.failure(id, error));
  }
  finally {
    yield put(getParticipants.finally(id));
  }
}

function* getParticipantsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANTS, getParticipantsWorker);
}

/*
 *
 * ParticipantsActions.getDiversionPlans()
 *
 */

function* getDiversionPlansWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id } = action;
  let response :Object = {};
  let diversionPlans :List = List();

  try {
    yield put(getDiversionPlans.request(id));

    const app = yield select(getAppFromState);
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: diversionPlanESID }));
    if (response.error) {
      throw response.error;
    }
    diversionPlans = fromJS(response.data).map((plan :Map) => getNeighborDetails(plan));

    yield call(getParticipantsWorker, getParticipants({ diversionPlanESID, diversionPlans }));

    yield put(getDiversionPlans.success(id));
  }
  catch (error) {
    LOG.error('caught exception in getDiversionPlansWorker()', error);
    yield put(getDiversionPlans.failure(id, error));
  }
  finally {
    yield put(getDiversionPlans.finally(id));
  }
}

function* getDiversionPlansWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_DIVERSION_PLANS, getDiversionPlansWorker);
}

export {
  addParticipantWatcher,
  addParticipantWorker,
  downloadParticipantsWatcher,
  downloadParticipantsWorker,
  getCourtTypeWatcher,
  getCourtTypeWorker,
  getDiversionPlansWatcher,
  getDiversionPlansWorker,
  getEnrollmentStatusesWatcher,
  getEnrollmentStatusesWorker,
  getHoursWorkedWatcher,
  getHoursWorkedWorker,
  getInfractionsWatcher,
  getInfractionsWorker,
  getParticipantPhotosWatcher,
  getParticipantPhotosWorker,
  getParticipantsWatcher,
  getParticipantsWorker,
};
