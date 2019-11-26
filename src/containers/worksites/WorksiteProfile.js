// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map, OrderedMap } from 'immutable';
import {
  Card,
  CardSegment,
  DataGrid,
  EditButton,
  Label,
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
import { APP_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { APP, STATE, WORKSITES } from '../../utils/constants/ReduxStateConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { getPersonFullName } from '../../utils/PeopleUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { getWeekdayTableData, getWeekdayTableHeaders, getWorksiteStatus } from './WorksitesUtils';
import {
  ContainerHeader,
  ContainerInnerWrapper,
  ContainerOuterWrapper,
} from '../../components/Layout';
import { BackNavButton } from '../../components/controls/index';
import { EMPTY_FIELD } from '../participants/ParticipantsConstants';
import * as Routes from '../../core/router/Routes';

const { STAFF } = APP_TYPE_FQNS;
const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  EMAIL,
  FULL_ADDRESS,
  NAME,
  PHONE_NUMBER,
} = PROPERTY_TYPE_FQNS;
const {
  ACTIONS,
  GET_WORKSITE,
  REQUEST_STATE,
  SCHEDULE_BY_WEEKDAY,
  WORKSITE,
  WORKSITE_ADDRESS,
  WORKSITE_CONTACTS,
} = WORKSITES;

/* Label Maps */
const datesLabelMap :OrderedMap = OrderedMap({
  dateFirstActive: 'Date first active',
  dateInactive: 'Date marked inactive',
  address: 'Address'
});

const worksiteInfoLabelMap :OrderedMap = OrderedMap({
  availableWork: 'Available work',
  status: 'Status'
});

/* consts */
const cardSegmentPadding = '40px 40px';

/* styled components */
const WorksitetProfileWrapper = styled(ContainerOuterWrapper)`
  font-size: 13px;
`;

const ProfileNameHeader = styled(ContainerHeader)`
  margin: 30px 0;
`;

const HeaderRowWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const ContactLabelsRow = styled.div`
  display: grid;
  flex: 1;
  grid-auto-flow: row;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-gap: 20px 30px;
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
  scheduleByWeekday :Map;
  worksite :Map;
  worksiteAddress :Map;
  worksiteContacts :Map;
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
    if (worksiteEKID) {
      actions.goToRoute(Routes.EDIT_WORKSITE_PROFILE_INFO.replace(':worksiteId', worksiteEKID));
    }
  }

  goToEditHoursOfOperation = () => {
    const {
      actions,
      match: {
        params: { worksiteId: worksiteEKID }
      }
    } = this.props;
    if (worksiteEKID) {
      actions.goToRoute(Routes.EDIT_WORKSITE_HOURS.replace(':worksiteId', worksiteEKID));
    }
  }

  formatWorksiteContacts = () => {
    const { worksiteContacts } = this.props;

    const contacts :Object = {
      row0: []
    };

    if (!worksiteContacts.isEmpty()) {

      worksiteContacts.forEach((contactMap :Map, index :number) => {

        const person :Map = contactMap.get(STAFF, Map());
        const fullName :string = getPersonFullName(person);
        const contactPhone :Map = contactMap.get(PHONE_NUMBER, Map());
        const { [PHONE_NUMBER]: phoneNumber } = getEntityProperties(contactPhone, [PHONE_NUMBER]);
        const contactEmail :Map = contactMap.get(EMAIL, Map());
        const { [EMAIL]: email } = getEntityProperties(contactEmail, [EMAIL]);

        const contactArray :string[] = contacts[`row${index}`] || [];
        contactArray.push(fullName);
        contactArray.push(phoneNumber);
        contactArray.push(email);
        contacts[`row${index}`] = contactArray;
      });
    }
    else {
      contacts.row0 = [EMPTY_FIELD, EMPTY_FIELD, EMPTY_FIELD];
    }
    return contacts;
  }

  render() {
    const {
      getWorksiteRequestState,
      initializeAppRequestState,
      scheduleByWeekday,
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

    const { [FULL_ADDRESS]: address } = getEntityProperties(worksiteAddress, [FULL_ADDRESS]);
    const datesAndAddress :Map = Map({
      dateFirstActive: formatAsDate(dateActive),
      dateInactive: formatAsDate(dateInactive),
      address
    });

    const contacts :Object = this.formatWorksiteContacts();
    const contactsKeys :string[] = Object.keys(contacts);
    const contactsHeaders = ['Contact name', 'Contact Phone', 'Contact email'];

    const status = getWorksiteStatus(dateActive, dateInactive);
    const worksiteInfo :Map = Map({
      availableWork,
      status,
    });

    const tableHeaders = getWeekdayTableHeaders();
    const tableData = getWeekdayTableData(scheduleByWeekday);

    return (
      <WorksitetProfileWrapper>
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
                  data={datesAndAddress}
                  labelMap={datesLabelMap} />
            </CardSegment>
            <CardSegment padding={cardSegmentPadding} vertical>
              <ContactLabelsRow>
                {
                  contactsHeaders.map((label :string) => (
                    <Label key={label} subtle>{ label }</Label>
                  ))
                }
              </ContactLabelsRow>
              {
                contactsKeys.map((row :string) => {
                  const rowValues = contacts[row];
                  return (
                    <ContactLabelsRow key={row}>
                      {
                        rowValues.map((value :string, index :number) => (
                          <div key={`${contactsHeaders[index]}-${value}`}>{ value }</div>
                        ))
                      }
                    </ContactLabelsRow>
                  );
                })
              }
            </CardSegment>
            <CardSegment padding={cardSegmentPadding}>
              <DataGrid
                  columns={2}
                  data={worksiteInfo}
                  labelMap={worksiteInfoLabelMap} />
            </CardSegment>
          </Card>
          <HeaderRowWrapper>
            <ProfileNameHeader>Hours of Operation</ProfileNameHeader>
            <EditButton onClick={this.goToEditHoursOfOperation}>Edit</EditButton>
          </HeaderRowWrapper>
          <Card>
            <Table
                data={tableData}
                headers={tableHeaders}
                isLoading={false} />
          </Card>
        </ContainerInnerWrapper>
      </WorksitetProfileWrapper>
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
    [SCHEDULE_BY_WEEKDAY]: worksites.get(SCHEDULE_BY_WEEKDAY),
    [WORKSITE]: worksites.get(WORKSITE),
    [WORKSITE_ADDRESS]: worksites.get(WORKSITE_ADDRESS),
    [WORKSITE_CONTACTS]: worksites.get(WORKSITE_CONTACTS),
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    getWorksite,
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(WorksiteProfile);
