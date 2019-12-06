// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { CardStack } from 'lattice-ui-kit';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import WorksitesByOrgCard from './WorksitesByOrgCard';
import AddOrganizationModal from '../organizations/AddOrganizationModal';
import LogoLoader from '../../components/LogoLoader';

import { getOrganizations, getWorksitesByOrg, getWorksitePlans } from './WorksitesActions';
import { ContainerHeader, ContainerInnerWrapper, ContainerOuterWrapper } from '../../components/Layout';
import { ToolBar } from '../../components/controls/index';
import { isDefined } from '../../utils/LangUtils';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import {
  ALL,
  FILTERS,
  statusFilterDropdown,
  WORKSITE_STATUSES
} from './WorksitesConstants';
import { APP, STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../core/style/Colors';

const { ORGANIZATION } = APP_TYPE_FQNS;
const { ORGANIZATION_NAME } = PROPERTY_TYPE_FQNS;
const { ENTITY_SET_IDS_BY_ORG, SELECTED_ORG_ID } = APP;
const {
  ACTIONS,
  GET_ORGANIZATIONS,
  ORGANIZATION_STATUSES,
  ORGANIZATIONS_LIST,
  REQUEST_STATE,
  WORKSITES_BY_ORG,
  WORKSITES_INFO,
} = WORKSITES;

const dropdowns :List = List().withMutations((list :List) => {
  list.set(0, statusFilterDropdown);
});
const defaultFilterOption :Map = statusFilterDropdown.get('enums')
  .find((obj :Object) => obj.value.toUpperCase() === ALL);


const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 20px;
`;

const SubHeaderWrapper = styled.div`
  align-items: center;
  display: flex;
  margin-top: 10px;
`;

const ContainerSubHeader = styled(ContainerHeader)`
  color: ${OL.GREY02};
  font-size: 14px;
`;

const Separator = styled.div`
  align-items: center;
  color: ${OL.GREY02};
  display: flex;
  font-weight: 600;
  justify-content: center;
  margin: 0 10px;
`;

type Props = {
  actions:{
    getOrganizations :RequestSequence;
    getWorksitesByOrg :RequestSequence;
    getWorksitePlans :RequestSequence;
  },
  entitySetIds :Map;
  getOrganizationsRequestState :RequestState;
  initializeAppRequestState :RequestState;
  organizationsList :List;
  organizationStatuses :Map;
  worksitesByOrg :Map;
  worksitesInfo :Map;
};

type State = {
  organizationsToRender :List;
  selectedFilterOption :Map;
  showAddOrganization :boolean;
};

class WorksitesContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      organizationsToRender: props.organizationsList,
      selectedFilterOption: defaultFilterOption,
      showAddOrganization: false,
    };
  }

  componentDidMount() {
    const { actions, entitySetIds } = this.props;
    if (entitySetIds.has(ORGANIZATION)) {
      actions.getOrganizations();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      entitySetIds,
      actions,
      organizationsList,
    } = this.props;
    const prevOrganizationESID = prevProps.entitySetIds.get(ORGANIZATION);
    const organizationESID = entitySetIds.get(ORGANIZATION);
    // if app types have loaded successfully:
    if (prevOrganizationESID !== organizationESID) {
      actions.getOrganizations();
    }
    // if getOrganizations was successful and organizations exist:
    if (prevProps.organizationsList.count() !== organizationsList.count()) {
      this.sortOrganizations();
    }
  }

  handleOnFilter = (clickedProperty :Map, selectEvent :Object, orgs :List) => {
    const { organizationsList, organizationStatuses } = this.props;
    const orgsToFilter = isDefined(orgs) ? orgs : organizationsList;
    const { filter, value } = clickedProperty;
    const propertyKeyLookup = value.toUpperCase();
    let filteredOrgs :List = orgsToFilter;

    if (value === ALL) {
      if (!isDefined(orgs)) {
        this.setState({ selectedFilterOption: clickedProperty });
        const sorted :List = this.sortOrganizations(orgsToFilter);
        return sorted;
      }
      return organizationsList;
    }
    if (filter === FILTERS.STATUS) {
      filteredOrgs = orgsToFilter.filter((org :Map) => {
        const statusTypeToInclude = WORKSITE_STATUSES[propertyKeyLookup];
        const orgEKID :UUID = getEntityKeyId(org);
        return organizationStatuses.get(orgEKID) === statusTypeToInclude;
      });
    }

    // if function was called with orgs argument, return filteredOrgs to prevent multiple setState calls
    if (isDefined(orgs)) {
      return filteredOrgs;
    }

    this.setState({
      selectedFilterOption: clickedProperty
    });
    this.sortOrganizations(filteredOrgs);
    return filteredOrgs;
  }

  handleOnSearch = (input :string) => {
    const { organizationsList } = this.props;
    const { selectedFilterOption } = this.state;
    const matches :List = organizationsList.filter((org :Map) => {
      const { [ORGANIZATION_NAME]: orgName } = getEntityProperties(org, [ORGANIZATION_NAME]);
      const trimmedInput = input.trim().toLowerCase();
      const trimmedOrgName = orgName.trim().toLowerCase();
      const match = trimmedOrgName.includes(trimmedInput);
      return match;
    });
    // preserve any non-default filters selected before search, then sort
    const filteredSearchedOrgs :List = (selectedFilterOption !== defaultFilterOption)
      ? this.handleOnFilter(selectedFilterOption, null, matches)
      : matches;
    this.sortOrganizations(filteredSearchedOrgs);
  }

  handleShowAddOrganization = () => {
    this.setState({
      showAddOrganization: true
    });
  }

  handleHideAddOrganization = () => {
    this.setState({
      showAddOrganization: false
    });
  }

  sortOrganizations = (organizations :List) => {
    const { organizationsList, organizationStatuses } = this.props;

    const organizationsToSort :List = isDefined(organizations) ? organizations : organizationsList;
    let sortedOrganizations :List = List();

    // sort based on status, so all active organizations appear above inactive organizations
    const activeOrganizations = organizationsToSort.filter((org :Map) => organizationStatuses
      .get(getEntityKeyId(org)) === WORKSITE_STATUSES.ACTIVE);
    const sortedActive :List = this.sortOrganizationsSubset(activeOrganizations);
    sortedOrganizations = sortedOrganizations.concat(sortedActive);

    const inactiveOrganizations = organizationsToSort.filter((org :Map) => organizationStatuses
      .get(getEntityKeyId(org)) === WORKSITE_STATUSES.INACTIVE);
    const sortedInactive :List = this.sortOrganizationsSubset(inactiveOrganizations);
    sortedOrganizations = sortedOrganizations.concat(sortedInactive);

    this.setState({ organizationsToRender: sortedOrganizations });
    return null;
  }

  sortOrganizationsSubset = (organizations :List) => organizations
    .sort((orgA, orgB) => {
      const { [ORGANIZATION_NAME]: orgNameA } = getEntityProperties(orgA, [ORGANIZATION_NAME]);
      const { [ORGANIZATION_NAME]: orgNameB } = getEntityProperties(orgB, [ORGANIZATION_NAME]);
      return orgNameA.localeCompare(orgNameB, undefined, { sensitivity: 'base' });
    });

  render() {
    const {
      getOrganizationsRequestState,
      initializeAppRequestState,
      worksitesByOrg,
      worksitesInfo,
    } = this.props;
    const { organizationsToRender, showAddOrganization } = this.state;
    const onSelectFunctions :Map = Map().withMutations((map :Map) => {
      map.set(FILTERS.STATUS, this.handleOnFilter);
    });
    const orgSubHeader :string = organizationsToRender.count() !== 1
      ? `${organizationsToRender.count()} Organizations` : '1 Organization';
    const worksiteCount = organizationsToRender.reduce((count, org) => {
      const orgEKID :UUID = getEntityKeyId(org);
      if (worksitesByOrg.has(orgEKID)) {
        return count + worksitesByOrg.get(orgEKID).count();
      }
      return count;
    }, 0);
    const worksiteSubHeader :string = worksiteCount !== 1 ? `${worksiteCount} Work Sites` : '1 Work Site';

    if (getOrganizationsRequestState === RequestStates.PENDING || initializeAppRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    return (
      <ContainerOuterWrapper>
        <ToolBar
            dropdowns={dropdowns}
            onSelectFunctions={onSelectFunctions}
            primaryButtonAction={this.handleShowAddOrganization}
            primaryButtonText="Add Organization"
            search={this.handleOnSearch} />
        <ContainerInnerWrapper>
          <HeaderWrapper>
            <ContainerHeader>Work Sites</ContainerHeader>
            <SubHeaderWrapper>
              <ContainerSubHeader>{ orgSubHeader }</ContainerSubHeader>
              <Separator>•</Separator>
              <ContainerSubHeader>{ worksiteSubHeader }</ContainerSubHeader>
            </SubHeaderWrapper>
          </HeaderWrapper>
          <CardStack>
            {
              organizationsToRender.map((org :Map) => {
                const orgEKID :UUID = getEntityKeyId(org);
                const orgWorksites = worksitesByOrg.get(orgEKID);
                const orgWorksiteCount :number = orgWorksites.count();
                return (
                  <WorksitesByOrgCard
                      key={orgEKID}
                      organization={org}
                      worksiteCount={orgWorksiteCount}
                      worksites={orgWorksites}
                      worksitesInfo={worksitesInfo} />
                );
              })
            }
          </CardStack>
        </ContainerInnerWrapper>
        <AddOrganizationModal
            isOpen={showAddOrganization}
            onClose={this.handleHideAddOrganization} />
      </ContainerOuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const worksites = state.get(STATE.WORKSITES);
  const selectedOrgId :string = app.get(SELECTED_ORG_ID);
  return {
    [ORGANIZATIONS_LIST]: worksites.get(ORGANIZATIONS_LIST),
    [ORGANIZATION_STATUSES]: worksites.get(ORGANIZATION_STATUSES),
    [WORKSITES_BY_ORG]: worksites.get(WORKSITES_BY_ORG),
    [WORKSITES_INFO]: worksites.get(WORKSITES_INFO),
    entitySetIds: app.getIn([ENTITY_SET_IDS_BY_ORG, selectedOrgId], Map()),
    getOrganizationsRequestState: worksites.getIn([ACTIONS, GET_ORGANIZATIONS, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getOrganizations,
    getWorksitesByOrg,
    getWorksitePlans,
  }, dispatch)
});

// $FlowFixMe
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WorksitesContainer));
