// @flow
import {
  List,
  Map,
  fromJS,
} from 'immutable';
import {
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

import Logger from '../../../utils/Logger';
import { ERR_ACTION_VALUE_NOT_DEFINED } from '../../../utils/Errors';

import {
  ADD_INFRACTION,
  DELETE_INFRACTION_EVENT,
  EDIT_INFRACTION_EVENT,
  GET_INFRACTION,
  GET_INFRACTION_TYPES,
  GET_PARTICIPANT_INFRACTIONS,
  addInfraction,
  deleteInfractionEvent,
  editInfractionEvent,
  getInfraction,
  getInfractionTypes,
  getParticipantInfractions,
} from './InfractionsActions';
import {
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getNeighborDetails,
  getNeighborESID,
} from '../../../utils/DataUtils';
import { isDefined } from '../../../utils/LangUtils';
import { deleteEntities, submitDataGraph, submitPartialReplace } from '../../../core/sagas/data/DataActions';
import {
  deleteEntitiesWorker,
  submitDataGraphWorker,
  submitPartialReplaceWorker
} from '../../../core/sagas/data/DataSagas';
import { STATE } from '../../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { INFRACTIONS_CONSTS } from '../../../core/edm/constants/DataModelConsts';

const { getEntityData, getEntitySetData } = DataApiActions;
const { getEntityDataWorker, getEntitySetDataWorker } = DataApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const {
  ENROLLMENT_STATUS,
  INFRACTION_EVENT,
  INFRACTIONS,
  PEOPLE,
  REGISTERED_FOR,
  RESULTS_IN,
  WORKSITE_PLAN,
} = APP_TYPE_FQNS;
const { CATEGORY, STATUS, TYPE } = PROPERTY_TYPE_FQNS;

const getAppFromState = (state) => state.get(STATE.APP, Map());
const getEdmFromState = (state) => state.get(STATE.EDM, Map());

const LOG = new Logger('InfractionsSagas');
/*
 *
 * InfractionsActions.addInfraction()
 *
 */

function* addInfractionWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};

  try {
    yield put(addInfraction.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }
    const { data } :Object = response;
    const { entityKeyIds } :Object = data;
    const app = yield select(getAppFromState);
    const infractionEventESID = getEntitySetIdFromApp(app, INFRACTION_EVENT);
    const infractionEventEKID = entityKeyIds[infractionEventESID][0];

    const worksitePlanESID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
    const registeredForESID = getEntitySetIdFromApp(app, REGISTERED_FOR);
    const resultsInESID = getEntitySetIdFromApp(app, RESULTS_IN);
    const enrollmentStatusESID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
    const infractionESID = getEntitySetIdFromApp(app, INFRACTIONS);
    const edm = yield select(getEdmFromState);

    yield put(addInfraction.success(id, {
      edm,
      enrollmentStatusESID,
      infractionESID,
      infractionEventEKID,
      infractionEventESID,
      resultsInESID,
      registeredForESID,
      worksitePlanESID
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in addInfractionWorker()', error);
    yield put(addInfraction.failure(id, error));
  }
  finally {
    yield put(addInfraction.finally(id));
  }
}

function* addInfractionWatcher() :Generator<*, *, *> {

  yield takeEvery(ADD_INFRACTION, addInfractionWorker);
}

/*
 *
 * InfractionsActions.deleteInfractionEvent()
 *
 */

function* deleteInfractionEventWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  if (!isDefined(value)) throw ERR_ACTION_VALUE_NOT_DEFINED;
  let response :Object = {};

  try {
    yield put(deleteInfractionEvent.request(id, value));

    response = yield call(deleteEntitiesWorker, deleteEntities(value));
    if (response.error) throw response.error;
    const { entityKeyIds } = value[0];
    const [entityKeyId] = entityKeyIds;

    yield put(deleteInfractionEvent.success(id, entityKeyId));
  }
  catch (error) {
    LOG.error('caught exception in deleteInfractionEventWorker()', error);
    yield put(deleteInfractionEvent.failure(id, error));
  }
  finally {
    yield put(deleteInfractionEvent.finally(id));
  }
}

function* deleteInfractionEventWatcher() :Generator<*, *, *> {

  yield takeEvery(DELETE_INFRACTION_EVENT, deleteInfractionEventWorker);
}

/*
 *
 * InfractionsActions.editInfractionEvent()
 *
 */

function* editInfractionEventWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;

  try {
    yield put(editInfractionEvent.request(id, value));

    const response = yield call(submitPartialReplaceWorker, submitPartialReplace(value));
    if (response.error) {
      throw response.error;
    }
    const app = yield select(getAppFromState);
    const infractionEventESID :UUID = getEntitySetIdFromApp(app, INFRACTION_EVENT);
    const edm = yield select(getEdmFromState);

    yield put(editInfractionEvent.success(id, { infractionEventESID, edm }));
  }
  catch (error) {
    LOG.error('caught exception in editInfractionEventWorker()', error);
    yield put(editInfractionEvent.failure(id, error));
  }
  finally {
    yield put(editInfractionEvent.finally(id));
  }
}

