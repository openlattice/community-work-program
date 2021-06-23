// @flow
import { Map } from 'immutable';
import { Models } from 'lattice';
import type { UUID } from 'lattice';

import { EDM, STATE } from '../../../utils/constants/ReduxStateConsts';

const { TYPES_BY_ID, PROPERTY_TYPES } = EDM;
const { FQN } = Models;

export default function selectPropertyFqn(propertyTypeId :UUID) {

  return (state :Map) :FQN => FQN.of(state.getIn([STATE.EDM, TYPES_BY_ID, PROPERTY_TYPES, propertyTypeId, 'type']));
}
