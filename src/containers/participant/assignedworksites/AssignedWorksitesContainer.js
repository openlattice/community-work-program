// @flow
import React from 'react';

import styled from 'styled-components';
import { faTools } from '@fortawesome/pro-light-svg-icons';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  CardStack,
  Colors,
  IconSplash,
  Label,
} from 'lattice-ui-kit';

import AssignedWorksite from './AssignedWorksite';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getEntityKeyId } from '../../../utils/DataUtils';

const { NEUTRAL } = Colors;
const { HOURS_WORKED, REQUIRED_HOURS } = PROPERTY_TYPE_FQNS;

const getHoursTotals = (worksitePlansList :List) :Object => {
  const hoursWorked :number = worksitePlansList.reduce((sum :number, plan :Map) => (
    sum + plan.getIn([HOURS_WORKED, 0])
  ), 0);
  const requiredHours :number = worksitePlansList.reduce((sum :number, plan :Map) => (
    sum + plan.getIn([REQUIRED_HOURS, 0])
  ), 0);
  return { hoursWorked, requiredHours };
};

const NameRowWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 45px 0 15px;
  width: 100%;
`;

const NameHeader = styled.div`
  color: ${NEUTRAL.N900};
  font-size: 26px;
  font-weight: 600;
`;

const CountWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin: 10px 0;
`;

const CountLabel = styled(Label)`
  font-size: 12px;
  margin-left: 15px;
`;

type Props = {
  assignWorksiteModal :string;
  handleShowModal :(modalName :string) => void;
  worksitePlanStatuses :Map;
  worksitePlansList :List;
  worksitesByWorksitePlan :Map;
};

const AssignedWorksitesContainer = ({
  assignWorksiteModal,
  handleShowModal,
  worksitePlanStatuses,
  worksitePlansList,
  worksitesByWorksitePlan
} :Props) => {

  const showAddWorksiteModal = () => {
    handleShowModal(assignWorksiteModal);
  };

  const { hoursWorked, requiredHours } = getHoursTotals(worksitePlansList);
  const hoursWorkedText :string = `Hours worked: ${hoursWorked}`;
  const requiredHoursText :string = `Req. hours: ${requiredHours}`;

  return (
    <>
      <NameRowWrapper>
        <NameHeader>Assigned Work Sites</NameHeader>
        <Button onClick={showAddWorksiteModal}>Add Work Site</Button>
      </NameRowWrapper>
      {
        worksitePlansList.isEmpty()
          ? (
            <Card>
              <CardSegment>
                <IconSplash
                    caption="No Assigned Work Sites"
                    icon={faTools}
                    size="3x" />
              </CardSegment>
            </Card>
          )
          : (
            <>
              <CardStack>
                {
                  worksitePlansList.map((worksitePlan :Map) => {
                    const worksitePlanEKID :UUID = getEntityKeyId(worksitePlan);
                    const worksite :Map = worksitesByWorksitePlan.get(worksitePlanEKID);
                    const worksitePlanStatus :Map = worksitePlanStatuses.get(worksitePlanEKID);
                    return (
                      <AssignedWorksite
                          key={worksitePlanEKID}
                          status={worksitePlanStatus}
                          worksite={worksite}
                          worksitePlan={worksitePlan} />
                    );
                  })
                }
              </CardStack>
              <CountWrapper>
                <CountLabel subtle>{ hoursWorkedText }</CountLabel>
                <CountLabel subtle>{ requiredHoursText }</CountLabel>
              </CountWrapper>
            </>
          )
      }
    </>
  );
};

export default AssignedWorksitesContainer;
