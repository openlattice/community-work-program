// @flow
import React from 'react';
import styled from 'styled-components';
import { List } from 'immutable';

import WorksitesTable from '../table/WorksitesTable';
import { Separator } from '../Layout';
import { OL } from '../../core/style/Colors';

const CardOuterWrapper = styled.div`
  width: 100%;
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
  background-color: ${OL.WHITE};
  margin-bottom: 20px;
`;

const InnerTextWrapper = styled.div`
  margin: 50px;
  display: flex;
  flex-direction: column;
`;

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

const SubtitleWrapper = styled.span`
  display: flex;
`;

const Subtitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${OL.GREY02};
`;

const SmallSeparator = styled(Separator)`
  margin: 0 5px;
  font-weight: 300;
`;

const Status = styled(Subtitle)`
  color: ${props => (props.active ? OL.GREEN02 : OL.RED01)};
`;

const Description = styled.div`
  color: ${OL.GREY15};
  font-size: 16px;
  margin: 40px 0 0 0;
`;

type Props = {
  organization :List;
  worksiteCount :string;
  worksites :List;
};

const WorksitesByOrgCard = ({ organization, worksiteCount, worksites } :Props) => (
  <CardOuterWrapper>
    <InnerTextWrapper>
      <OrganizationName>{organization.get('name')}</OrganizationName>
      <SubtitleWrapper>
        <Subtitle>{worksiteCount}</Subtitle>
        <SmallSeparator>•</SmallSeparator>
        <Status active={organization.get('status') === 'Active'}>
          {organization.get('status')}
        </Status>
      </SubtitleWrapper>
      <Description>{organization.get('description')}</Description>
    </InnerTextWrapper>
    {
      worksites
        ? (
          <WorksitesTable
              handleSelect={() => {}}
              selectedWorksiteId=""
              small={false}
              selectWorksite={() => {}}
              worksites={worksites} />
        ) : null
    }
  </CardOuterWrapper>
);

export default WorksitesByOrgCard;
