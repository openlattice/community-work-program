/*
 * @flow
 */
import { Map } from 'immutable';

import { APP } from './constants/ReduxStateConsts';

export const getEntitySetIdFromApp = (app :Object | Map, fqn :string) => {

  const orgId = app.get(APP.SELECTED_ORG_ID);
  return app.getIn([
    fqn,
    APP.ENTITY_SETS_BY_ORG,
    orgId
  ]);
};

export const convertPropertyMapToString = (map :Map) :string => {

  const obj = map.toJS();
  return `${obj.namespace}.${obj.name}`;
};

export const getPropertyTypeIdFromApp = (app :Object | Map, entityFqn :string, propertyFqn :string) => {

  const allProperties = app.getIn([entityFqn, APP.PROPERTY_TYPES]);
  const property = allProperties
    .find(propertyMap => convertPropertyMapToString(propertyMap.get('type')) === propertyFqn);
  return property.get('id');
};
