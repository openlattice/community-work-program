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
  GET_DIVERSION_PLANS,
  GET_ENROLLMENT_STATUSES,
  GET_HOURS_WORKED,
  GET_INFRACTIONS,
  GET_PARTICIPANTS,
  addParticipant,
  getDiversionPlans,
  getEnrollmentStatuses,
  getHoursWorked,
  getInfractions,
  getParticipants,
} from './ParticipantsActions';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getFirstNeighborValue,
  getNeighborDetails,
} from '../../utils/DataUtils';
import { STATE } from '../../utils/constants/ReduxStateConsts';
import {
  APP_TYPE_FQNS,
  DIVERSION_PLAN_FQNS,
  ENROLLMENT_STATUS_FQNS,
  INFRACTION_FQNS,
  WORKSITE_PLAN_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { isDefined } from '../../utils/LangUtils';
import { INFRACTIONS_CONSTS, NEIGHBOR_ENTITY_SET } from '../../core/edm/constants/DataModelConsts';

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  DIVERSION_PLAN,
  ENROLLMENT_STATUS,
  INFRACTIONS,
  PEOPLE,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { TYPE } = INFRACTION_FQNS;
const { COMPLETED, REQUIRED_HOURS } = DIVERSION_PLAN_FQNS;
const { HOURS_WORKED } = WORKSITE_PLAN_FQNS;
const { EFFECTIVE_DATE } = ENROLLMENT_STATUS_FQNS;

const getAppFromState = state => state.get(STATE.APP, Map());
const getEdmFromState = state => state.get(STATE.EDM, Map());

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
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;

    const edm = yield select(getEdmFromState);
    const app = yield select(getAppFromState);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const personEKID :UUID = entityKeyIds[peopleESID][0];
    const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);

    yield put(addParticipant.success(id, {
      diversionPlanESID,
      edm,
      personEKID,
      peopleESID,
    }));
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
    const { diversionPlansByParticipant, diversionPlanESID, peopleESID } = value;

    /*
     * 1. Get required hours from each diversion plan.
     */
    const requiredHours = diversionPlansByParticipant
      .map((planArray :List) => {
        const { [REQUIRED_HOURS]: reqHours } = getEntityProperties(planArray.get(0), [REQUIRED_HOURS]);
        return reqHours;
      });

    /*
     * 2. Get hours worked from worksite plans.
     */
    const app = yield select(getAppFromState);
    const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const planEKIDs = diversionPlansByParticipant
      .map((planArray :List) => getEntityKeyId(planArray.get(0)))
      .valueSeq()
      .toArray();
    const searchFilter = {
      entityKeyIds: planEKIDs,
      destinationEntitySetIds: [worksitePlanESID],
      sourceEntitySetIds: [peopleESID],
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
    diversionPlanNeighbors.forEach((plan :Map) => {

      const person :UUID = plan.find((neighbor :Map) => neighbor
        .getIn([NEIGHBOR_ENTITY_SET, 'name']).includes(PEOPLE.toString().split('.')[1]));
      const personEKID = getEntityKeyId(getNeighborDetails(person));
      const worksitePlans :List = plan.filter((neighbor :Map) => neighbor
        .getIn([NEIGHBOR_ENTITY_SET, 'name']).includes(WORKSITE_PLAN.toString().split('.')[1]));
      let hoursWorked :number = 0;
      if (worksitePlans.count() === 1) {
        hoursWorked = getFirstNeighborValue(worksitePlans.get(0), HOURS_WORKED);
      }
      if (worksitePlans.count() > 1) {
        hoursWorked = worksitePlans
          .reduce((worksitePlanA :Map, worksitePlanB :Map) => {
            const hoursA = getFirstNeighborValue(worksitePlanA, HOURS_WORKED);
            const hoursB = getFirstNeighborValue(worksitePlanB, HOURS_WORKED);
            return hoursA + hoursB;
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

  try {
    yield put(getEnrollmentStatuses.request(id));

    /*
     * 1. Get participant EKIDs.
     */
    const { diversionPlansByParticipant } = value;
    const participantEKIDs :UUID[] = diversionPlansByParticipant.keySeq().toArray();

    if (!diversionPlansByParticipant.isEmpty()) {

      /*
       * 3. Create map of { participant : active diversion plan }.
       *    If participant doesn't have an active diversion plan: { participant: all diversion plans }.
       *    Also create map of all { diversionPlanEKID: participantEKID } for easy lookup later.
       */
      const activeDiversionPlansByParticipantIfAny = diversionPlansByParticipant
        .map((planList :List) => {
          const newPlanList :List = List();
          const activePlan :Map = planList.find((plan :Map) => {
            const { [COMPLETED]: completed } = getEntityProperties(plan, [COMPLETED]);
            return !completed;
          });
          if (!isDefined(activePlan)) {
            return planList;
          }
          return newPlanList.push(activePlan);
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
       * 4. Find enrollment statuses for all diversion plans in map above.
       */

      const app = yield select(getAppFromState);
      const diversionPlanESID :UUID = getEntitySetIdFromApp(app, DIVERSION_PLAN);
      const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
      const enrollmentFilter :Object = {
        entityKeyIds: diversionPlanEKIDs,
        destinationEntitySetIds: [enrollmentStatusESID],
        sourceEntitySetIds: [],
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
       * 5. Create new map of { participantEKID: most recent enrollment status }.
       */
      enrollmentSearchResults.forEach((enrollmentList :List, diversionPlanEKID :UUID) => {
        const participantEKID :UUID = diversionPlanEKIDMap.get(diversionPlanEKID);
        let personEnrollment :Map = enrollmentMap.get(participantEKID, Map());

        const sortedEnrollmentStatuses :List = enrollmentList.sort((statusA :Map, statusB :Map) => {
          const dateA = DateTime.fromISO(statusA.getIn([EFFECTIVE_DATE, 0]));
          const dateB = DateTime.fromISO(statusB.getIn([EFFECTIVE_DATE, 0]));
          if (dateA.toISO() === dateB.toISO()) {
            return 0;
          }
          return dateA < dateB ? -1 : 1;
        });

        const mostRecentStatus = sortedEnrollmentStatuses.last();
        const mostRecentStatusDate = DateTime.fromISO(mostRecentStatus.getIn([EFFECTIVE_DATE, 0]));

        let { [EFFECTIVE_DATE]: storedStatusDate } = getEntityProperties(personEnrollment, [EFFECTIVE_DATE]);
        storedStatusDate = DateTime.fromISO(storedStatusDate);
        if (personEnrollment.count() > 0) {
          if (storedStatusDate < mostRecentStatusDate) personEnrollment = mostRecentStatus;
        }
        if (personEnrollment.count() === 0) {
          personEnrollment = mostRecentStatus;
        }

        enrollmentMap = enrollmentMap.set(participantEKID, personEnrollment);
      });
    }

    /*
     * 6. If no enrollment status for a person exists, set enrollment to empty Map().
     */
    const participantsWithoutEnrollmentStatus :UUID[] = participantEKIDs
      .filter(ekid => !isDefined(enrollmentMap.get(ekid)));
    participantsWithoutEnrollmentStatus.forEach((ekid :string) => {
      enrollmentMap = enrollmentMap.set(ekid, Map());
    });

    yield put(getEnrollmentStatuses.success(id, enrollmentMap));
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
    const infractionsESID :UUID = getEntitySetIdFromApp(app, INFRACTIONS);

    const searchFilter = {
      entityKeyIds: participantEKIDs,
      destinationEntitySetIds: [infractionsESID],
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
      .map((participant :Map) => participant
        .map((infraction :Map) => getNeighborDetails(infraction)));

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
  let diversionPlansByParticipant :Map = Map();
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
        let personDiversionPlans = diversionPlansByParticipant.get(personEKID, List());
        personDiversionPlans = personDiversionPlans.push(diversionPlan);
        diversionPlansByParticipant = diversionPlansByParticipant.set(personEKID, personDiversionPlans);
      });
    }

    if (participants.count() > 0) {
      yield all([
        call(getEnrollmentStatusesWorker, getEnrollmentStatuses({ diversionPlansByParticipant })),
        call(getInfractionsWorker, getInfractions({ participants, peopleESID })),
        call(getHoursWorkedWorker, getHoursWorked({ diversionPlanESID, diversionPlansByParticipant, peopleESID })),
      ]);
    }

    yield put(getParticipants.success(id, { diversionPlansByParticipant, participants }));
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
  getDiversionPlansWatcher,
  getDiversionPlansWorker,
  getEnrollmentStatusesWatcher,
  getEnrollmentStatusesWorker,
  getHoursWorkedWatcher,
  getHoursWorkedWorker,
  getInfractionsWatcher,
  getInfractionsWorker,
  getParticipantsWatcher,
  getParticipantsWorker,
};
