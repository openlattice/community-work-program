/*
 * @flow
 */
import { List, Map } from 'immutable';
import isBoolean from 'lodash/isBoolean';
import isFinite from 'lodash/isFinite';
import isFunction from 'lodash/isFunction';
import isInteger from 'lodash/isInteger';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import { Models } from 'lattice';
import type { FQN } from 'lattice';

import Logger from './Logger';
import { isDefined, isDigitOnlyString, isNonEmptyString } from './LangUtils';
import { isValidUUID, validateNonEmptyArray } from './ValidationUtils';
import { getEntitySetIdFromApp } from './DataUtils';

const LOG :Logger = new Logger('DataProcessingUtils');

const ATAT :string = '__@@__';

const { FullyQualifiedName } = Models;

function isValidDataPrimitive(value :any) :boolean {

  return isBoolean(value) || isFinite(value) || isPlainObject(value) || isString(value);
}

function isValidDataPrimitiveArray(values :any) :boolean {

  return validateNonEmptyArray(values, (value :any) => isValidDataPrimitive(value));
}

export type EntityAddress = {|
  entityIndex ? :number;
  entityKeyId ? :UUID;
  entitySetName :string;
  propertyTypeFQN :FQN;
|};

function getEntityAddressKey(
  indexOrEntityKeyId :number | UUID,
  entitySetName :FQN | string,
  propertyFQN :FQN | string
) :string {

  let errorMsg :string = '';

  if (!isInteger(indexOrEntityKeyId) && !isValidUUID(indexOrEntityKeyId)) {
    errorMsg = 'invalid param: indexOrEntityKeyId must be either an integer or a UUID';
    LOG.error(errorMsg, indexOrEntityKeyId);
    throw new Error(errorMsg);
  }

  if (!FullyQualifiedName.isValid(entitySetName)) {
    errorMsg = 'invalid param: entitySetName must be a valid FullyQualifiedName';
    LOG.error(errorMsg, entitySetName);
    throw new Error(errorMsg);
  }

  if (!FullyQualifiedName.isValid(propertyFQN)) {
    errorMsg = 'invalid param: propertyFQN must be a valid FullyQualifiedName';
    LOG.error(errorMsg, propertyFQN);
    throw new Error(errorMsg);
  }

  return `${indexOrEntityKeyId}${ATAT}${entitySetName.toString()}${ATAT}${propertyFQN.toString()}`;
}

function parseEntityAddressKey(entityAddressKey :string) :EntityAddress {

  const split :string[] = entityAddressKey.split(ATAT);

  if (split && split.length === 3) {
    // NOTE: be careful! parseInt() will incorrectly return a number when given certain UUID strings
    const entityIndex :number = parseInt(split[0], 10);
    const entityKeyId :UUID = split[0];
    const entitySetName :string = split[1];
    const propertyTypeFQN :string = split[2];
    if (isNonEmptyString(entitySetName) && FullyQualifiedName.isValid(propertyTypeFQN)) {
      if (isValidUUID(entityKeyId)) {
        return {
          entityKeyId,
          entitySetName: new FullyQualifiedName(entitySetName), // FQN because entitySetName is an AppType
          propertyTypeFQN: new FullyQualifiedName(propertyTypeFQN),
        };
      }
      if (entityIndex < 0 || (isDigitOnlyString(split[0]) && isInteger(entityIndex))) {
        return {
          entityIndex,
          entitySetName: new FullyQualifiedName(entitySetName),
          propertyTypeFQN: new FullyQualifiedName(propertyTypeFQN),
        };
      }
    }
  }

  const errorMsg :string = 'unable to parse entity address key';
  LOG.error(errorMsg, entityAddressKey);
  throw new Error(errorMsg);
}

function processEntityValue(value :any) :any {

  const processedValue :any = value;

  if (isDefined(processedValue)) {
    if (isValidDataPrimitive(processedValue)) {
      return [processedValue];
    }
    if (isValidDataPrimitiveArray(processedValue)) {
      return processedValue;
    }
    if (List.isList(processedValue)) {
      LOG.error('entity values as immutable lists are not supported', processedValue);
    }
    if (Map.isMap(processedValue)) {
      LOG.error('entity values as immutable maps are not supported', processedValue);
    }
    LOG.warn('processEntityValue() - unable to process value', processedValue);
  }

  // TODO: what should be returned here?
  return undefined;
}

function processEntityData(data :Map, edmPropertyTypes :Map, app :Map) :{} {

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
  data.forEach((value :any, key :string) => {

    const { entityIndex, entitySetName, propertyTypeFQN } = parseEntityAddressKey(key);
    const entitySetId :UUID = getEntitySetIdFromApp(app, entitySetName);
    const propertyTypeId :UUID = edmPropertyTypes.get(propertyTypeFQN);
    const processedValue :any = processEntityValue(value);

    let entities :List = processedData.get(entitySetId, List());
    let entity :Map = entities.get(entityIndex, Map());

    if (isDefined(processedValue)) {
      entity = entity.set(propertyTypeId, processedValue);
    }

    entities = entities.set(entityIndex, entity);
    processedData = processedData.set(entitySetId, entities);

  });

  return processedData.toJS();
}

function processAssociationEntityData(data :List, edmPropertyTypes :Map, app :Map) :{} {

  let processedData :Map = Map();

  data.forEach((parts) => {

    const edgeEntitySetName :string = parts.get(0);
    const edgeEntitySetId :UUID = getEntitySetIdFromApp(app, edgeEntitySetName);

    const sourceIndexOrId :number | UUID = parts.get(1);
    const sourceEntitySetName :string = parts.get(2);
    const sourceEntitySetId :UUID = getEntitySetIdFromApp(app, sourceEntitySetName);

    const destinationIndexOrId :number | UUID = parts.get(3);
    const destinationEntitySetName :string = parts.get(4);
    const destinationEntitySetId :UUID = getEntitySetIdFromApp(app, destinationEntitySetName);

    const associationData :Map = parts.get(5, Map()).mapKeys((key :FQN) => edmPropertyTypes.get(key));

    const associationEntity :Map = Map().asMutable();
    associationEntity.set('data', associationData);
    associationEntity.set('srcEntitySetId', sourceEntitySetId);
    associationEntity.set('dstEntitySetId', destinationEntitySetId);

    if (isValidUUID(sourceIndexOrId)) {
      associationEntity.set('srcEntityKeyId', sourceIndexOrId);
    }
    else if (isInteger(sourceIndexOrId) && sourceIndexOrId >= 0) {
      associationEntity.set('srcEntityIndex', sourceIndexOrId);
    }
    else {
      LOG.error('unable to set neither "srcEntityIndex" nor "srcEntityKeyId"', sourceIndexOrId);
    }

    if (isValidUUID(destinationIndexOrId)) {
      associationEntity.set('dstEntityKeyId', destinationIndexOrId);
    }
    else if (isInteger(destinationIndexOrId) && destinationIndexOrId >= 0) {
      associationEntity.set('dstEntityIndex', destinationIndexOrId);
    }
    else {
      LOG.error('unable to set neither "dstEntityIndex" nor "dstEntityKeyId"', destinationIndexOrId);
    }

    let associations :List = processedData.get(edgeEntitySetId, List());
    associations = associations.push(associationEntity.asImmutable());
    processedData = processedData.set(edgeEntitySetId, associations);
  });

  return processedData.toJS();
}

export {
  getEntityAddressKey,
  parseEntityAddressKey,
  processAssociationEntityData,
  processEntityData,
  processEntityValue,
};
