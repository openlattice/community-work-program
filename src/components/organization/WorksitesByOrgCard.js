// @flow
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import WorksitesTable from '../table/WorksitesTable';
import {
  CardOuterWrapper,
  CardInnerWrapper,
  SmallSeparator,
  SubtitleWrapper,
  Subtitle,
  Status,
} from '../Layout';
import { OL } from '../../core/style/Colors';

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

type Props = {
  onClickOrganization :(organization :Map) => void;
  organization :Map;
  worksiteCount :string;
  worksites :List;
};

const WorksitesByOrgCard = ({
  onClickOrganization,
  organization,
  worksiteCount,
  worksites
} :Props) => (
  <CardOuterWrapper>
    <CardInnerWrapper>
      <OrganizationName
          onClick={() => onClickOrganization(organization)}>
        {organization.get('name')}
      </OrganizationName>
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
              handleSelect={() => {}}
              selectedWorksiteId=""
              small={false}
              selectWorksite={() => {}}
              tableMargin="15"
              worksites={worksites} />
        ) : null
    }
  </CardOuterWrapper>
);

export default WorksitesByOrgCard;
