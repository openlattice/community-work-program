// @flow
import React from 'react';

import startCase from 'lodash/startCase';
import toString from 'lodash/toString';
import {
  List,
  Map,
  OrderedMap,
  fromJS,
} from 'immutable';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';
import { DateTime } from 'luxon';

import {
  EditButton,
  SectionLabel,
  SectionNameRow,
  SectionWrapper,
} from './SectionStyledComponents';

import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties, sortEntitiesByDateProperty } from '../../utils/DataUtils';

const { ARREST_CHARGE_LIST, CHARGE_EVENT, MANUAL_ARREST_CHARGES } = APP_TYPE_FQNS;
const {
  CASE_NUMBER_TEXT,
  COURT_CASE_TYPE,
  DATETIME_COMPLETED,
  FIRST_NAME,
  LAST_NAME,
  NAME,
  OFFENSE_LOCAL_DESCRIPTION,
} = PROPERTY_TYPE_FQNS;

const labelMap :OrderedMap = OrderedMap({
  judge: 'Judge',
  courtType: 'Court type',
  docketNumber: 'Docket number',
  charge: 'Arrest Charge (latest)',
  chargeDate: 'Charge date',
  requiredHours: 'Required hours',
});

type Props = {
  arrestChargeMapsCreatedInCWP :List;
  arrestChargeMapsCreatedInPSA :List;
  edit :() => void;
  hours :number;
  judge :Map;
  personCase :string;
};

const CaseInfoSection = ({
  arrestChargeMapsCreatedInCWP,
  arrestChargeMapsCreatedInPSA,
  edit,
  hours,
  judge,
  personCase,
} :Props) => {

  let chargeName :string = EMPTY_FIELD;
  let chargeDate :string = EMPTY_FIELD;

  const allChargeMaps :List = arrestChargeMapsCreatedInCWP.concat(arrestChargeMapsCreatedInPSA);
  if (!allChargeMaps.isEmpty()) {
    const sortedChargeMaps :List = sortEntitiesByDateProperty(allChargeMaps, [CHARGE_EVENT, DATETIME_COMPLETED]);
    const mostRecentChargeMap :Map = sortedChargeMaps.last() || Map();
    if (!mostRecentChargeMap.isEmpty()) {
      const chargeESID = mostRecentChargeMap.delete(CHARGE_EVENT).keySeq().toList().first();
      if (chargeESID.toString() === ARREST_CHARGE_LIST.toString()) {
        const { [NAME]: chargeNameFound } = getEntityProperties(mostRecentChargeMap.get(chargeESID), [NAME]);
        if (chargeNameFound) chargeName = startCase(chargeNameFound.toLowerCase());
      }
      if (chargeESID.toString() === MANUAL_ARREST_CHARGES.toString()) {
        const { [OFFENSE_LOCAL_DESCRIPTION]: chargeNameFound } = getEntityProperties(
          mostRecentChargeMap.get(chargeESID),
          [OFFENSE_LOCAL_DESCRIPTION]
        );
        if (chargeNameFound) chargeName = startCase(chargeNameFound.toLowerCase());
      }

      const { [DATETIME_COMPLETED]: chargeDateFound } = getEntityProperties(
        mostRecentChargeMap.get(CHARGE_EVENT),
        [DATETIME_COMPLETED]
      );
      if (chargeDateFound) chargeDate = DateTime.fromISO(chargeDateFound).toLocaleString(DateTime.DATE_SHORT);
    }
  }

  const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(judge, [FIRST_NAME, LAST_NAME]);
  const judgeName :string = (!!firstName && !!lastName) ? `${firstName} ${lastName}` : EMPTY_FIELD;

  const { [CASE_NUMBER_TEXT]: caseNumbers, [COURT_CASE_TYPE]: courtCaseType } = getEntityProperties(
    personCase, [CASE_NUMBER_TEXT, COURT_CASE_TYPE]
  );

  const data :Map = fromJS({
    judge: judgeName,
    courtType: courtCaseType || EMPTY_FIELD,
    docketNumber: caseNumbers || EMPTY_FIELD,
    charge: chargeName,
    chargeDate,
    requiredHours: toString(hours) || EMPTY_FIELD,
  });
  return (
    <SectionWrapper>
      <SectionNameRow>
        <SectionLabel subtle>Case Info</SectionLabel>
        <EditButton mode="subtle" onClick={edit} />
      </SectionNameRow>
      <Card>
        <CardSegment padding="md">
          <DataGrid
              columns={3}
              data={data}
              labelMap={labelMap}
              truncate />
        </CardSegment>
      </Card>
    </SectionWrapper>
  );
};

export default CaseInfoSection;
