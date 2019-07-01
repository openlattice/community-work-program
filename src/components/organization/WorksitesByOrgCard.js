// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Link } from 'react-router-dom';

import WorksitesTable from '../table/WorksitesTable';
import * as Routes from '../../core/router/Routes';

import {
  CardOuterWrapper,
  CardInnerWrapper,
  SmallSeparator,
  SubtitleWrapper,
  Subtitle,
  Status,
} from '../Layout';
import { OL } from '../../core/style/Colors';

const WORKSITES_COLUMNS = [
  'WORKSITE NAME',
  'STATUS',
  'START DATE',
  'LAST ACTIVE DATE',
  'SCHED. PARTIC.',
  'PAST PARTIC.',
  'TOTAL HOURS'
];

const OrganizationName = styled.span`
  color: ${OL.GREY15};
  font-weight: 600;
  font-size: 20px;
  margin: 0 0 20px 0;
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
  font-size: 16px;
  margin: 40px 0 0 0;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

type Props = {
  onClickOrganization :(organization :Map) => void;
  onClickWorksite :(worksite :Map) => void;
  organization :Map;
  worksiteCount :string;
  worksites :List;
};

const WorksitesByOrgCard = ({
  onClickOrganization,
  onClickWorksite,
  organization,
  worksiteCount,
  worksites
} :Props) => (
  <CardOuterWrapper>
    <CardInnerWrapper>
      <StyledLink to={Routes.ORGANIZATION_PROFILE.replace(':organizationId', organization.get('id'))}>
        <OrganizationName>
          {organization.get('name')}
        </OrganizationName>
      </StyledLink>
      <SubtitleWrapper>
        <Subtitle>{worksiteCount}</Subtitle>
        <SmallSeparator>•</SmallSeparator>
        <Status active={organization.get('status') === 'Active'}>
          {organization.get('status')}
        </Status>
      </SubtitleWrapper>
      <Description>{organization.get('description')}</Description>
    </CardInnerWrapper>
    {
      worksites
        ? (
          <WorksitesTable
              columnHeaders={WORKSITES_COLUMNS}
              selectedWorksiteId=""
              small={false}
              selectWorksite={onClickWorksite}
              tableMargin="15"
              worksites={worksites} />
        ) : null
    }
  </CardOuterWrapper>
);

export default WorksitesByOrgCard;
