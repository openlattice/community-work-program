/*
 * @flow
 */
import { Map } from 'immutable';
import { Models } from 'lattice';

import { isDefined } from './LangUtils';
import { NEIGHBOR_DETAILS } from '../core/edm/constants/DataModelConsts';

const { FullyQualifiedName } = Models;

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
