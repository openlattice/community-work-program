// @flow
import { Map } from 'immutable';
import { Models } from 'lattice';
import type { UUID } from 'lattice';

import { APP, STATE } from '../../../utils/constants/ReduxStateConsts';

const { ENTITY_SET_IDS_BY_ORG } = APP;
const { FQN } = Models;

export default function selectEntitySetId(selectedOrgId :UUID, appType :FQN) {

  return (state :Map) :?UUID => state.getIn([STATE.APP, ENTITY_SET_IDS_BY_ORG, selectedOrgId, appType]);
}
