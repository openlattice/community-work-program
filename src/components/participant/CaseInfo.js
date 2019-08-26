// @flow
import React from 'react';
import styled from 'styled-components';
import {
  fromJS,
  List,
  Map,
  OrderedMap
} from 'immutable';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';
import { formatNumericalValue } from '../../utils/FormattingUtils';
import { OL } from '../../core/style/Colors';

const CaseInfoWrapper = styled.div`
  /* align-items: center;
  background-color: ${OL.WHITE};
  border-radius: 5px;
  border: 1px solid ${OL.GREY11};
  display: flex;
  flex-direction: column; */
  /* height: 100%; */
  /* justify-content: center;
  padding: 20px 0; */
  width: 100%;
`;

const labelMap :OrderedMap = OrderedMap({
  courtType: 'Court type',
  docketNumber: 'Docket number',
  reqHours: 'Required hours',
  warnings: 'Warnings',
  violations: 'Violations',
});

type Props = {
  caseNumber :string;
  hours :number;
  violations :List;
  warnings :List;
};

const CaseInfo = ({
  caseNumber,
  hours,
  violations,
  warnings,
} :Props) => {

  const warningsCount = formatNumericalValue(warnings.count());
  const violationsCount = formatNumericalValue(violations.count());
  const data :Map = fromJS({
    courtType: EMPTY_FIELD,
    docketNumber: EMPTY_FIELD,
    reqHours: formatNumericalValue(hours),
    warnings: warningsCount,
    violations: violationsCount,
  });
  return (
    <CaseInfoWrapper>
      <Card>
        <CardSegment padding="lg" vertical>
          <DataGrid
              columns={3}
              data={data}
              labelMap={labelMap} />
        </CardSegment>
      </Card>
    </CaseInfoWrapper>
  );
};

// const CaseInfo = ({ caseNumber, hours } :Props) => (
//   <CaseInfoWrapper>
//     <Header>Case Number</Header>
//     <NumberWrapper>
//       <Number>{ caseNumber }</Number>
//     </NumberWrapper>
//     <Header>Required Hours</Header>
//     <NumberWrapper>
//       <Number>{ formatNumericalValue(hours) }</Number>
//     </NumberWrapper>
//   </CaseInfoWrapper>
// );

export default CaseInfo;
