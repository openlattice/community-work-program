// @flow
import React, { useState } from 'react';

import styled from 'styled-components';
import toString from 'lodash/toString';
import {
  List,
  Map,
  OrderedMap,
  fromJS
} from 'immutable';
import {
  Card,
  CardSegment,
  Colors,
  DataGrid,
  Label,
  StyleUtils,
} from 'lattice-ui-kit';
import { withRouter } from 'react-router-dom';

import { SectionLabel, SectionNameRow, SectionWrapper } from './SectionStyledComponents';

import AddNewPlanStatusModal from '../../containers/participant/AddNewPlanStatusModal';
import EditButton from '../controls/buttons/EditButton';
import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';
import { ENROLLMENT_STATUSES } from '../../core/edm/constants/DataModelConsts';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUS_COLORS } from '../../core/style/Colors';
import { getEntityProperties } from '../../utils/DataUtils';

const { getStyleVariation } = StyleUtils;
const { NEUTRAL } = Colors;
const { STATUS } = PROPERTY_TYPE_FQNS;

const statusColorVariation = getStyleVariation('status', {
  default: NEUTRAL.N700,
  [ENROLLMENT_STATUSES.ACTIVE]: ENROLLMENT_STATUS_COLORS.ACTIVE,
  [ENROLLMENT_STATUSES.ACTIVE_REOPENED]: ENROLLMENT_STATUS_COLORS.ACTIVE_REOPENED,
  [ENROLLMENT_STATUSES.AWAITING_CHECKIN]: ENROLLMENT_STATUS_COLORS.AWAITING_CHECKIN,
  [ENROLLMENT_STATUSES.AWAITING_ORIENTATION]: ENROLLMENT_STATUS_COLORS.AWAITING_ORIENTATION,
  [ENROLLMENT_STATUSES.COMPLETED]: ENROLLMENT_STATUS_COLORS.COMPLETED,
  [ENROLLMENT_STATUSES.JOB_SEARCH]: ENROLLMENT_STATUS_COLORS.JOB_SEARCH,
  [ENROLLMENT_STATUSES.REMOVED_NONCOMPLIANT]: ENROLLMENT_STATUS_COLORS.REMOVED_NONCOMPLIANT,
  [ENROLLMENT_STATUSES.SUCCESSFUL]: ENROLLMENT_STATUS_COLORS.SUCCESSFUL,
  [ENROLLMENT_STATUSES.UNSUCCESSFUL]: ENROLLMENT_STATUS_COLORS.UNSUCCESSFUL,
});

const labelMap :OrderedMap = OrderedMap({
  warnings: 'Warnings',
  violations: 'Violations',
});

const StatusBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 170px;
`;

const StatusText = styled.div`
  color: ${statusColorVariation};
`;

type Props = {
  enrollmentStatus :Map;
  violations :List;
  warnings :List;
};

const EnrollmentStatusSection = ({
  enrollmentStatus,
  violations,
  warnings,
} :Props) => {

  const [isChangeStatusModalVisible, setChangeStatusModalVisibility] = useState(false);

  const { [STATUS]: status } = getEntityProperties(enrollmentStatus, [STATUS]);

  const data :Map = fromJS({
    warnings: toString(warnings.count()) || EMPTY_FIELD,
    violations: toString(violations.count()) || EMPTY_FIELD,
  });

  return (
    <SectionWrapper>
      <SectionNameRow>
        <SectionLabel subtle>Enrollment Status</SectionLabel>
        <EditButton onClick={() => setChangeStatusModalVisibility(true)} />
      </SectionNameRow>
      <Card>
        <CardSegment padding="md" vertical={false}>
          <StatusBox>
            <Label subtle>Status</Label>
            <StatusText status={status}>{ status || EMPTY_FIELD }</StatusText>
          </StatusBox>
          <DataGrid
              columns={2}
              data={data}
              labelMap={labelMap} />
        </CardSegment>
      </Card>
      <AddNewPlanStatusModal
          isVisible={isChangeStatusModalVisible}
          onClose={() => setChangeStatusModalVisibility(false)} />
    </SectionWrapper>
  );
};

export default withRouter(EnrollmentStatusSection);
