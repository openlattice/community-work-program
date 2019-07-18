/*
 * @flow
 */
import { List, Map } from 'immutable';
import type { FQN } from 'lattice';

import Logger from './Logger';
import { isDefined } from './LangUtils';

const LOG :Logger = new Logger('DataProcessingUtils');

/* eslint-disable import/prefer-default-export */
export function processEntityData(data :Map, edmPropertyTypes :Map) :{} {

  if (!Map.isMap(data) || data.isEmpty()) {
    const errorMsg :string = '"data" param must be a non-empty immutable map';
    LOG.error(errorMsg, data);
    throw new Error(errorMsg);
  }

  if (!Map.isMap(edmPropertyTypes) || edmPropertyTypes.isEmpty()) {
    const errorMsg :string = '"edmPropertyTypes" param must be a non-empty immutable map';
    LOG.error(errorMsg, edmPropertyTypes);
    throw new Error(errorMsg);
  }

  let processedData :Map = Map();

  const entitySetId :UUID = data.get('entitySetId');
  const entityData = data.get('entityData');

  let entityList :List = List();
  let entity :Map = Map();

  entityData.forEach((value :any, property :FQN) => {

    const propertyTypeId :UUID = edmPropertyTypes.get(property);
    if (isDefined(value)) {
      entity = entity.set(propertyTypeId, [value]);
    }
  });

  entityList = entityList.set(0, entity);
  processedData = processedData.set(entitySetId, entityList);

  return processedData.toJS();
}
