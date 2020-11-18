/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  addArrestCharges,
  addCourtChargesToCase,
  addToAvailableArrestCharges,
  addToAvailableCourtCharges,
  getArrestCasesAndChargesFromPSA,
  getArrestCharges,
  getArrestChargesLinkedToCWP,
  getCourtCharges,
  getCourtChargesForCase,
  removeArrestCharge,
  removeCourtChargeFromCase,
} from './ChargesActions';

import { APP_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { CHARGES, SHARED } from '../../../utils/constants/ReduxStateConsts';

const { getPageSectionKey } = DataProcessingUtils;
const { ACTIONS, REQUEST_STATE } = SHARED;
const {
  ADD_ARREST_CHARGES,
  ADD_COURT_CHARGES_TO_CASE,
  ADD_TO_AVAILABLE_ARREST_CHARGES,
  ADD_TO_AVAILABLE_COURT_CHARGES,
  ARREST_CASE_BY_ARREST_CHARGE_EKID_FROM_PSA,
  ARREST_CHARGES,
  ARREST_CHARGES_BY_EKID,
  ARREST_CHARGES_FROM_PSA,
  ARREST_CHARGE_MAPS_CREATED_IN_CWP,
  ARREST_CHARGE_MAPS_CREATED_IN_PSA,
  COURT_CHARGES,
  COURT_CHARGES_FOR_CASE,
  CWP_ARREST_CASE_EKID_BY_CHARGE_EVENT_EKID,
  GET_ARREST_CASES_AND_CHARGES_FROM_PSA,
  GET_ARREST_CHARGES,
  GET_ARREST_CHARGES_LINKED_TO_CWP,
  GET_COURT_CHARGES,
  GET_COURT_CHARGES_FOR_CASE,
  PSA_ARREST_CASE_BY_ARREST_CHARGE,
  REMOVE_ARREST_CHARGE,
  REMOVE_COURT_CHARGE_FROM_CASE,
} = CHARGES;
const { CHARGE_EVENT, COURT_CHARGE_LIST, MANUAL_ARREST_CHARGES } = APP_TYPE_FQNS;

const INITIAL_STATE :Map = fromJS({
  [ACTIONS]: {
    [ADD_ARREST_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_COURT_CHARGES_TO_CASE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_TO_AVAILABLE_ARREST_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [ADD_TO_AVAILABLE_COURT_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ARREST_CASES_AND_CHARGES_FROM_PSA]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ARREST_CHARGES_LINKED_TO_CWP]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_ARREST_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_COURT_CHARGES]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [GET_COURT_CHARGES_FOR_CASE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [REMOVE_ARREST_CHARGE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
    [REMOVE_COURT_CHARGE_FROM_CASE]: {
      [REQUEST_STATE]: RequestStates.STANDBY
    },
  },
  [ARREST_CASE_BY_ARREST_CHARGE_EKID_FROM_PSA]: Map(),
  [ARREST_CHARGES]: List(),
  [ARREST_CHARGES_BY_EKID]: Map(),
  [ARREST_CHARGES_FROM_PSA]: List(),
  [ARREST_CHARGE_MAPS_CREATED_IN_CWP]: List(),
  [ARREST_CHARGE_MAPS_CREATED_IN_PSA]: List(),
  [COURT_CHARGES]: List(),
  [COURT_CHARGES_FOR_CASE]: List(),
  [CWP_ARREST_CASE_EKID_BY_CHARGE_EVENT_EKID]: Map(),
  [PSA_ARREST_CASE_BY_ARREST_CHARGE]: Map(),
});

export default function chargesReducer(state :Map = INITIAL_STATE, action :SequenceAction) :Map {

  switch (action.type) {

    case addArrestCharges.case(action.type): {

      return addArrestCharges.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_ARREST_CHARGES, action.id], action)
          .setIn([ACTIONS, ADD_ARREST_CHARGES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;

          const successValue :Object = seqAction.value;
          const {
            arrestChargeMapsCreatedInCWP,
            arrestChargeMapsCreatedInPSA,
            cwpArrestCaseEKIDByChargeEventEKID,
            psaArrestCaseByArrestCharge,
          } = successValue;

          let currentArrestChargeMapsCreatedInCWP :List = state.get(ARREST_CHARGE_MAPS_CREATED_IN_CWP);
          currentArrestChargeMapsCreatedInCWP = currentArrestChargeMapsCreatedInCWP
            .concat(arrestChargeMapsCreatedInCWP);
          let currentArrestChargeMapsCreatedInPSA :List = state.get(ARREST_CHARGE_MAPS_CREATED_IN_PSA);
          currentArrestChargeMapsCreatedInPSA = currentArrestChargeMapsCreatedInPSA
            .concat(arrestChargeMapsCreatedInPSA);
          let currentCWPArrestCaseEKIDByChargeEventEKID :Map = state.get(CWP_ARREST_CASE_EKID_BY_CHARGE_EVENT_EKID);
          currentCWPArrestCaseEKIDByChargeEventEKID = currentCWPArrestCaseEKIDByChargeEventEKID
            .merge(cwpArrestCaseEKIDByChargeEventEKID);
          let currentPSAArrestCaseByArrestCharge :Map = state.get(PSA_ARREST_CASE_BY_ARREST_CHARGE);
          currentPSAArrestCaseByArrestCharge = currentPSAArrestCaseByArrestCharge
            .merge(psaArrestCaseByArrestCharge);

          return state
            .set(ARREST_CHARGE_MAPS_CREATED_IN_CWP, currentArrestChargeMapsCreatedInCWP)
            .set(ARREST_CHARGE_MAPS_CREATED_IN_PSA, currentArrestChargeMapsCreatedInPSA)
            .set(CWP_ARREST_CASE_EKID_BY_CHARGE_EVENT_EKID, currentCWPArrestCaseEKIDByChargeEventEKID)
            .set(PSA_ARREST_CASE_BY_ARREST_CHARGE, currentPSAArrestCaseByArrestCharge)
            .setIn([ACTIONS, ADD_ARREST_CHARGES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, ADD_ARREST_CHARGES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, ADD_ARREST_CHARGES, action.id]),
      });
    }

    case addCourtChargesToCase.case(action.type): {

      return addCourtChargesToCase.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, ADD_COURT_CHARGES_TO_CASE, action.id], action)
          .setIn([ACTIONS, ADD_COURT_CHARGES_TO_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          const seqAction :SequenceAction = action;

          const successValue :Object = seqAction.value;
          const { courtChargeEKIDs } = successValue;
          let { newChargeMaps } = successValue;

          const charges :List = state.get(COURT_CHARGES, List());
          courtChargeEKIDs.forEach((chargeEKID :UUID, index :number) => {
            const chargeEntity :Map = charges.find((charge :Map) => getEntityKeyId(charge) === chargeEKID);
            const chargeMap :Map = newChargeMaps.get(index)
              .set(COURT_CHARGE_LIST, chargeEntity);
            newChargeMaps = newChargeMaps.set(index, chargeMap);
          });

          const existingChargesForCase :List = state.get(COURT_CHARGES_FOR_CASE, List())
            .concat(newChargeMaps);
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
          const { arrestCharges, arrestChargesByEKID } = value;

          return state
            .set(ARREST_CHARGES, arrestCharges)
            .set(ARREST_CHARGES_BY_EKID, arrestChargesByEKID)
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
          const { arrestCaseByArrestChargeEKIDFromPSA, arrestChargesFromPSA } = value;

          return state
            .set(ARREST_CHARGES_FROM_PSA, arrestChargesFromPSA)
            .set(ARREST_CASE_BY_ARREST_CHARGE_EKID_FROM_PSA, arrestCaseByArrestChargeEKIDFromPSA)
            .setIn([ACTIONS, GET_ARREST_CASES_AND_CHARGES_FROM_PSA, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_ARREST_CASES_AND_CHARGES_FROM_PSA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ARREST_CASES_AND_CHARGES_FROM_PSA, action.id])
      });
    }

    case getArrestChargesLinkedToCWP.case(action.type): {

      return getArrestChargesLinkedToCWP.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, GET_ARREST_CHARGES_LINKED_TO_CWP, action.id], fromJS(action))
          .setIn([ACTIONS, GET_ARREST_CHARGES_LINKED_TO_CWP, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {

          if (!state.hasIn([ACTIONS, GET_ARREST_CHARGES_LINKED_TO_CWP, action.id])) {
            return state;
          }

          const { value } = action;
          const {
            arrestChargeMapsCreatedInCWP,
            arrestChargeMapsCreatedInPSA,
            cwpArrestCaseEKIDByChargeEventEKID,
            psaArrestCaseByArrestCharge,
          } = value;

          return state
            .set(ARREST_CHARGE_MAPS_CREATED_IN_CWP, arrestChargeMapsCreatedInCWP)
            .set(ARREST_CHARGE_MAPS_CREATED_IN_PSA, arrestChargeMapsCreatedInPSA)
            .set(CWP_ARREST_CASE_EKID_BY_CHARGE_EVENT_EKID, cwpArrestCaseEKIDByChargeEventEKID)
            .set(PSA_ARREST_CASE_BY_ARREST_CHARGE, psaArrestCaseByArrestCharge)
            .setIn([ACTIONS, GET_ARREST_CHARGES_LINKED_TO_CWP, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, GET_ARREST_CHARGES_LINKED_TO_CWP, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, GET_ARREST_CHARGES_LINKED_TO_CWP, action.id])
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

    case removeArrestCharge.case(action.type): {

      return removeArrestCharge.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, REMOVE_ARREST_CHARGE, action.id], action)
          .setIn([ACTIONS, REMOVE_ARREST_CHARGE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          if (!state.hasIn([ACTIONS, REMOVE_ARREST_CHARGE, action.id])) {
            return state;
          }
          const path = action.value;

          let arrestChargeMapsCreatedInCWP :List = state.get(ARREST_CHARGE_MAPS_CREATED_IN_CWP, List());
          let arrestChargeMapsCreatedInPSA :List = state.get(ARREST_CHARGE_MAPS_CREATED_IN_PSA, List());
          let cwpArrestCaseEKIDByChargeEventEKID :Map = state.get(CWP_ARREST_CASE_EKID_BY_CHARGE_EVENT_EKID, Map());
          let psaArrestCaseByArrestCharge :Map = state.get(PSA_ARREST_CASE_BY_ARREST_CHARGE, Map());

          if (path[0] === getPageSectionKey(1, 1)) {
            const arrestChargeMapToDelete :Map = arrestChargeMapsCreatedInPSA.get(path[1]);
            const arrestChargeEKIDToRemove :UUID = getEntityKeyId(arrestChargeMapToDelete.get(MANUAL_ARREST_CHARGES));
            arrestChargeMapsCreatedInPSA = arrestChargeMapsCreatedInPSA.delete(path[1]);
            psaArrestCaseByArrestCharge = psaArrestCaseByArrestCharge.delete(arrestChargeEKIDToRemove);
          }
          if (path[0] === getPageSectionKey(1, 2)) {
            const arrestChargeMapToDelete :Map = arrestChargeMapsCreatedInCWP.get(path[1]);
            const arrestChargeEventEKIDToRemove :UUID = getEntityKeyId(arrestChargeMapToDelete.get(CHARGE_EVENT));
            arrestChargeMapsCreatedInCWP = arrestChargeMapsCreatedInCWP.delete(path[1]);
            cwpArrestCaseEKIDByChargeEventEKID = cwpArrestCaseEKIDByChargeEventEKID
              .delete(arrestChargeEventEKIDToRemove);
          }

          return state
            .set(ARREST_CHARGE_MAPS_CREATED_IN_CWP, arrestChargeMapsCreatedInCWP)
            .set(ARREST_CHARGE_MAPS_CREATED_IN_PSA, arrestChargeMapsCreatedInPSA)
            .set(CWP_ARREST_CASE_EKID_BY_CHARGE_EVENT_EKID, cwpArrestCaseEKIDByChargeEventEKID)
            .set(PSA_ARREST_CASE_BY_ARREST_CHARGE, psaArrestCaseByArrestCharge)
            .setIn([ACTIONS, REMOVE_ARREST_CHARGE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, REMOVE_ARREST_CHARGE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, REMOVE_ARREST_CHARGE, action.id])
      });
    }

    case removeCourtChargeFromCase.case(action.type): {

      return removeCourtChargeFromCase.reducer(state, action, {

        REQUEST: () => state
          .setIn([ACTIONS, REMOVE_COURT_CHARGE_FROM_CASE, action.id], action)
          .setIn([ACTIONS, REMOVE_COURT_CHARGE_FROM_CASE, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const path = action.value;
          const courtChargesForCase :List = state.get(COURT_CHARGES_FOR_CASE, List())
            .delete(path[1]);
          return state
            .set(COURT_CHARGES_FOR_CASE, courtChargesForCase)
            .setIn([ACTIONS, REMOVE_COURT_CHARGE_FROM_CASE, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .setIn([ACTIONS, REMOVE_COURT_CHARGE_FROM_CASE, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([ACTIONS, REMOVE_COURT_CHARGE_FROM_CASE, action.id])
      });
    }

    default:
      return state;
  }
}
