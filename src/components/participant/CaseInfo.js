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
import { CASE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getEntityProperties } from '../../utils/DataUtils';

const { CASE_NUMBER_TEXT, COURT_CASE_TYPE } = CASE_FQNS;

const CaseInfoWrapper = styled.div`
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
  personCase :string;
  hours :number;
  violations :List;
  warnings :List;
};

const CaseInfo = ({
  personCase,
  hours,
  violations,
  warnings,
} :Props) => {

  const { [CASE_NUMBER_TEXT]: caseNumbers, [COURT_CASE_TYPE]: courtCaseType } = getEntityProperties(
    personCase, [CASE_NUMBER_TEXT, COURT_CASE_TYPE]
  );
  const courtType = !courtCaseType ? EMPTY_FIELD : courtCaseType;
  const docketNumber = !caseNumbers ? EMPTY_FIELD : caseNumbers;
  const warningsCount = formatNumericalValue(warnings.count());
  const violationsCount = formatNumericalValue(violations.count());
  const data :Map = fromJS({
    courtType,
    docketNumber,
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

export default CaseInfo;
