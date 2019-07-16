// @flow
import React, { Component } from 'react';
import { List, Map } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import WorksitesByOrgCard from '../../components/organization/WorksitesByOrgCard';
import AddOrganizationModal from '../organizations/AddOrganizationModal';
import LogoLoader from '../../components/LogoLoader';

import { goToRoute } from '../../core/router/RoutingActions';
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
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import {
  ALL,
  FILTERS,
  statusFilterDropdown,
  WORKSITE_STATUSES
} from './WorksitesConstants';
import {
  APP,
  STATE,
  WORKSITES
} from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, ORGANIZATION_FQNS, WORKSITE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  getOrganizations,
  getWorksitesByOrg,
  getWorksitePlans,
} from './WorksitesActions';

const { ORGANIZATION } = APP_TYPE_FQNS;
const { DATETIME_END, DATETIME_START } = WORKSITE_FQNS;
const { ORGANIZATION_NAME } = ORGANIZATION_FQNS;
const {
  ACTIONS,
  GET_ORGANIZATIONS,
  ORGANIZATION_STATUSES,
  ORGANIZATIONS_LIST,
  REQUEST_STATE,
  WORKSITES_BY_ORG,
  WORKSITES_INFO,
} = WORKSITES;
// const { ORGANIZATION_STATUSES, WORKSITES_BY_ORG, WORKSITES_INFO } = WORKSITES;

const dropdowns :List = List().withMutations((list :List) => {
  list.set(0, statusFilterDropdown);
});
const defaultFilterOption :Map = statusFilterDropdown.get('enums')
  .find(obj => obj.value.toUpperCase() === ALL);


type Props = {
  actions:{
    getOrganizations :RequestSequence;
    getWorksitesByOrg :RequestSequence;
    getWorksitePlans :RequestSequence;
    goToRoute :RequestSequence;
  },
  app :Map;
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

    // let sortedOrganizationsList :List = List();
    //
    // if (props.organizationsList.count() > 0 && props.organizationStatuses.count() > 0) {
    //   sortedOrganizationsList = this.sortOrganizations(null, props.organizationStatuses, true);
    // }

    this.state = {
      organizationsToRender: props.organizationsList,
      selectedFilterOption: defaultFilterOption,
      showAddOrganization: false,
    };
  }

  componentDidUpdate(prevProps :Props, prevState :State) {
    const {
      app,
      actions,
      organizationsList,
      organizationStatuses,
      worksitesByOrg
    } = this.props;
    const prevOrganizationESID = prevProps.app.get(ORGANIZATION);
    const organizationESID = app.get(ORGANIZATION);
    // if app types have loaded successfully:
    if (prevOrganizationESID !== organizationESID) {
      actions.getOrganizations();
    }
    // if getOrganizations was successful and organizations exist:
    if (prevProps.organizationsList.count() !== organizationsList.count()) {
      this.sortOrganizations();
    }
    // if a new worksite was just added and corresponding org has switched to Active:
    // const prevWorksitesByOrg = prevProps.worksitesByOrg;
    // const prevWorksiteCount = prevWorksitesByOrg.reduce((count, worksiteList) => count + worksiteList.count(), 0);
    // const worksiteCount = worksitesByOrg.reduce((count, worksiteList) => count + worksiteList.count(), 0);
    // if (prevWorksiteCount !== worksiteCount) {
    //   if (prevWorksitesByOrg.keySeq().count() !== worksitesByOrg.keySeq().count()) {
    //     this.setOrganizationStatuses(false);
    //   }
    // }
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
      organizationStatuses,
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
            <ContainerSubHeader>{ orgSubHeader }</ContainerSubHeader>
            <Separator>•</Separator>
            <ContainerSubHeader>{ worksiteSubHeader }</ContainerSubHeader>
          </HeaderWrapper>
          {
            organizationsToRender.map((org :Map) => {
              const orgEKID :UUID = getEntityKeyId(org);
              const orgWorksites = worksitesByOrg.get(orgEKID);
              let orgWorksiteCount :string = '0 Work Sites';
              if (orgWorksites) {
                const count = orgWorksites.count();
                if (count === 1) orgWorksiteCount = '1 Work Site';
                if (count > 1) orgWorksiteCount = `${orgWorksites.count()} Work Sites`;
              }
              return (
                <WorksitesByOrgCard
                    key={orgEKID}
                    organization={org}
                    orgStatus={organizationStatuses.get(orgEKID)}
                    worksiteCount={orgWorksiteCount}
                    worksites={orgWorksites}
                    worksitesInfo={worksitesInfo} />
              );
            })
          }
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
  return {
    app,
    getOrganizationsRequestState: worksites.getIn([ACTIONS, GET_ORGANIZATIONS, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [ORGANIZATIONS_LIST]: worksites.get(ORGANIZATIONS_LIST),
    [ORGANIZATION_STATUSES]: worksites.get(ORGANIZATION_STATUSES),
    [WORKSITES_BY_ORG]: worksites.get(WORKSITES_BY_ORG),
    [WORKSITES_INFO]: worksites.get(WORKSITES_INFO),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getOrganizations,
    getWorksitesByOrg,
    getWorksitePlans,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WorksitesContainer));
