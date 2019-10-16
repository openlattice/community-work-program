// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import {
  fromJS,
  List,
  Map,
  OrderedMap
} from 'immutable';
import { DateTime } from 'luxon';
import {
  Card,
  CardSegment,
  DataGrid,
  EditButton,
  Table,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import type { Match } from 'react-router';

import LogoLoader from '../../components/LogoLoader';

import { getWorksite } from './WorksitesActions';
import { goToRoute } from '../../core/router/RoutingActions';
import { APP_TYPE_FQNS, WORKSITE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { APP, STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getWeekdayTableHeaders, getWorksiteStatus } from './WorksitesUtils';
import {
  ContainerHeader,
  ContainerInnerWrapper,
  ContainerOuterWrapper,
} from '../../components/Layout';
import { BackNavButton } from '../../components/controls/index';
import { OL } from '../../core/style/Colors';
import * as Routes from '../../core/router/Routes';

const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  NAME,
} = WORKSITE_FQNS;
const {
  ACTIONS,
  GET_WORKSITE,
  REQUEST_STATE,
  WORKSITE,
} = WORKSITES;

/* Label Maps */
const datesLabelMap :OrderedMap = OrderedMap({
  dateFirstActive: 'Date first active',
  dateInactive: 'Date marked inactive',
});

const contactLabelMap :OrderedMap = OrderedMap({
  contactName: 'Contact name',
  contactPhone: 'Contact phone',
  contactEmail: 'Contact email',
  address: 'Address',
});

const worksiteInfoLabelMap :OrderedMap = OrderedMap({
  holidays: 'Holidays',
  availableWork: 'Available work',
  status: 'Status'
});

/* styled components */
const ProfileNameHeader = styled(ContainerHeader)`
  margin: 30px 0;
`;

const HeaderRowWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

type Props = {
  actions:{
    getWorksite :RequestSequence;
    goToRoute :RequestSequence;
  },
  app :Map;
  getWorksiteRequestState :RequestState;
  initializeAppRequestState :RequestState;
  match :Match;
  worksite :Map;
};

class WorksiteProfile extends Component<Props> {

  componentDidMount() {
    const { app } = this.props;
    if (app.get(APP_TYPE_FQNS.WORKSITE)) {
      this.loadProfile();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const { app } = this.props;
    if (!prevProps.app.get(APP_TYPE_FQNS.WORKSITE) && app.get(APP_TYPE_FQNS.WORKSITE)) {
      this.loadProfile();
    }
  }

  loadProfile = () => {
    const {
      actions,
      match: {
        params: { worksiteId: worksiteEKID }
      }
    } = this.props;
    actions.getWorksite({ worksiteEKID });
  }

  goToOrganizations = () => {
    const { actions } = this.props;
    actions.goToRoute(Routes.WORKSITES);
  }

  goToEditWorksiteInfoForm = () => {
    const {
      actions,
      match: {
        params: { worksiteId: worksiteEKID }
      }
    } = this.props;
    actions.goToRoute(Routes.EDIT_WORKSITE_PROFILE_INFO.replace(':worksiteId', worksiteEKID));
  }

  render() {
    const {
      getWorksiteRequestState,
      initializeAppRequestState,
      worksite,
    } = this.props;

    if (initializeAppRequestState === RequestStates.PENDING
        || getWorksiteRequestState === RequestStates.PENDING) {
      return (
        <LogoLoader
            loadingText="Please wait..."
            size={60} />
      );
    }

    const {
      [DATETIME_END]: dateInactive,
      [DATETIME_START]: dateActive,
      [DESCRIPTION]: availableWork,
      [NAME]: worksiteName
    } = getEntityProperties(worksite, [DATETIME_END, DATETIME_START, DESCRIPTION, NAME]);

    const dates :Map = Map({
      dateFirstActive: formatAsDate(dateActive),
      dateInactive: formatAsDate(dateInactive),
    });

    const contact :Map = Map({
      contactName: '----',
      contactPhone: '----',
      contactEmail: '----',
      address: '----',
    });

    const status = getWorksiteStatus(dateActive, dateInactive);
    const worksiteInfo :Map = Map({
      holidays: '----',
      availableWork,
      status,
    });

    const tableHeaders = getWeekdayTableHeaders();

    return (
      <ContainerOuterWrapper>
        <ContainerInnerWrapper style={{ padding: '0' }}>
          <div>
            <BackNavButton
                onClick={this.goToOrganizations}>
              Back to Organizations
            </BackNavButton>
          </div>
          <HeaderRowWrapper>
            <ProfileNameHeader>{ worksiteName }</ProfileNameHeader>
            <EditButton onClick={this.goToEditWorksiteInfoForm}>Edit</EditButton>
          </HeaderRowWrapper>
          <Card>
            <CardSegment padding="md">
              <DataGrid
                  columns={2}
                  data={dates}
                  labelMap={datesLabelMap} />
            </CardSegment>
            <CardSegment padding="md">
              <DataGrid
                  columns={4}
                  data={contact}
                  labelMap={contactLabelMap} />
            </CardSegment>
            <CardSegment padding="md">
              <DataGrid
                  columns={4}
                  data={worksiteInfo}
                  labelMap={worksiteInfoLabelMap} />
            </CardSegment>
          </Card>
          <HeaderRowWrapper>
            <ProfileNameHeader>Hours of Operation</ProfileNameHeader>
            <EditButton>Edit</EditButton>
          </HeaderRowWrapper>
          <Card>
            <Table
                headers={tableHeaders}
                isLoading={false} />
          </Card>
        </ContainerInnerWrapper>
      </ContainerOuterWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  const app = state.get(STATE.APP);
  const worksites = state.get(STATE.WORKSITES);
  return ({
    app,
    getWorksiteRequestState: worksites.getIn([ACTIONS, GET_WORKSITE, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [WORKSITE]: worksites.get(WORKSITE),
  });
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getWorksite,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(WorksiteProfile);
