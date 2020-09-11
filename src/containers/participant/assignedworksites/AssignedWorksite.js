// @flow
import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { faTools } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { Card, CardSegment, StyleUtils } from 'lattice-ui-kit';

import EditWorksitePlanModal from './EditWorksitePlanModal';

import EditButton from '../../../components/controls/buttons/EditButton';
import { WORKSITE_ENROLLMENT_STATUSES } from '../../../core/edm/constants/DataModelConsts';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { ENROLLMENT_STATUS_COLORS, OL } from '../../../core/style/Colors';
import { getEntityProperties } from '../../../utils/DataUtils';

const {
  HOURS_WORKED,
  NAME,
  REQUIRED_HOURS,
  STATUS,
} = PROPERTY_TYPE_FQNS;
const { getStyleVariation } = StyleUtils;

const statusColorVariation = getStyleVariation('color', {
  default: OL.GREY02,
  [WORKSITE_ENROLLMENT_STATUSES.ACTIVE]: ENROLLMENT_STATUS_COLORS.ACTIVE,
  [WORKSITE_ENROLLMENT_STATUSES.CANCELED]: OL.GREY02,
  [WORKSITE_ENROLLMENT_STATUSES.COMPLETED]: ENROLLMENT_STATUS_COLORS.SUCCESSFULLY_COMPLETED,
  [WORKSITE_ENROLLMENT_STATUSES.ON_HOLD]: OL.YELLOW01,
  [WORKSITE_ENROLLMENT_STATUSES.PLANNED]: ENROLLMENT_STATUS_COLORS.AWAITING_CHECKIN,
});

const OuterWrapper = styled.div`
  width: 100%;
`;

const AppointmentCardSegment = styled(CardSegment)`
  display: flex;
  justify-content: space-between;
`;

const InnerWrapper = styled.div`
  display: grid;
  grid-template-columns: 50px 140px 140px 140px 140px;
  grid-gap: 5px 30px;
  min-height: 40px;
`;

const Text = styled.span`
  align-items: center;
  color: ${statusColorVariation};
  display: flex;
  font-size: 14px;
`;

type Props = {
  status :Map;
  worksite :Map;
  worksitePlan :Map;
};

const AssignedWorksite = ({ status, worksite, worksitePlan } :Props) => {

  const { [NAME]: worksiteName } = getEntityProperties(worksite, [NAME]);

  const [isEditModalVisible, setEditModalVisibility] = useState(false);
  const [hours, setHours] = useState('');
  const [worksitePlanStatus, setWorksitePlanStatus] = useState('');

  useEffect(() => {
    const {
      [HOURS_WORKED]: hoursWorked,
      [REQUIRED_HOURS]: requiredHours
    } = getEntityProperties(worksitePlan, [HOURS_WORKED, REQUIRED_HOURS]);
    const totalHours = `${hoursWorked} / ${requiredHours} hrs`;
    setHours(totalHours);

    const { [STATUS]: statusName } = getEntityProperties(status, [STATUS]);
    setWorksitePlanStatus(statusName);
  }, [worksitePlan, status]);

  return (
    <OuterWrapper>
      <Card>
        <AppointmentCardSegment padding="sm" vertical={false}>
          <InnerWrapper>
            <Text>
              <FontAwesomeIcon icon={faTools} size="sm" />
            </Text>
            <Text>{ worksiteName }</Text>
            <Text color={worksitePlanStatus}>{ worksitePlanStatus }</Text>
            <Text>{ hours }</Text>
          </InnerWrapper>
          <EditButton onClick={() => setEditModalVisibility(true)} />
        </AppointmentCardSegment>
      </Card>
      <EditWorksitePlanModal
          isOpen={isEditModalVisible}
          onClose={() => setEditModalVisibility(false)}
          worksitePlan={worksitePlan}
          worksitePlanStatus={worksitePlanStatus} />
    </OuterWrapper>
  );
};

export default AssignedWorksite;
