// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import { statusDropdown } from './WorksitesConstants';

import WorksitesByOrgCard from '../../components/organization/WorksitesByOrgCard';

import {
  ContainerOuterWrapper,
  ContainerInnerWrapper,
  HeaderWrapper,
  ContainerHeader,
  ContainerSubHeader,
  Separator,
} from '../../components/Layout';
import { ToolBar } from '../../components/controls/index';
import { OL } from '../../core/style/Colors';

/* Fake Data */
import { organizations, worksites } from './FakeData';

/*
 * styled components
 */

/*
 * constants
 */

const dropdowns :List = List().withMutations((list :List) => {
  list.set(0, statusDropdown);
});

/*
 * Props and State
 */

type Props = {
};

/*
 * React component
 */

class WorksitesContainer extends Component<Props> {

  handleOnFilter = () => {
  }

  render() {
    const onSelectFunctions :Map = Map().withMutations((map :Map) => {
      map.set('Status', this.handleOnFilter);
    });
    const orgSubHeader :string = organizations.count() !== 1
      ? `${organizations.count()} Organizations` : '1 Organization';
    const worksiteSubHeader :string = worksites.count() !== 1 ? `${worksites.count()} Worksites` : '1 Worksite';
    return (
      <ContainerOuterWrapper>
        <ToolBar
            buttonAction={() => {}}
            buttonText="Add Worksite"
            dropdowns={dropdowns}
            onSelectFunctions={onSelectFunctions}
            search={() => {}} />
        <ContainerInnerWrapper>
          <HeaderWrapper>
            <ContainerHeader>Worksites</ContainerHeader>
            <ContainerSubHeader>{orgSubHeader}</ContainerSubHeader>
            <Separator>•</Separator>
            <ContainerSubHeader>{worksiteSubHeader}</ContainerSubHeader>
          </HeaderWrapper>
          {
            organizations.map((org :Map) => {
              const orgWorksites = worksites.filter(
                (worksite :Map) => worksite.get('organization') === org.get('name')
              );
              const worksiteCount :string = orgWorksites.count() !== 1
                ? `${orgWorksites.count()} Worksites` : '1 Worksite';
              return (
                <WorksitesByOrgCard
                    key={org.get('id')}
                    organization={org}
                    worksiteCount={worksiteCount}
                    worksites={orgWorksites} />
              );
            })
          }
        </ContainerInnerWrapper>
      </ContainerOuterWrapper>
    );
  }
}

export default WorksitesContainer;