function* editInfractionEventWatcher() :Generator<*, *, *> {

  yield takeEvery(EDIT_INFRACTION_EVENT, editInfractionEventWorker);
}

/*
 *
 * InfractionsActions.getInfraction()
 *
 */

function* getInfractionWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let infractionEvent :Map = Map();
  let infractionType :Map = Map();

  try {
    yield put(getInfraction.request(id));
    const { infractionEventEKID } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const app = yield select(getAppFromState);
    const infractionEventESID :UUID = getEntitySetIdFromApp(app, INFRACTION_EVENT);

    response = yield call(getEntityDataWorker, getEntityData({
      entitySetId: infractionEventESID,
      entityKeyId: infractionEventEKID
    }));
    if (response.error) {
      throw response.error;
    }
    infractionEvent = fromJS(response.data);

    const infractionESID :UUID = getEntitySetIdFromApp(app, INFRACTIONS);
    const searchFilter = {
      entityKeyIds: [infractionEventEKID],
      destinationEntitySetIds: [infractionESID],
      sourceEntitySetIds: [],
    };
    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({ entitySetId: infractionEventESID, filter: searchFilter })
    );
    if (response.error) {
      throw response.error;
    }

    if (response.data[infractionEventEKID]) {
      const infractionResult = fromJS(response.data[infractionEventEKID][0]);
      infractionType = getNeighborDetails(infractionResult);
    }

    yield put(getInfraction.success(id, { infractionEvent, infractionType }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getInfractionWorker()', error);
    yield put(getInfraction.failure(id, error));
  }
  finally {
    yield put(getInfraction.finally(id));
  }
  return workerResponse;
}

function* getInfractionWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INFRACTION, getInfractionWorker);
}

/*
 *
 * InfractionsActions.getInfractionTypes()
 *
 */

function* getInfractionTypesWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let infractionTypes :List = List();

  try {
    yield put(getInfractionTypes.request(id, value));

    const app = yield select(getAppFromState);
    const infractionsESID :UUID = getEntitySetIdFromApp(app, INFRACTIONS);

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: infractionsESID }));
    if (response.error) {
      throw response.error;
    }
    infractionTypes = fromJS(response.data);
    yield put(getInfractionTypes.success(id, infractionTypes));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getInfractionTypesWorker()', error);
    yield put(getInfractionTypes.failure(id, error));
  }
  finally {
    yield put(getInfractionTypes.finally(id));
  }
  return workerResponse;
}

function* getInfractionTypesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_INFRACTION_TYPES, getInfractionTypesWorker);
}

/*
 *
 * InfractionsActions.getParticipantInfractions()
 *
 */

