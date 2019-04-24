// @flow
import React, { Component } from 'react';
// import styled from 'styled-components';
import { List, Map } from 'immutable';
import type { RouterHistory } from 'react-router';

import WorksitesByOrgCard from '../../components/organization/WorksitesByOrgCard';
import * as Routes from '../../core/router/Routes';
import {
  ContainerOuterWrapper,
  ContainerInnerWrapper,
  HeaderWrapper,
  ContainerHeader,
  ContainerSubHeader,
  Separator,
} from '../../components/Layout';
import { ToolBar } from '../../components/controls/index';
import { isDefined } from '../../utils/LangUtils';
import { statusDropdown } from './WorksitesConstants';
// import { OL } from '../../core/style/Colors';

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
  history :RouterHistory,
};

type State = {
  numberWorksitesToRender :number;
  organizationsToRender :List;
  selectedFilter :Map;
};

/*
 * React component
 */

class WorksitesContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      numberWorksitesToRender: worksites.count(),
      organizationsToRender: organizations,
      selectedFilter: defaultFilterOption,
    };
  }

  componentDidMount() {
    this.setState({ organizationsToRender: organizations });
  }

  getNumberOfWorksites = (orgs :List) => {
    let numberOfWorksites = 0;
    orgs.forEach((org :Map) => {
      worksites.forEach((worksite :Map) => {
        if (org.get('name') === worksite.get('organization')) {
          numberOfWorksites += 1;
        }
      });
    });
    return numberOfWorksites;
  }

  handleOnClickOrganization = (org :Map) => {
    const { history } = this.props;
    history.push(Routes.ORGANIZATION_PROFILE.replace(':organizationId', org.get('id')));
  }

  handleOnFilter = (clickedStatus :Map, orgs :List) => {
    this.setState({ selectedFilter: clickedStatus });
    const statusName :string = clickedStatus.get('label').toLowerCase();
    const orgsToFilter = isDefined(orgs) ? orgs : organizations;
    let filteredOrgs = orgsToFilter;
    if (statusName !== 'all') {
      filteredOrgs = orgsToFilter.filter((org :Map) => (
        org.get('status').toLowerCase() === statusName
      ));
    }
    const numberOfWorksites :number = this.getNumberOfWorksites(filteredOrgs);

    this.setState({
      numberWorksitesToRender: numberOfWorksites,
      organizationsToRender: filteredOrgs,
    });
  }

  handleOnSearch = (input :string) => {
    const { selectedFilter } = this.state;
    const matches :List = organizations.filter((org :Map) => {
      const trimmedInput = input.trim().toLowerCase();
      const orgName = org.get('name').trim().toLowerCase();
      const match = orgName.includes(trimmedInput);
      return match;
    });
    this.handleOnFilter(selectedFilter, matches);
  }

  render() {
    const { numberWorksitesToRender, organizationsToRender } = this.state;
    const onSelectFunctions :Map = Map().withMutations((map :Map) => {
      map.set('Status', this.handleOnFilter);
    });
    const orgSubHeader :string = organizationsToRender.count() !== 1
      ? `${organizationsToRender.count()} Organizations` : '1 Organization';
    const worksiteSubHeader :string = numberWorksitesToRender !== 1
      ? `${numberWorksitesToRender} Worksites` : '1 Worksite';
    return (
      <ContainerOuterWrapper>
        <ToolBar
            buttonAction={() => {}}
            buttonText="Add Worksite"
            dropdowns={dropdowns}
            onSelectFunctions={onSelectFunctions}
            search={this.handleOnSearch} />
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
                    onClickOrganization={this.handleOnClickOrganization}
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
