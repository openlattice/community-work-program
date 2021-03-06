/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Badge,
  Button,
  Card,
  CardSegment,
  Colors,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { UUID } from 'lattice';

import AddWorksiteModal from './AddWorksiteModal';
import { WORKSITE_INFO_CONSTS } from './WorksitesConstants';

import WorksitesHeaderRow from '../../components/table/WorksitesHeaderRow';
import WorksitesTableRow from '../../components/table/WorksitesTableRow';
import * as Routes from '../../core/router/Routes';
import { CustomTable, TableCell } from '../../components/table/styled/index';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { goToRoute } from '../../core/router/RoutingActions';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { generateTableHeaders } from '../../utils/FormattingUtils';
import { isDefined } from '../../utils/LangUtils';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { NEUTRAL } = Colors;
const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  NAME,
  ORGANIZATION_NAME,
} = PROPERTY_TYPE_FQNS;
const { PAST, SCHEDULED, TOTAL_HOURS } = WORKSITE_INFO_CONSTS;

const WORKSITES_COLUMNS = [
  'WORK SITE NAME',
  'STATUS',
  'START DATE',
  'SCHED. PARTIC.',
  'PAST PARTIC.',
  'TOTAL HOURS'
];

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
`;

const TitleRowWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const OrgHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const OrganizationName = styled.h1`
  color: ${NEUTRAL.N800};
  font-weight: 600;
  font-size: 20px;
  margin-right: 10px;
`;

const Description = styled.div`
  color: ${NEUTRAL.N800};
  font-size: 14px;
`;

const StyledButton = styled(Button)`
  font-size: 14px;
  padding: 6px 12px;
`;

const WorksitesHeadCell = styled(TableCell)`
  :first-child {
    padding-left: 50px;
    width: 300px;
    white-space: normal;
  }

  :last-child {
    padding-right: 50px;
  }
`;

const WorksitesCell = styled(WorksitesHeadCell)`
  font-size: 14px;
`;

type Props = {
  actions:{
    goToRoute :GoToRoute;
  };
  organization :Map;
  worksiteCount :string;
  worksites :List;
  worksitesInfo :Map;
};

type State = {
  showAddWorksite :boolean;
};

class WorksitesByOrgCard extends Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      showAddWorksite: false,
    };
  }

  handleShowAddWorksite = () => {
    this.setState({
      showAddWorksite: true
    });
  }

  handleHideAddWorksite = () => {
    this.setState({
      showAddWorksite: false
    });
  }

  goToWorksiteProfile = (worksite :Map) => {
    const { actions } = this.props;
    const worksiteEKID :UUID = getEntityKeyId(worksite);
    actions.goToRoute(Routes.WORKSITE_PROFILE.replace(':worksiteId', worksiteEKID));
  }

  aggregateWorksiteData = () => {
    const { worksites, worksitesInfo } = this.props;

    const data :Object[] = [];
    if (isDefined(worksites) && !worksites.isEmpty()) {
      worksites.forEach((worksite :Map) => {

        const worksiteEKID :UUID = getEntityKeyId(worksite);
        const worksiteInfo :Map = worksitesInfo.get(worksiteEKID, Map());
        const {
          [DATETIME_END]: endDateTime,
          [DATETIME_START]: startDateTime,
          [NAME]: worksiteName
        } = getEntityProperties(worksite, [DATETIME_END, DATETIME_START, NAME]);
        const startDate = formatAsDate(startDateTime);
        const status = (startDateTime && !endDateTime) ? 'Active' : 'Inactive';
        const scheduledParticipantCount = worksiteInfo.get(SCHEDULED, 0);
        const pastParticipantCount = worksiteInfo.get(PAST, 0);
        const totalHours = worksiteInfo.get(TOTAL_HOURS, 0);

        const personRow :Object = {
          [WORKSITES_COLUMNS[0]]: worksiteName,
          [WORKSITES_COLUMNS[1]]: status,
          [WORKSITES_COLUMNS[2]]: startDate,
          [WORKSITES_COLUMNS[3]]: scheduledParticipantCount,
          [WORKSITES_COLUMNS[4]]: pastParticipantCount,
          [WORKSITES_COLUMNS[5]]: totalHours,
          id: worksiteEKID,
        };
        data.push(personRow);
      });
    }
    return data;
  }

  render() {
    const { organization, worksiteCount } = this.props;
    const { showAddWorksite } = this.state;

    const {
      [DESCRIPTION]: orgDescription,
      [ORGANIZATION_NAME]: orgName
    } = getEntityProperties(organization, [DESCRIPTION, ORGANIZATION_NAME]);

    const worksitesTableData :Object[] = this.aggregateWorksiteData();
    const worksitesTableHeaders :Object[] = generateTableHeaders(WORKSITES_COLUMNS);

    return (
      <Card>
        <CardSegment padding="0">
          <TextWrapper>
            <TitleRowWrapper>
              <OrgHeaderWrapper>
                <OrganizationName>
                  { orgName }
                </OrganizationName>
                <Badge mode="primary" count={worksiteCount} />
              </OrgHeaderWrapper>
              <StyledButton onClick={this.handleShowAddWorksite}>Add Work Site</StyledButton>
            </TitleRowWrapper>
            <Description>{ orgDescription }</Description>
          </TextWrapper>
          {
            worksitesTableData.length > 0 && (
              <CustomTable
                  components={{
                    Cell: WorksitesCell,
                    HeadCell: WorksitesHeadCell,
                    Header: WorksitesHeaderRow,
                    Row: WorksitesTableRow
                  }}
                  data={worksitesTableData}
                  headers={worksitesTableHeaders}
                  isLoading={false} />
            )
          }
        </CardSegment>
        <AddWorksiteModal
            isOpen={showAddWorksite}
            onClose={this.handleHideAddWorksite}
            organization={organization} />
      </Card>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(WorksitesByOrgCard);
