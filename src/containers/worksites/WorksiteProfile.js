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
import {
  ADDRESS_FQNS,
  APP_TYPE_FQNS,
  CONTACT_INFO_FQNS,
  WORKSITE_FQNS,
} from '../../core/edm/constants/FullyQualifiedNames';
import { APP, STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';
import { getEntityProperties, getPersonFullName } from '../../utils/DataUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getWeekdayTableHeaders, getWorksiteStatus } from './WorksitesUtils';
import {
  ContainerHeader,
  ContainerInnerWrapper,
  ContainerOuterWrapper,
} from '../../components/Layout';
import { BackNavButton } from '../../components/controls/index';
import { EMPTY_FIELD } from '../participants/ParticipantsConstants';
import { OL } from '../../core/style/Colors';
import * as Routes from '../../core/router/Routes';

const { FULL_ADDRESS } = ADDRESS_FQNS;
const { EMAIL, PHONE_NUMBER } = CONTACT_INFO_FQNS;
const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  NAME,
} = WORKSITE_FQNS;
const {
  ACTIONS,
  CONTACT_EMAIL,
  CONTACT_PERSON,
  CONTACT_PHONE,
  GET_WORKSITE,
  REQUEST_STATE,
  WORKSITE,
  WORKSITE_ADDRESS,
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

/* consts */
const cardSegmentPadding = '30px 30px';

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
  contactEmail :Map;
  contactPerson :Map;
  contactPhone :Map;
  getWorksiteRequestState :RequestState;
  initializeAppRequestState :RequestState;
  match :Match;
  worksite :Map;
  worksiteAddress :Map;
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
      contactEmail,
      contactPerson,
      contactPhone,
      getWorksiteRequestState,
      initializeAppRequestState,
      worksite,
      worksiteAddress,
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
    const fullName = getPersonFullName(contactPerson);
    const { [PHONE_NUMBER]: phoneNumber } = getEntityProperties(contactPhone, [PHONE_NUMBER]);
    const { [EMAIL]: email } = getEntityProperties(contactEmail, [EMAIL]);
    const { [FULL_ADDRESS]: address } = getEntityProperties(worksiteAddress, [FULL_ADDRESS]);

    const dates :Map = Map({
      dateFirstActive: formatAsDate(dateActive),
      dateInactive: formatAsDate(dateInactive),
    });

    const contact :Map = Map({
      contactName: fullName,
      contactPhone: phoneNumber || EMPTY_FIELD,
      contactEmail: email || EMPTY_FIELD,
      address: address || EMPTY_FIELD,
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
            <CardSegment padding={cardSegmentPadding}>
              <DataGrid
                  columns={4}
                  data={dates}
                  labelMap={datesLabelMap} />
            </CardSegment>
            <CardSegment padding={cardSegmentPadding}>
              <DataGrid
                  columns={4}
                  data={contact}
                  labelMap={contactLabelMap} />
            </CardSegment>
            <CardSegment padding={cardSegmentPadding}>
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
    [CONTACT_EMAIL]: worksites.get(CONTACT_EMAIL),
    [CONTACT_PERSON]: worksites.get(CONTACT_PERSON),
    [CONTACT_PHONE]: worksites.get(CONTACT_PHONE),
    getWorksiteRequestState: worksites.getIn([ACTIONS, GET_WORKSITE, REQUEST_STATE]),
    initializeAppRequestState: app.getIn([APP.ACTIONS, APP.INITIALIZE_APPLICATION, APP.REQUEST_STATE]),
    [WORKSITE]: worksites.get(WORKSITE),
    [WORKSITE_ADDRESS]: worksites.get(WORKSITE_ADDRESS),
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
