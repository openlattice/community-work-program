// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Link } from 'react-router-dom';

import WorksitesTable from '../table/WorksitesTable';
import * as Routes from '../../core/router/Routes';

import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { ORGANIZATION_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
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

const OrganizationName = styled.span`
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
  margin: 0 0 10px 0;
`;

type Props = {
  onClickWorksite :(worksite :Map) => void;
  organization :Map;
  orgStatus :string;
  worksiteCount :string;
  worksites :List;
  worksitesInfo :Map;
};

const WorksitesByOrgCard = ({
  onClickWorksite,
  organization,
  orgStatus,
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
        <StyledLink to={Routes.ORGANIZATION_PROFILE.replace(':organizationId', organizationEKID)}>
          <OrganizationName>
            { orgName }
          </OrganizationName>
        </StyledLink>
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
    </CardOuterWrapper>
  );
};

export default WorksitesByOrgCard;
