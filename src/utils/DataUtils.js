/*
 * @flow
 */
import { isImmutable, List, Map } from 'immutable';
import { Models } from 'lattice';
import { DateTime } from 'luxon';
import type { FQN } from 'lattice';

import {
  NEIGHBOR_DETAILS,
  NEIGHBOR_ENTITY_SET,
  TYPE_IDS_BY_FQNS,
  TYPES_BY_ID
} from '../core/edm/constants/DataModelConsts';
import { ENTITY_KEY_ID } from '../core/edm/constants/FullyQualifiedNames';
import { APP } from './constants/ReduxStateConsts';

const { FullyQualifiedName } = Models;

export const getEntitySetIdFromApp = (app :Object | Map, fqn :FullyQualifiedName) => {

  const orgId = app.get(APP.SELECTED_ORG_ID);
  return app.getIn([
    fqn,
    APP.ENTITY_SETS_BY_ORG,
    orgId
  ]);
};

export const getPropertyTypeIdFromEdm = (
  edm :Object | Map, propertyFqn :FullyQualifiedName
) => edm.getIn([TYPE_IDS_BY_FQNS, propertyFqn]);

export const getPropertyFqnFromEdm = (edm :Object | Map, propertyTypeId :UUID) => {
  const propertyType = edm.getIn([TYPES_BY_ID, propertyTypeId, 'type']);
  return new FullyQualifiedName(propertyType);
};

export const getFirstNeighborValue = (
  neighborObj :Map,
  fqn :FullyQualifiedName,
  defaultValue :string = ''
) => neighborObj.getIn(

  [NEIGHBOR_DETAILS, fqn, 0],
  neighborObj.getIn([fqn, 0], neighborObj.get(fqn, defaultValue))
);

export const getEntityProperties = (entityObj :Map, propertyList :string[]) => {

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

export const getNeighborDetails = (neighborObj :Map) :Map => {
  let neighborDetails :Map = Map();
  if (isImmutable(neighborObj)) {
    neighborDetails = neighborObj.get(NEIGHBOR_DETAILS, neighborObj);
  }
  return neighborDetails;
};

export const getEntityKeyId = (entityObj :Map) :string => {
  if (isImmutable(entityObj)) {
    const { [ENTITY_KEY_ID]: entityKeyId } = getEntityProperties(entityObj, [ENTITY_KEY_ID]);
    return entityKeyId;
  }
  return '';
};

export const sortEntitiesByDateProperty = (
  entityCollection :List | Map,
  datePropertyFqn :FQN
) :List | Map => entityCollection

  .sort((entityObjA :Map, entityObjB :Map) => {
    const dateA = DateTime.fromISO(entityObjA.getIn([datePropertyFqn, 0]));
    const dateB = DateTime.fromISO(entityObjB.getIn([datePropertyFqn, 0]));
    if (dateA.toISO() === dateB.toISO()) {
      return 0;
    }
    return dateA < dateB ? -1 : 1;
  });

export const getNeighborESID = (neighbor :Map) => (neighbor.getIn([NEIGHBOR_ENTITY_SET, 'id']));
