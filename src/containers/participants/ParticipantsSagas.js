/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { DateTime } from 'luxon';
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../utils/Errors';
import {
  ADD_PARTICIPANT,
  GET_COURT_TYPE,
  GET_DIVERSION_PLANS,
  GET_ENROLLMENT_STATUSES,
  GET_HOURS_WORKED,
  GET_INFRACTIONS,
  GET_PARTICIPANTS,
  GET_PARTICIPANT_PHOTOS,
  addParticipant,
  getCourtType,
  getDiversionPlans,
  getEnrollmentStatuses,
  getHoursWorked,
  getInfractions,
  getParticipantPhotos,
  getParticipants,
} from './ParticipantsActions';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
  sortEntitiesByDateProperty,
} from '../../utils/DataUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { isDefined } from '../../utils/LangUtils';
import { COURT_TYPES_MAP, INFRACTIONS_CONSTS } from '../../core/edm/constants/DataModelConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  IMAGE,
  INFRACTION_EVENT,
  MANUAL_PRETRIAL_COURT_CASES,
  PEOPLE,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const {
  COMPLETED,
  COURT_CASE_TYPE,
  DATETIME,
  EFFECTIVE_DATE,
  HOURS_WORKED,
  REQUIRED_HOURS,
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

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { entityKeyIds } = response.data;
    const app = yield select(getAppFromState);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const newParticipantEKID :UUID = entityKeyIds[peopleESID][0];

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
      participantEKIDs.push(getEntityKeyId(participant));
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
      const personEKID :UUID = getEntityKeyId(getNeighborDetails(person));
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
      diversionPlanEKIDs.push(getEntityKeyId(diversionPlan));
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
    let enrollmentsByCourtTypeGraphData :Map = Map({
      [COURT_TYPES_MAP.CHILD_SUPPORT]: 0,
      [COURT_TYPES_MAP.DRUG_COURT]: 0,
      [COURT_TYPES_MAP.DUI_COURT]: 0,
      [COURT_TYPES_MAP.HOPE_PROBATION]: 0,
      [COURT_TYPES_MAP.MENTAL_HEALTH]: 0,
      [COURT_TYPES_MAP.PROBATION]: 0,
      [COURT_TYPES_MAP.SENTENCED]: 0,
      [COURT_TYPES_MAP.VETERANS_COURT]: 0,
    });
    if (!casesAndPeopleByDiversionPlan.isEmpty()) {
      casesAndPeopleByDiversionPlan.forEach((caseAndPersonNeighbors :List) => {
        const person :Map = caseAndPersonNeighbors.find((neighbor :Map) => getNeighborESID(neighbor) === peopleESID);
        const personEKID :UUID = getEntityKeyId(getNeighborDetails(person));
        const courtCaseObj :Map = caseAndPersonNeighbors
          .find((neighbor :Map) => getNeighborESID(neighbor) === manualCasesESID);
        const courtCase :Map = getNeighborDetails(courtCaseObj);
        const { [COURT_CASE_TYPE]: courtCaseType } = getEntityProperties(courtCase, [COURT_CASE_TYPE]);
        courtTypeByParticipant = courtTypeByParticipant.set(personEKID, courtCaseType);
        const enrollmentCount :number = enrollmentsByCourtTypeGraphData.get(courtCaseType, 0);
        if (isDefined(enrollmentsByCourtTypeGraphData.get(courtCaseType))) {
          enrollmentsByCourtTypeGraphData = enrollmentsByCourtTypeGraphData.set(courtCaseType, enrollmentCount + 1);
        }
      });
    }

    yield put(getCourtType.success(id, { courtTypeByParticipant, enrollmentsByCourtTypeGraphData }));
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
        const sortedEnrollmentStatuses :List = sortEntitiesByDateProperty(statusesWithEffectiveDates, [EFFECTIVE_DATE]);
        const mostRecentStatus = sortedEnrollmentStatuses.last();

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
        const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
        diversionPlanEKIDs.push(diversionPlanEKID);
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
        const diversionPlanEKID :UUID = getEntityKeyId(diversionPlan);
        const person :Map = participantsByDiversionPlanEKID.get(diversionPlanEKID);
        const personEKID :UUID = getEntityKeyId(person);
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
    const totalDiversionPlanCount :number = response.data.length;
    diversionPlans = fromJS(response.data).map((plan :Map) => getNeighborDetails(plan));

    yield call(getParticipantsWorker, getParticipants({ diversionPlanESID, diversionPlans }));

    yield put(getDiversionPlans.success(id, totalDiversionPlanCount));
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
