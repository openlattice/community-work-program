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
const defaultFilterOption :Map = statusDropdown.get('enums').find(option => option.get('default'));

/*
 * Props and State
 */

type Props = {
};

type State = {
  numberTotalWorksitesToRender :number;
  organizationsToRender :List;
  selectedFilterOption :Map;
};

/*
 * React component
 */

class WorksitesContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      numberTotalWorksitesToRender: worksites.count(),
      organizationsToRender: organizations,
      selectedFilterOption: defaultFilterOption,
    };
  }

  componentDidMount() {
    this.setState({ organizationsToRender: organizations });
  }

  handleOnFilter = (clickedStatus :Map) => {
    this.setState({ selectedFilterOption: clickedStatus });
    const statusName :string = clickedStatus.get('label').toLowerCase();
    let filteredOrgs = organizations;
    if (statusName !== 'all') {
      filteredOrgs = organizations.filter((org :Map) => (
        org.get('status').toLowerCase() === statusName
      ));
    }
    this.setState({ organizationsToRender: filteredOrgs });

    let numberOfWorksites = 0;
    filteredOrgs.forEach((org :Map) => {
      worksites.forEach((worksite :Map) => {
        if (org.get('name') === worksite.get('organization')) {
          numberOfWorksites += 1;
        }
      });
    });
    this.setState({ numberTotalWorksitesToRender: numberOfWorksites });
    return filteredOrgs;
  }

  handleOnSearch = () => {
  }

  render() {
    const { numberTotalWorksitesToRender, organizationsToRender } = this.state;
    const onSelectFunctions :Map = Map().withMutations((map :Map) => {
      map.set('Status', this.handleOnFilter);
    });
    const orgSubHeader :string = organizationsToRender.count() !== 1
      ? `${organizationsToRender.count()} Organizations` : '1 Organization';
    const worksiteSubHeader :string = numberTotalWorksitesToRender !== 1
      ? `${numberTotalWorksitesToRender} Worksites` : '1 Worksite';
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
            organizationsToRender.map((org :Map) => {
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
