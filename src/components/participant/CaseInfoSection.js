// @flow
import React from 'react';
import startCase from 'lodash/startCase';
import { DateTime } from 'luxon';
import {
  List,
  Map,
  OrderedMap,
  fromJS,
} from 'immutable';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

import {
  SectionLabel,
  SectionNameRow,
  SectionWrapper,
  StyledEditButton,
} from './SectionStyledComponents';
import { getEntityProperties, sortEntitiesByDateProperty } from '../../utils/DataUtils';
import { formatNumericalValue } from '../../utils/FormattingUtils';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';

const { CHARGE_EVENT, COURT_CHARGE_LIST } = APP_TYPE_FQNS;
const {
  CASE_NUMBER_TEXT,
  COURT_CASE_TYPE,
  DATETIME_COMPLETED,
  FIRST_NAME,
  LAST_NAME,
  NAME,
} = PROPERTY_TYPE_FQNS;

const labelMap :OrderedMap = OrderedMap({
  judge: 'Judge',
  courtType: 'Court type',
  docketNumber: 'Docket number',
  charge: 'Charge (most recent)',
  chargeDate: 'Charge date',
  requiredHours: 'Required hours',
});

type Props = {
  charges :List;
  edit :() => void;
  hours :number;
  judge :Map;
  personCase :string;
};

const CaseInfoSection = ({
  charges,
  edit,
  hours,
  judge,
  personCase,
} :Props) => {

  const sortedChargeMaps :List = sortEntitiesByDateProperty(charges, [CHARGE_EVENT, DATETIME_COMPLETED]);
  const mostRecentChargeAndChargeEvent :Map = sortedChargeMaps.last() || Map();
  let { [NAME]: chargeName } = getEntityProperties(mostRecentChargeAndChargeEvent.get(COURT_CHARGE_LIST), [NAME]);
  if (chargeName) chargeName = startCase(chargeName.toLowerCase());
  let { [DATETIME_COMPLETED]: chargeDate } = getEntityProperties(
    mostRecentChargeAndChargeEvent.get(CHARGE_EVENT),
    [DATETIME_COMPLETED]
  );
  if (chargeDate) chargeDate = DateTime.fromISO(chargeDate).toLocaleString(DateTime.DATE_SHORT);

  const { [FIRST_NAME]: firstName, [LAST_NAME]: lastName } = getEntityProperties(judge, [FIRST_NAME, LAST_NAME]);
  const judgeName :string = (!!firstName && !!lastName) ? `${firstName} ${lastName}` : EMPTY_FIELD;

  const { [CASE_NUMBER_TEXT]: caseNumbers, [COURT_CASE_TYPE]: courtCaseType } = getEntityProperties(
    personCase, [CASE_NUMBER_TEXT, COURT_CASE_TYPE]
  );

  const data :Map = fromJS({
    judge: judgeName,
    courtType: courtCaseType || EMPTY_FIELD,
    docketNumber: caseNumbers || EMPTY_FIELD,
    charge: chargeName || EMPTY_FIELD,
    chargeDate: chargeDate || EMPTY_FIELD,
    requiredHours: formatNumericalValue(hours) || EMPTY_FIELD,
  });
  return (
    <SectionWrapper>
      <SectionNameRow>
        <SectionLabel subtle>Case Info</SectionLabel>
        <StyledEditButton mode="subtle" onClick={edit} />
      </SectionNameRow>
      <Card>
        <CardSegment padding="md" vertical>
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
