/*
 * @flow
 */
import { isImmutable, List, Map } from 'immutable';
import { Models } from 'lattice';
import { DateTime } from 'luxon';
import type { UUID } from 'lattice';

import {
  ASSOCIATION_ENTITY_SET,
  NEIGHBOR_DETAILS,
  NEIGHBOR_ENTITY_SET,
  SEARCH_PREFIX,
} from '../core/edm/constants/DataModelConsts';
import { PROPERTY_TYPE_FQNS } from '../core/edm/constants/FullyQualifiedNames';
import { APP, EDM } from './constants/ReduxStateConsts';

const { FQN } = Models;
const { ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;
const {
  PROPERTY_TYPES,
  TYPES_BY_ID,
  TYPE_IDS_BY_FQNS,
} = EDM;

/* entity and property types */
const getEntitySetIdFromApp = (app :Object | Map, fqn :FQN) => {

  const orgId = app.get(APP.SELECTED_ORG_ID);
  return app.getIn([
    APP.ENTITY_SET_IDS_BY_ORG,
    orgId,
    fqn
  ]);
};

const getPropertyTypeIdFromEdm = (
  edm :Object | Map, propertyFqn :FQN
) => edm.getIn([TYPE_IDS_BY_FQNS, PROPERTY_TYPES, propertyFqn]);

const getPropertyFqnFromEdm = (edm :Object | Map, propertyTypeId :UUID) => {
  const propertyType = edm.getIn([TYPES_BY_ID, PROPERTY_TYPES, propertyTypeId, 'type']);
  return FQN.of(propertyType);
};

const getNeighborESID = (neighbor :Map) => (neighbor.getIn([NEIGHBOR_ENTITY_SET, 'id']));
const getAssociationNeighborESID = (neighbor :Map) => (neighbor.getIn([ASSOCIATION_ENTITY_SET, 'id']));

/* entity data */
const getFirstNeighborValue = (
  neighborObj :Map,
  fqn :FQN | string,
  defaultValue :string = ''
) => neighborObj.getIn(

  [NEIGHBOR_DETAILS, fqn, 0],
  neighborObj.getIn([fqn, 0], neighborObj.get(fqn, defaultValue))
);

const getEntityProperties = (entityObj :Map, propertyList :string[]) => {

  const returnPropertyFields = {};
  if (propertyList.length && isImmutable(entityObj) && entityObj.count() > 0) {
    propertyList.forEach((propertyType) => {
      const backUpValue = entityObj.get(propertyType, '');
      const property = getFirstNeighborValue(entityObj, propertyType, backUpValue);
      returnPropertyFields[propertyType] = property;
    });
  }
  return returnPropertyFields;
};

const getNeighborDetails = (neighborObj :Map) :Map => {
  let neighborDetails :Map = Map();
  if (isImmutable(neighborObj)) {
    neighborDetails = neighborObj.get(NEIGHBOR_DETAILS, neighborObj);
  }
  return neighborDetails;
};

const getEntityKeyId = (entityObj :Map) :string => {
  if (isImmutable(entityObj)) {
    const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(entityObj, [ENTITY_KEY_ID]);
    return entityKeyId;
  }
  return '';
};

/* manipulate entity data */
const sortEntitiesByDateProperty = (
  entityCollection :List | Map,
  datePropertyPath :FQN[]
) :List | Map => entityCollection

  .sortBy((entityObj :Map) => {
    const date = DateTime.fromISO(entityObj.getIn(datePropertyPath.concat([0])));
    return date.valueOf();
  });

const findEntityPathInMap = (entityMap :Map, entityEKID :UUID) :any[] => {

  let keyEKID :string = '';
  let index :number = -1;
  if (isImmutable(entityMap) && !entityMap.isEmpty()) {
    entityMap.forEach((innerEntityList :List, mapKeyEKID :UUID) => {
      const targetIndex :number = innerEntityList.findIndex((entity :Map) => getEntityKeyId(entity) === entityEKID);
      if (targetIndex !== -1) {
        index = targetIndex;
        keyEKID = mapKeyEKID;
        return false;
      }
      return true;
    });
  }
  return [keyEKID, index];
};

const getValuesFromEntityList = (entities :List, propertyList :FQN[]) => {

  const values = [];
  const labels = [];
  entities.forEach((entity :Map) => {

    let label :string = '';
    propertyList.forEach((propertyType) => {
      const backUpValue = entity.get(propertyType, '');
      const property = getFirstNeighborValue(entity, propertyType, backUpValue);
      label = label.concat(' ', property);
    });
    const entityEKID :UUID = getEntityKeyId(entity);

    labels.push(label);
    values.push(entityEKID);
  });

  return [values, labels];
};

/* search queries */
const getSearchTerm = (
  propertyTypeId :UUID,
  searchString :string
) => `${SEARCH_PREFIX}.${propertyTypeId}:"${searchString}"`;

const getSearchTermNotExact = (
  propertyTypeId :UUID,
  searchString :string
) => `${SEARCH_PREFIX}.${propertyTypeId}:${searchString}`;

const getUTCDateRangeSearchString = (PTID :UUID, timeUnits :any, startDate :DateTime, endDate :?DateTime) => {
  let start = startDate.toUTC().toISO();
  let end;
  if (!endDate) {
    start = startDate.startOf(timeUnits).toUTC().toISO();
    end = startDate.endOf(timeUnits).toUTC().toISO();
  }
  else {
    end = endDate.toUTC().toISO();
  }
  const dateRangeString = `[${start} TO ${end}]`;
  return getSearchTermNotExact(PTID, dateRangeString);
};

export {
  findEntityPathInMap,
  getAssociationNeighborESID,
  getEntityKeyId,
  getEntityProperties,
  getEntitySetIdFromApp,
  getFirstNeighborValue,
  getNeighborDetails,
  getNeighborESID,
  getPropertyFqnFromEdm,
  getPropertyTypeIdFromEdm,
  getSearchTerm,
  getSearchTermNotExact,
  getUTCDateRangeSearchString,
  getValuesFromEntityList,
  sortEntitiesByDateProperty,
};
