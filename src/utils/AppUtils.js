/*
 * @flow
 */
import { Map } from 'immutable';

import { APP } from './constants/ReduxStateConsts';

const getEntitySetIdFromApp = (app :Object | Map, fqn :string) => {
  const orgId = app.get(APP.SELECTED_ORG_ID);
  return app.getIn([
    fqn,
    APP.ENTITY_SETS_BY_ORG,
    orgId
  ]);
};

export default getEntitySetIdFromApp;
