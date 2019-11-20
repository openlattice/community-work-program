// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button, Card, CardSegment } from 'lattice-ui-kit';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RequestSequence } from 'redux-reqseq';

import AddWorksiteModal from './AddWorksiteModal';
import TableHeaderRow from '../../components/table/WorksitesHeaderRow';
import TableHeadCell from '../../components/table/TableHeadCell';
import WorksitesTableRow from '../../components/table/WorksitesTableRow';

import { goToRoute } from '../../core/router/RoutingActions';
import { CustomTable, TableCell } from '../../components/table/styled/index';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { formatAsDate } from '../../utils/DateTimeUtils';
import { generateTableHeaders } from '../../utils/FormattingUtils';
import { isDefined } from '../../utils/LangUtils';
import { WORKSITE_INFO_CONSTS } from './WorksitesConstants';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { OL } from '../../core/style/Colors';
import * as Routes from '../../core/router/Routes';

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
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OrganizationName = styled.h1`
  color: ${OL.GREY15};
  font-weight: 600;
  font-size: 20px;

  &:hover {
    cursor: pointer;
    color: ${OL.PURPLE02};
  }

  &:active {
    color: ${OL.PURPLE01};
  }
`;

const Description = styled.div`
  color: ${OL.GREY15};
  font-size: 14px;
`;

const StyledButton = styled(Button)`
  font-size: 13px;
  padding: 6px 12px;
`;

type Props = {
  actions:{
    goToRoute :RequestSequence;
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
    const { organization } = this.props;
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
            <OrganizationName>
              { orgName }
            </OrganizationName>
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
                    Cell: TableCell,
                    HeadCell: TableHeadCell,
                    Header: TableHeaderRow,
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
