// @flow
import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  addCourtChargesToCase,
  addToAvailableArrestCharges,
  addToAvailableCourtCharges,
  getArrestCharges,
  getArrestCasesAndChargesFromPSA,
  getCourtCharges,
  getCourtChargesForCase,
  removeCourtChargeFromCase,
} from './ChargesActions';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { CHARGES, SHARED } from '../../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  ADD_COURT_CHARGES_TO_CASE,
  ADD_TO_AVAILABLE_ARREST_CHARGES,
  ADD_TO_AVAILABLE_COURT_CHARGES,
  ARREST_CASE_EKID_BY_ARREST_CHARGE_EKID_FROM_PSA,
  ARREST_CHARGES,
  ARREST_CHARGES_FROM_PSA,
  COURT_CHARGES,
  COURT_CHARGES_FOR_CASE,
  GET_ARREST_CASES_AND_CHARGES_FROM_PSA,
  GET_ARREST_CHARGES,
  GET_COURT_CHARGES,
  GET_COURT_CHARGES_FOR_CASE,
  REMOVE_COURT_CHARGE_FROM_CASE,
} = CHARGES;
const { COURT_CHARGE_LIST } = APP_TYPE_FQNS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [ADD_COURT_CHARGES_TO_CASE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_TO_AVAILABLE_ARREST_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_TO_AVAILABLE_COURT_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ARREST_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ARREST_CASES_AND_CHARGES_FROM_PSA]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_COURT_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_COURT_CHARGES_FOR_CASE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ARREST_CASE_EKID_BY_ARREST_CHARGE_EKID_FROM_PSA]: Map(),
  [ARREST_CHARGES]: List(),
  [ARREST_CHARGES_FROM_PSA]: List(),
  [COURT_CHARGES]: List(),
  [COURT_CHARGES_FOR_CASE]: List(),
});

