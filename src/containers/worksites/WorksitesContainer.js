// @flow
import React, { Component } from 'react';
import { List, Map } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import WorksitesByOrgCard from '../../components/organization/WorksitesByOrgCard';
import LogoLoader from '../../components/LogoLoader';
import * as Routes from '../../core/router/Routes';

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
  ORGANIZATIONS,
  WORKSITES
} from '../../utils/constants/ReduxStateConsts';
import { APP_TYPE_FQNS, ORGANIZATION_FQNS, WORKSITE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  getWorksites,
  getWorksitePlans,
} from './WorksitesActions';
import {
  getOrganizations,
} from '../organizations/OrganizationsActions';

const { ORGANIZATION } = APP_TYPE_FQNS;
const { DATETIME_END, DATETIME_START } = WORKSITE_FQNS;
const { ORGANIZATION_NAME } = ORGANIZATION_FQNS;
const {
  ACTIONS,
  GET_ORGANIZATIONS,
  ORGANIZATIONS_LIST,
  REQUEST_STATE
} = ORGANIZATIONS;
const { WORKSITES_BY_ORG, WORKSITES_INFO } = WORKSITES;

const dropdowns :List = List().withMutations((list :List) => {
  list.set(0, statusFilterDropdown);
});
const defaultFilterOption :Map = statusFilterDropdown.get('enums')
  .find(obj => obj.value.toUpperCase() === ALL);


type Props = {
  actions:{
    getOrganizations :RequestSequence;
    getWorksites :RequestSequence;
    getWorksitePlans :RequestSequence;
    goToRoute :RequestSequence;
  },
  app :Map;
  getOrganizationsRequestState :RequestState;
  initializeAppRequestState :RequestState;
  organizationsList :List;
  worksitesByOrg :Map;
  worksitesInfo :Map;
};

type State = {
  organizationStatuses :Map;
  organizationsToRender :List;
  selectedFilterOption :Map;
};

class WorksitesContainer extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      organizationStatuses: Map(),
      organizationsToRender: props.organizationsList,
      selectedFilterOption: defaultFilterOption,
    };
  }

  componentDidMount() {
    const { actions, app } = this.props;
    this.setOrganizationStatuses();
    if (app.get(ORGANIZATION)) {
      actions.getOrganizations();
    }
  }

  componentDidUpdate(prevProps :Props, prevState :State) {
    const { app, actions, organizationsList } = this.props;
    const { organizationStatuses } = this.state;
    const prevOrganizationESID = prevProps.app.get(ORGANIZATION);
    const organizationESID = app.get(ORGANIZATION);
    if (prevOrganizationESID !== organizationESID) {
      actions.getOrganizations();
    }
    if (prevProps.organizationsList.count() !== organizationsList.count()) {
      this.setOrganizationStatuses();
    }
    if (prevState.organizationStatuses.count() !== organizationStatuses.count()) {
      this.sortOrganizations();
    }
  }

  handleOnClickWorksite = (worksite :Map) => {
    const { actions } = this.props;
    actions.goToRoute(Routes.WORKSITE_PROFILE.replace(':worksiteId', worksite.get('id')));
  }

  handleOnFilter = (clickedProperty :Map, selectEvent :Object, orgs :List) => {
    const { organizationsList } = this.props;
    const { organizationStatuses } = this.state;
    const orgsToFilter = isDefined(orgs) ? orgs : organizationsList;
    const { filter, value } = clickedProperty;
    const propertyKeyLookup = value.toUpperCase();
    let filteredOrgs :List = organizationsList;

    if (value === ALL) {
      if (!isDefined(orgs)) {
        this.setState({ organizationsToRender: organizationsList, selectedFilterOption: clickedProperty });
        return organizationsList;
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
      organizationsToRender: filteredOrgs,
      selectedFilterOption: clickedProperty
    });
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


  setOrganizationStatuses = () => {
    const { organizationsList, worksitesByOrg } = this.props;
    let organizationStatuses :Map = Map();

    // for organizations that have existing worksites
    worksitesByOrg.forEach((worksiteList :List, orgEKID :UUID) => {
      const currentlyActiveWorksite = worksiteList ? worksiteList.find((worksite :Map) => {
        const {
          [DATETIME_END]: end,
          [DATETIME_START]: start
        } = getEntityProperties(worksite, [DATETIME_END, DATETIME_START]);
        return start && !end;
      }) : undefined;
      const orgStatus :string = isDefined(currentlyActiveWorksite) ? 'Active' : 'Inactive';
      organizationStatuses = organizationStatuses.set(orgEKID, orgStatus);
    });

    // for organizations with no existing worksites
    organizationsList.forEach((org :Map) => {
      const orgEKID :UUID = getEntityKeyId(org);
      if (!worksitesByOrg.get(orgEKID)) {
        organizationStatuses = organizationStatuses.set(orgEKID, 'Inactive');
      }
    });

    this.setState({ organizationStatuses });
  }

  sortOrganizations = (organizations :List) => {
    const { organizationsList } = this.props;
    const { organizationStatuses } = this.state;
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
  }

  sortOrganizationsSubset = (organizations :List) => {
    return organizations
      .sort((orgA, orgB) => {
        const { [ORGANIZATION_NAME]: orgNameA } = getEntityProperties(orgA, [ORGANIZATION_NAME]);
        const { [ORGANIZATION_NAME]: orgNameB } = getEntityProperties(orgB, [ORGANIZATION_NAME]);
        return orgNameA.localeCompare(orgNameB, undefined, { sensitivity: 'base' });
      });
  }

  render() {
    const {
      getOrganizationsRequestState,
      initializeAppRequestState,
      worksitesByOrg,
      worksitesInfo,
    } = this.props;
    const { organizationStatuses, organizationsToRender } = this.state;
    const onSelectFunctions :Map = Map().withMutations((map :Map) => {
      map.set(FILTERS.STATUS, this.handleOnFilter);
    });
    const orgSubHeader :string = organizationsToRender.count() !== 1
      ? `${organizationsToRender.count()} Organizations` : '1 Organization';
    const worksiteCount = worksitesByOrg.valueSeq().count();
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
            primaryButtonAction={() => {}}
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
                if (orgWorksites.count() === 1) orgWorksiteCount = '1 Work Site';
                if (orgWorksites.count() > 1) orgWorksiteCount = `${orgWorksites.count()} Work Sites`;
              }
              return (
                <WorksitesByOrgCard
                    key={orgEKID}
                    onClickWorksite={this.handleOnClickWorksite}
                    organization={org}
                    orgStatus={organizationStatuses.get(orgEKID)}
                    worksiteCount={orgWorksiteCount}
                    worksites={orgWorksites}
                    worksitesInfo={worksitesInfo} />
              );
            })
          }
        </ContainerInnerWrapper>
      </ContainerOuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => {
  const app = state.get(STATE.APP);
  const organizations = state.get(STATE.ORGANIZATIONS);
  const worksites = state.get(STATE.WORKSITES);
  return {
    app,
    getOrganizationsRequestState: organizations.getIn([ACTIONS, GET_ORGANIZATIONS, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [ORGANIZATIONS_LIST]: organizations.get(ORGANIZATIONS_LIST),
    [WORKSITES_BY_ORG]: worksites.get(WORKSITES_BY_ORG),
    [WORKSITES_INFO]: worksites.get(WORKSITES_INFO),
  };
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getOrganizations,
    getWorksites,
    getWorksitePlans,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WorksitesContainer));
