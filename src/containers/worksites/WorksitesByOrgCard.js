// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Badge,
  Button,
  Card,
  CardSegment
} from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AddWorksiteModal from './AddWorksiteModal';
import WorksitesHeaderRow from '../../components/table/WorksitesHeaderRow';
import TableHeadCell from '../../components/table/TableHeadCell';
import WorksitesTableRow from '../../components/table/WorksitesTableRow';

import * as Routes from '../../core/router/Routes';
import { goToRoute } from '../../core/router/RoutingActions';
import { CustomTable, TableCell } from '../../components/table/styled/index';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { generateTableHeaders } from '../../utils/FormattingUtils';
import { isDefined } from '../../utils/LangUtils';
import { WORKSITE_INFO_CONSTS } from './WorksitesConstants';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../core/style/Colors';
import type { GoToRoute } from '../../core/router/RoutingActions';

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

const OrgCard = styled(Card)`
  padding: 10px 20px;

  & > ${CardSegment} {
    border: none;
  }

  & > ${CardSegment}:first-child {
    justify-content: center;
  }

  & > ${CardSegment}:last-child {
    margin: 0 -20px 0 -20px;
    padding: 0;
  }
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
  color: ${OL.GREY15};
  font-weight: 600;
  font-size: 20px;
  margin-right: 10px;
`;

const Description = styled.div`
  color: ${OL.GREY15};
  font-size: 14px;
`;

const StyledButton = styled(Button)`
  font-size: 13px;
  padding: 6px 12px;
`;

const WorksitesCell = styled(TableCell)`
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
      <OrgCard>
        <CardSegment vertical padding="md">
          <TitleRowWrapper>
            <OrgHeaderWrapper>
              <OrganizationName>
                { orgName }
              </OrganizationName>
              <Badge mode="primary" count={worksiteCount} />
            </OrgHeaderWrapper>
            <StyledButton onClick={this.handleShowAddWorksite}>Add Work Site</StyledButton>
          </TitleRowWrapper>
        </CardSegment>
        <CardSegment padding="md">
          <Description>{ orgDescription }</Description>
        </CardSegment>
        <CardSegment>
          {
            worksitesTableData.length > 0 && (
              <CustomTable
                  components={{
                    Cell: WorksitesCell,
                    HeadCell: TableHeadCell,
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
      </OrgCard>
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