function* getParticipantInfractionsWorker(action :SequenceAction) :Generator<*, *, *> {

  const { id, value } = action;
  const workerResponse = {};
  let response :Object = {};
  let infractionsMap :Map = Map().withMutations((map :Map) => {
    map.set(INFRACTIONS_CONSTS.VIOLATION, List());
    map.set(INFRACTIONS_CONSTS.WARNING, List());
  });
  let infractionsList :List = List();
  let infractionInfoMap :Map = Map();

  try {
    yield put(getParticipantInfractions.request(id));
    const { personEKID } = value;
    if (value === null || value === undefined) {
      throw ERR_ACTION_VALUE_NOT_DEFINED;
    }
    const app = yield select(getAppFromState);
    const peopleESID :UUID = getEntitySetIdFromApp(app, PEOPLE);
    const infractionEventESID :UUID = getEntitySetIdFromApp(app, INFRACTION_EVENT);

    let searchFilter = {
      entityKeyIds: [personEKID],
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

    if (response.data[personEKID]) {
      infractionsList = fromJS(response.data[personEKID])
        .map((infraction :Map) => getNeighborDetails(infraction));
      infractionsList.forEach((infraction :Map) => {
        const { [TYPE]: type } = getEntityProperties(infraction, [TYPE]);
        if (type === INFRACTIONS_CONSTS.WARNING) {
          let warnings = infractionsMap.get(INFRACTIONS_CONSTS.WARNING);
          warnings = warnings.push(infraction);
          infractionsMap = infractionsMap.set(INFRACTIONS_CONSTS.WARNING, warnings);
        }
        if (type === INFRACTIONS_CONSTS.VIOLATION) {
          let violations = infractionsMap.get(INFRACTIONS_CONSTS.VIOLATION);
          violations = violations.push(infraction);
          infractionsMap = infractionsMap.set(INFRACTIONS_CONSTS.VIOLATION, violations);
        }
      });

      const infractionEventEKIDs :UUID[] = [];
      infractionsList
        .forEach((infraction :Map) => {
          infractionEventEKIDs.push(getEntityKeyId(infraction));
        });
      const infractionsESID :UUID = getEntitySetIdFromApp(app, INFRACTIONS);
      const enrollmentStatusESID :UUID = getEntitySetIdFromApp(app, ENROLLMENT_STATUS);
      const worksitePlanESID :UUID = getEntitySetIdFromApp(app, WORKSITE_PLAN);
      searchFilter = {
        entityKeyIds: infractionEventEKIDs,
        destinationEntitySetIds: [enrollmentStatusESID, infractionsESID],
        sourceEntitySetIds: [worksitePlanESID],
      };
      response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({ entitySetId: infractionEventESID, filter: searchFilter })
      );
      if (response.error) {
        throw response.error;
      }
      const infractionEventNeighbors :Map = fromJS(response.data);

      if (!infractionEventNeighbors.isEmpty()) {

        infractionEventNeighbors.forEach((neighborList :List, infractionEventEKID :UUID) => {
          neighborList.forEach((neighbor :Map) => {
            const neighborESID = getNeighborESID(neighbor);
            const entity :Map = getNeighborDetails(neighbor);
            let infractionEventMap :Map = infractionInfoMap.get(infractionEventEKID, Map());

            if (neighborESID === infractionsESID) {
              const { [CATEGORY]: violationCategory } = getEntityProperties(entity, [CATEGORY]);
              infractionEventMap = infractionEventMap.set(CATEGORY, violationCategory);
              infractionInfoMap = infractionInfoMap.set(infractionEventEKID, infractionEventMap);
            }
            else if (neighborESID === enrollmentStatusESID) {
              const { [STATUS]: enrollmentStatus } = getEntityProperties(entity, [STATUS]);
              infractionEventMap = infractionEventMap.set(STATUS, enrollmentStatus);
              infractionInfoMap = infractionInfoMap.set(infractionEventEKID, infractionEventMap);
            }
            else if (neighborESID === worksitePlanESID) {
              const worksitePlanEKID :UUID = getEntityKeyId(entity);
              infractionEventMap = infractionEventMap.set(WORKSITE_PLAN, worksitePlanEKID);
              infractionInfoMap = infractionInfoMap.set(infractionEventEKID, infractionEventMap);
            }

          });
        });
      }
    }

    yield put(getParticipantInfractions.success(id, { infractionInfoMap, infractionsMap }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error('caught exception in getParticipantInfractionsWorker()', error);
    yield put(getParticipantInfractions.failure(id, error));
  }
  finally {
    yield put(getParticipantInfractions.finally(id));
  }
  return workerResponse;
}

function* getParticipantInfractionsWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_PARTICIPANT_INFRACTIONS, getParticipantInfractionsWorker);
}

export {
  addInfractionWatcher,
  addInfractionWorker,
  deleteInfractionEventWatcher,
  deleteInfractionEventWorker,
  editInfractionEventWatcher,
  editInfractionEventWorker,
  getInfractionWatcher,
  getInfractionWorker,
  getInfractionTypesWatcher,
  getInfractionTypesWorker,
  getParticipantInfractionsWatcher,
  getParticipantInfractionsWorker,
};
