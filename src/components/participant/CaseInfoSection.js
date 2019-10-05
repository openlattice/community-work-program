// @flow
import React from 'react';
import styled from 'styled-components';
import { fromJS, Map, OrderedMap } from 'immutable';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

import {
  SectionLabel,
  SectionNameRow,
  SectionWrapper,
  SmallEditButton,
} from './SectionStyledComponents';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatNumericalValue } from '../../utils/FormattingUtils';
import { CASE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';

const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;

const labelMap :OrderedMap = OrderedMap({
  judge: 'Judge',
  courtType: 'Court type',
  docketNumber: 'Docket number',
  charge: 'Charge',
  chargeLevel: 'Charge level',
  requiredHours: 'Required hours',
});

const CaseInfoCard = styled(Card)`
  height: 190px;
`;

type Props = {
  edit :() => void;
  hours :number;
  personCase :string;
};

const CaseInfoSection = ({
  edit,
  hours,
  personCase,
} :Props) => {

  const { [CASE_NUMBER_TEXT]: caseNumbers, [COURT_CASE_TYPE]: courtCaseType } = getEntityProperties(
    personCase, [CASE_NUMBER_TEXT, COURT_CASE_TYPE]
  );

  const data :Map = fromJS({
    judge: EMPTY_FIELD,
    courtType: courtCaseType || EMPTY_FIELD,
    docketNumber: caseNumbers || EMPTY_FIELD,
    charge: EMPTY_FIELD,
    chargeLevel: EMPTY_FIELD,
    requiredHours: formatNumericalValue(hours) || EMPTY_FIELD,
  });
  return (
    <SectionWrapper>
      <SectionNameRow>
        <SectionLabel subtle>Case Info</SectionLabel>
        <SmallEditButton mode="subtle" onClick={edit} />
      </SectionNameRow>
      <CaseInfoCard>
        <CardSegment padding="md" vertical>
          <DataGrid
              columns={3}
              data={data}
              labelMap={labelMap} />
        </CardSegment>
      </CaseInfoCard>
    </SectionWrapper>
  );
};

export default CaseInfoSection;
