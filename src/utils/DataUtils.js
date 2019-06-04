/*
 * @flow
 */
import { Map } from 'immutable';
import { Models } from 'lattice';

import { isDefined } from './LangUtils';
import { NEIGHBOR_DETAILS, TYPE_IDS_BY_FQNS } from '../core/edm/constants/DataModelConsts';
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


export const getFirstNeighborValue = (
  neighborObj :Map,
  fqn :FullyQualifiedName,
  defaultValue :string = ''
) => neighborObj.getIn(

  [NEIGHBOR_DETAILS, fqn, 0],
  neighborObj.getIn([fqn, 0], neighborObj.get(fqn, defaultValue))
);

export const getEntityProperties = (entityObj :Map, propertyList :string[]) => {

  let returnPropertyFields = Map();
  if (propertyList.length && isDefined(entityObj)) {
    propertyList.forEach((propertyType) => {
      const backUpValue = entityObj.get(propertyType, '');
      const property = getFirstNeighborValue(entityObj, propertyType, backUpValue);
      returnPropertyFields = returnPropertyFields.set(propertyType, property);
    });
  }
  return returnPropertyFields.toJS();
};
