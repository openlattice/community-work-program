// @flow
import { Map } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import { isDefined } from '../../../../utils/LangUtils';
import { getCombinedDateTime } from '../../../../utils/ScheduleUtils';
import { getEntityKeyId, getEntityProperties } from '../../../../utils/DataUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../../../core/edm/constants/FullyQualifiedNames';

const { getEntityAddressKey } = DataProcessingUtils;
const {
  APPEARS_IN,
  APPEARS_IN_ARREST,
  ARREST_CHARGE_LIST,
  CHARGE_EVENT,
  DIVERSION_PLAN,
  MANUAL_ARREST_CASES,
  MANUAL_ARREST_CHARGES,
  MANUAL_CHARGED_WITH,
  PEOPLE,
  REGISTERED_FOR,
  RELATED_TO,
} = APP_TYPE_FQNS;
const { ARREST_DATETIME, DATETIME_COMPLETED, ENTITY_KEY_ID } = PROPERTY_TYPE_FQNS;

const formatNewArrestChargeDataAndAssociations = (
  newChargesFormData :Object[],
  numberOfExistingChargesAdded :number,
  { personIndexOrEKID, diversionPlanIndexOrEKID } :Object,
  cwpArrestCaseByArrestCharge :?Map,
) :Object => {

  const newChargeEntities :Object[] = [];
  const newChargeAssociations :Array<Array<*>> = [];
  if (!isDefined(newChargesFormData)) return { newChargeEntities, newChargeAssociations };

  let newArrestCharges :Object[] = newChargesFormData;
  if (isDefined(cwpArrestCaseByArrestCharge) && !cwpArrestCaseByArrestCharge.isEmpty()) {
    newArrestCharges = newChargesFormData.filter((chargeObject :Object) => {
      const existingChargeEKID :UUID = chargeObject[getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID)];
      const existing :any = cwpArrestCaseByArrestCharge
        .findKey((caseEKID, chargeEKID) => chargeEKID === existingChargeEKID);
      return !isDefined(existing);
    });
  }
  if (!newArrestCharges.length || !Object.values(newArrestCharges[0]).length) {
    return { newChargeEntities, newChargeAssociations };
  }

  const now :DateTime = DateTime.local();
  const currentTime = now.toLocaleString(DateTime.TIME_24_SIMPLE);

  newArrestCharges.forEach((charge :Object, index :number) => {

    const chargeEventToSubmit :Object = {};
    const dateChargedFromForm :string = charge[getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)];
    let dateTimeCharged :string = ' ';
    if (isDefined(dateChargedFromForm)) dateTimeCharged = getCombinedDateTime(dateChargedFromForm, currentTime);
    else dateTimeCharged = now.toISO();
    chargeEventToSubmit[getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)] = dateTimeCharged;
    chargeEventToSubmit[getEntityAddressKey(index, MANUAL_ARREST_CASES, ARREST_DATETIME)] = dateTimeCharged;
    newChargeEntities.push(chargeEventToSubmit);

    const arrestChargeEKID :UUID = charge[getEntityAddressKey(-1, ARREST_CHARGE_LIST, ENTITY_KEY_ID)];
    newChargeAssociations.push([
      REGISTERED_FOR,
      index + numberOfExistingChargesAdded,
      CHARGE_EVENT,
      arrestChargeEKID,
      ARREST_CHARGE_LIST
    ]);
    newChargeAssociations.push([APPEARS_IN, arrestChargeEKID, ARREST_CHARGE_LIST, index, MANUAL_ARREST_CASES]);
    newChargeAssociations.push([APPEARS_IN_ARREST, personIndexOrEKID, PEOPLE, index, MANUAL_ARREST_CASES]);
    newChargeAssociations.push([MANUAL_CHARGED_WITH, personIndexOrEKID, PEOPLE, arrestChargeEKID, ARREST_CHARGE_LIST]);
    newChargeAssociations.push([
      MANUAL_CHARGED_WITH,
      personIndexOrEKID,
      PEOPLE,
      index + numberOfExistingChargesAdded,
      CHARGE_EVENT
    ]);
    newChargeAssociations.push([RELATED_TO, diversionPlanIndexOrEKID, DIVERSION_PLAN, index, MANUAL_ARREST_CASES]);
  });

  return { newChargeEntities, newChargeAssociations };
};

