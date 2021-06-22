// @flow
import { Map } from 'immutable';
import type { UUID } from 'lattice';

import { APP, STATE } from '../../../utils/constants/ReduxStateConsts';

const { SELECTED_ORG_ID } = APP;

export default function selectOrgId() {

  return (state :Map) :?UUID => state.getIn([STATE.APP, SELECTED_ORG_ID]);
}
