// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button } from 'lattice-ui-kit';
import { Link } from 'react-router-dom';

import WorksitesTable from '../table/WorksitesTable';
import AddWorksiteModal from '../../containers/worksites/AddWorksiteModal';
import * as Routes from '../../core/router/Routes';

import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { ORGANIZATION_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  CardHeaderWrapper,
  CardOuterWrapper,
  CardInnerWrapper,
  SmallSeparator,
  SubtitleWrapper,
  Subtitle,
  Status,
} from '../Layout';
import { OL } from '../../core/style/Colors';

const { DESCRIPTION, ORGANIZATION_NAME } = ORGANIZATION_FQNS;

const WORKSITES_COLUMNS = [
  'WORK SITE NAME',
  'STATUS',
  'START DATE',
  'SCHED. PARTIC.',
  'PAST PARTIC.',
  'TOTAL HOURS'
];

const OrganizationName = styled.h1`
  color: ${OL.GREY15};
  font-weight: 600;
  font-size: 20px;
  &:hover {
    cursor: pointer;
    color: ${OL.PURPLE02};
  }
  &:active {
    color: ${OL.PURPLE01};
  }
`;

const Description = styled.div`
  color: ${OL.GREY15};
  font-size: 14px;
  margin: 40px 0 0 0;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const StyledButton = styled(Button)`
  font-size: 13px;
  padding: 6px 12px;
`;

type Props = {
  onClickWorksite :(worksite :Map) => void;
  organization :Map;
  orgStatus :string;
  showAddWorksiteModal :boolean;
  onClickAddWorksite :() => void;
  onClickCloseAddWorksite :() => void;
  worksiteCount :string;
  worksites :List;
  worksitesInfo :Map;
};

const WorksitesByOrgCard = ({
  onClickWorksite,
  organization,
  orgStatus,
  showAddWorksiteModal,
  onClickAddWorksite,
  onClickCloseAddWorksite,
  worksiteCount,
  worksites,
  worksitesInfo,
} :Props) => {
  const organizationEKID :UUID = getEntityKeyId(organization);
  const {
    [DESCRIPTION]: orgDescription,
    [ORGANIZATION_NAME]: orgName
  } = getEntityProperties(organization, [DESCRIPTION, ORGANIZATION_NAME]);
  return (
    <CardOuterWrapper>
      <CardInnerWrapper>
        <CardHeaderWrapper>
          <StyledLink to={Routes.ORGANIZATION_PROFILE.replace(':organizationId', organizationEKID)}>
            <OrganizationName>
              { orgName }
            </OrganizationName>
          </StyledLink>
          <StyledButton onClick={onClickAddWorksite}>Add Worksite</StyledButton>
        </CardHeaderWrapper>
        <SubtitleWrapper>
          <Subtitle>{ worksiteCount }</Subtitle>
          <SmallSeparator>•</SmallSeparator>
          <Status status={orgStatus}>
            { orgStatus }
          </Status>
        </SubtitleWrapper>
        <Description>{ orgDescription }</Description>
      </CardInnerWrapper>
      {
        worksites
          ? (
            <WorksitesTable
                columnHeaders={WORKSITES_COLUMNS}
                small={false}
                selectWorksite={onClickWorksite}
                tableMargin="15"
                worksites={worksites}
                worksitesInfo={worksitesInfo} />
          ) : null
      }
      <AddWorksiteModal
          isOpen={showAddWorksiteModal}
          onClose={onClickCloseAddWorksite}
          organization={organization} />
    </CardOuterWrapper>
  );
};

export default WorksitesByOrgCard;