const formatExistingChargeDataAndAssociation = (
  existingPSAChargesInForm :Object[],
  { personIndexOrEKID, diversionPlanIndexOrEKID } :Object,
  arrestCaseByArrestChargeEKIDFromPSA :Map,
  psaArrestCaseByArrestCharge :?Map,
) :Object => {

  const psaChargeEntities :Object[] = [];
  const psaChargeAssociations :Array<Array<*>> = [];
  if (!isDefined(existingPSAChargesInForm)) return { psaChargeEntities, psaChargeAssociations };

  let psaCharges :Object[] = existingPSAChargesInForm;
  if (isDefined(psaArrestCaseByArrestCharge)) {
    psaCharges = existingPSAChargesInForm.filter((chargeObject :Object) => {
      const existingChargeEKID :UUID = chargeObject[getEntityAddressKey(-1, MANUAL_ARREST_CHARGES, ENTITY_KEY_ID)];
      const existing :any = psaArrestCaseByArrestCharge
        .findKey((caseEKID, chargeEKID) => chargeEKID === existingChargeEKID);
      return !isDefined(existing);
    });
  }

  if (!psaCharges.length || !Object.values(psaCharges[0]).length) {
    return { psaChargeEntities, psaChargeAssociations };
  }

  const now :DateTime = DateTime.local();
  const currentTime = now.toLocaleString(DateTime.TIME_24_SIMPLE);

  psaCharges.forEach((charge :Object, index :number) => {
    const chargeEventToSubmit :Object = {};
    const existingArrestChargeEKID :UUID = charge[
      getEntityAddressKey(-1, MANUAL_ARREST_CHARGES, ENTITY_KEY_ID)
    ];
    psaChargeAssociations.push([REGISTERED_FOR, index, CHARGE_EVENT, existingArrestChargeEKID, MANUAL_ARREST_CHARGES]);
    psaChargeAssociations.push([MANUAL_CHARGED_WITH, personIndexOrEKID, PEOPLE, index, CHARGE_EVENT]);

    const arrestCase :Map = arrestCaseByArrestChargeEKIDFromPSA.get(existingArrestChargeEKID, Map());
    const arrestCaseEKID :UUID = getEntityKeyId(arrestCase);
    psaChargeAssociations
      .push([RELATED_TO, diversionPlanIndexOrEKID, DIVERSION_PLAN, arrestCaseEKID, MANUAL_ARREST_CASES]);

    const dateChargedFromForm :string = charge[getEntityAddressKey(-1, CHARGE_EVENT, DATETIME_COMPLETED)];
    const { [ARREST_DATETIME]: arrestDateTime } = getEntityProperties(arrestCase, [ARREST_DATETIME]);
    let dateTimeCharged :string = ' ';
    if (isDefined(dateChargedFromForm)) dateTimeCharged = getCombinedDateTime(dateChargedFromForm, currentTime);
    else if (isDefined(arrestDateTime) && arrestDateTime.length) dateTimeCharged = arrestDateTime;
    else dateTimeCharged = now.toISO();

    chargeEventToSubmit[getEntityAddressKey(index, CHARGE_EVENT, DATETIME_COMPLETED)] = dateTimeCharged;
    psaChargeEntities.push(chargeEventToSubmit);
  });

  return { psaChargeEntities, psaChargeAssociations };
};

export {
  formatExistingChargeDataAndAssociation,
  formatNewArrestChargeDataAndAssociations,
};
