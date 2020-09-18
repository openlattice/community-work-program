/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { getEntityDataModelTypes } from './EDMActions';
import { EDM } from '../../utils/constants/ReduxStateConsts';

const { FullyQualifiedName } = Models;
const {
  ASSOCIATION_TYPES,
  ENTITY_TYPES,
  IS_FETCHING_ALL_ENTITY_SET_IDS,
  IS_FETCHING_ALL_TYPES,
  PROPERTY_TYPES,
  TYPES_BY_ID,
  TYPE_IDS_BY_FQNS,
} = EDM;

const INITIAL_STATE :Map<*, *> = fromJS({
  [IS_FETCHING_ALL_ENTITY_SET_IDS]: false,
  [IS_FETCHING_ALL_TYPES]: false,
  [TYPE_IDS_BY_FQNS]: Map(),
  [TYPES_BY_ID]: Map(),
});

export default function edmReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case getEntityDataModelTypes.case(action.type): {
      return getEntityDataModelTypes.reducer(state, action, {
        REQUEST: () => state.set('isFetchingAllTypes', true),
        SUCCESS: () => {
          const seqAction :SequenceAction = (action :any);

          const associationTypes :List = fromJS(seqAction.value.associationTypes);
          const entityTypes :List = fromJS(seqAction.value.entityTypes);
          const propertyTypes :List = fromJS(seqAction.value.propertyTypes);

          const typeIdsByFqn :Map<FullyQualifiedName, string> = Map().asMutable();
          const typesById :Map = Map().asMutable();

          associationTypes.forEach((type :Map) => {
            if (type.has('entityType')) {
              const typeFqn :FullyQualifiedName = new FullyQualifiedName(type.getIn(['entityType', 'type']));
              const typeId :string = type.getIn(['entityType', 'id']);
              typeIdsByFqn.setIn([ASSOCIATION_TYPES, typeFqn], typeId);
              typesById.setIn([ASSOCIATION_TYPES, typeId], type);
            }
          });

          entityTypes.forEach((type :Map) => {
            if (type.has('id')) {
              const typeFqn :FullyQualifiedName = new FullyQualifiedName(type.get('type'));
              const typeId :string = type.get('id');
              typeIdsByFqn.setIn([ENTITY_TYPES, typeFqn], typeId);
              typesById.setIn([ENTITY_TYPES, typeId], type);
            }
          });

          propertyTypes.forEach((type :Map) => {
            if (type.has('id')) {
              const typeFqn :FullyQualifiedName = new FullyQualifiedName(type.get('type'));
              const typeId :string = type.get('id');
              typeIdsByFqn.setIn([PROPERTY_TYPES, typeFqn], typeId);
              typesById.setIn([PROPERTY_TYPES, typeId], type);
            }
          });

          return state
            .set('typeIdsByFqn', typeIdsByFqn.asImmutable())
            .set('typesById', typesById.asImmutable());
        },
        FAILURE: () => state.set('typesFqnToIdMap', Map()).set('typesById', Map()),
        FINALLY: () => state.set('isFetchingAllTypes', false),
      });
    }

    default:
      return state;
  }
}