export default function chargesReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case addCourtChargesToCase.case(action.type): {

      return addCourtChargesToCase.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_COURT_CHARGES_TO_CASE, action.id], action)
          .setIn([ACTIONS, ADD_COURT_CHARGES_TO_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;

          const successValue :Object = seqAction.value;
          const { chargeEKIDs } = successValue;
          let { newChargeMaps } = successValue;

          const charges :List = state.get(COURT_CHARGES, List());
          chargeEKIDs.forEach((chargeEKID :UUID, index :number) => {
            const chargeEntity :Map = charges.find((charge :Map) => getEntityKeyId(charge) === chargeEKID);
            let chargeMap :Map = newChargeMaps.get(index);
            chargeMap = chargeMap.set(COURT_CHARGE_LIST, chargeEntity);
            newChargeMaps = newChargeMaps.set(index, chargeMap);
          });

          let existingChargesForCase :List = state.get(COURT_CHARGES_FOR_CASE, List());
          existingChargesForCase = existingChargesForCase.concat(newChargeMaps);

          return state
            .set(COURT_CHARGES_FOR_CASE, existingChargesForCase)
            .setIn([ACTIONS, ADD_COURT_CHARGES_TO_CASE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_COURT_CHARGES_TO_CASE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_COURT_CHARGES_TO_CASE, action.id]),
      });
    }

    case addToAvailableArrestCharges.case(action.type): {

      return addToAvailableArrestCharges.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_TO_AVAILABLE_ARREST_CHARGES, action.id], action)
          .setIn([ACTIONS, ADD_TO_AVAILABLE_ARREST_CHARGES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const successValue :Object = seqAction.value;
          const { newCharge } = successValue;

          let arrestCharges = state.get(ARREST_CHARGES, List());
          arrestCharges = arrestCharges.push(newCharge);

          return state
            .set(ARREST_CHARGES, arrestCharges)
            .setIn([ACTIONS, ADD_TO_AVAILABLE_ARREST_CHARGES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_TO_AVAILABLE_ARREST_CHARGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_TO_AVAILABLE_ARREST_CHARGES, action.id]),
      });
    }

    case addToAvailableCourtCharges.case(action.type): {

      return addToAvailableCourtCharges.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_TO_AVAILABLE_COURT_CHARGES, action.id], action)
          .setIn([ACTIONS, ADD_TO_AVAILABLE_COURT_CHARGES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;
          const successValue :Object = seqAction.value;
          const { newCharge } = successValue;

          let courtCharges = state.get(COURT_CHARGES, List());
          courtCharges = courtCharges.push(newCharge);

          return state
            .set(COURT_CHARGES, courtCharges)
            .setIn([ACTIONS, ADD_TO_AVAILABLE_COURT_CHARGES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_TO_AVAILABLE_COURT_CHARGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_TO_AVAILABLE_COURT_CHARGES, action.id]),
      });
    }

    case getArrestCharges.case(action.type): {

      return getArrestCharges.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ARREST_CHARGES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ARREST_CHARGES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ARREST_CHARGES, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(ARREST_CHARGES, value)
            .setIn([ACTIONS, GET_ARREST_CHARGES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_ARREST_CHARGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ARREST_CHARGES, action.id])
      });
    }

    case getArrestCasesAndChargesFromPSA.case(action.type): {

      return getArrestCasesAndChargesFromPSA.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ARREST_CASES_AND_CHARGES_FROM_PSA, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ARREST_CASES_AND_CHARGES_FROM_PSA, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ARREST_CASES_AND_CHARGES_FROM_PSA, action.id])) {
            return state;
          }

          const { value } = action;
          const { arrestCaseEKIDByArrestChargeEKIDFromPSA, arrestChargesFromPSA } = value;

          return state
            .set(ARREST_CHARGES_FROM_PSA, arrestChargesFromPSA)
            .set(ARREST_CASE_EKID_BY_ARREST_CHARGE_EKID_FROM_PSA, arrestCaseEKIDByArrestChargeEKIDFromPSA)
            .setIn([ACTIONS, GET_ARREST_CASES_AND_CHARGES_FROM_PSA, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_ARREST_CASES_AND_CHARGES_FROM_PSA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ARREST_CASES_AND_CHARGES_FROM_PSA, action.id])
      });
    }

    case getCourtCharges.case(action.type): {

      return getCourtCharges.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_COURT_CHARGES, action.id], fromJS(action))
          .setIn([ACTIONS, GET_COURT_CHARGES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_COURT_CHARGES, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(COURT_CHARGES, value)
            .setIn([ACTIONS, GET_COURT_CHARGES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_COURT_CHARGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_COURT_CHARGES, action.id])
      });
    }

    case getCourtChargesForCase.case(action.type): {

      return getCourtChargesForCase.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_COURT_CHARGES_FOR_CASE, action.id], fromJS(action))
          .setIn([ACTIONS, GET_COURT_CHARGES_FOR_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_COURT_CHARGES_FOR_CASE, action.id])) {
            return state;
          }

          const { value } = action;
          if (value === null || value === undefined) {
            return state;
          }

          return state
            .set(COURT_CHARGES_FOR_CASE, value)
            .setIn([ACTIONS, GET_COURT_CHARGES_FOR_CASE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_COURT_CHARGES_FOR_CASE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_COURT_CHARGES_FOR_CASE, action.id])
      });
    }

    case removeCourtChargeFromCase.case(action.type): {

      return removeCourtChargeFromCase.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, REMOVE_COURT_CHARGE_FROM_CASE, action.id], action)
          .setIn([ACTIONS, REMOVE_COURT_CHARGE_FROM_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn([ACTIONS, REMOVE_COURT_CHARGE_FROM_CASE, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .setIn([ACTIONS, REMOVE_COURT_CHARGE_FROM_CASE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, REMOVE_COURT_CHARGE_FROM_CASE, action.id])
      });
    }

    default:
      return state;
  }
}
