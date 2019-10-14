// @flow

import React, { Component } from 'react';
import type { Element } from 'react';
import styled from 'styled-components';
import {
  Card,
  CardSegment,
  DataGrid,
  EditButton,
  IconButton,
  Label,
} from 'lattice-ui-kit';
import {
  fromJS,
  List,
  Map,
  OrderedMap
} from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/pro-regular-svg-icons';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { RequestSequence } from 'redux-reqseq';

import * as Routes from '../../../core/router/Routes';
import { goToRoute } from '../../../core/router/RoutingActions';
import { getEntityKeyId, getEntityProperties } from '../../../utils/DataUtils';
import { formatAsDate, formatAsTime } from '../../../utils/DateTimeUtils';
import {
  APP_TYPE_FQNS,
  DATETIME_COMPLETED,
  ENROLLMENT_STATUS_FQNS,
  INFRACTION_FQNS,
  INFRACTION_EVENT_FQNS,
  WORKSITE_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';
import { EMPTY_FIELD } from '../../participants/ParticipantsConstants';
import { OL } from '../../../core/style/Colors';

const { WORKSITE_PLAN } = APP_TYPE_FQNS;
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { CATEGORY } = INFRACTION_FQNS;
const { NOTES, TYPE } = INFRACTION_EVENT_FQNS;
const { NAME } = WORKSITE_FQNS;

const labelMap :OrderedMap = OrderedMap({
  infractionType: 'Infraction type',
  category: 'Infraction category',
  worksiteName: 'Work Site, if applicable',
  date: 'Date',
  time: 'Time',
  status: 'Resulting enrollment status, if any',
});

const NotesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 0 10px;
  height: 40px;
  align-self: center;
`;

type Props = {
  actions:{
    goToRoute :RequestSequence;
  };
  controls :Element<*>;
  infraction :Map;
  infractionInfo :Map;
  participant :Map;
  worksitesByWorksitePlan :Map;
};

class InfractionDisplay extends Component<Props> {

  goToPrintInfraction = () => {
    const { actions, infraction, participant } = this.props;
    const personEKID :UUID = getEntityKeyId(participant);
    const infractionEventEKID :UUID = getEntityKeyId(infraction);
    actions.goToRoute(Routes.PRINT_INFRACTION
      .replace(':subjectId', personEKID)
      .replace(':infractionId', infractionEventEKID));
  }

  render() {
    const {
      controls,
      infraction,
      infractionInfo,
      worksitesByWorksitePlan,
    } = this.props;
    const {
      [DATETIME_COMPLETED]: infractionDateTime,
      [NOTES]: infractionNotes,
      [TYPE]: infractionType
    } = getEntityProperties(infraction, [DATETIME_COMPLETED, NOTES, TYPE]);
    const date :string = infractionDateTime ? formatAsDate(infractionDateTime) : EMPTY_FIELD;
    const time :string = infractionDateTime ? formatAsTime(infractionDateTime) : EMPTY_FIELD;
    const notes :string = !infractionNotes ? EMPTY_FIELD : infractionNotes;

    const infractionCategory :string = infractionInfo ? infractionInfo.get(CATEGORY, '') : '';
    const category = !infractionCategory ? EMPTY_FIELD : infractionCategory;

    const worksiteEntity :Map = infractionInfo ? worksitesByWorksitePlan.get(infractionInfo.get(WORKSITE_PLAN)) : Map();
    let { [NAME]: worksiteName } = getEntityProperties(worksiteEntity, [NAME]);
    worksiteName = !worksiteName ? EMPTY_FIELD : worksiteName;
    const status :string = infractionInfo.get(STATUS, EMPTY_FIELD) || EMPTY_FIELD;
    const data :List = fromJS({
      category,
      date,
      infractionType,
      status,
      time,
      worksiteName,
    });

    return (
      <Card>
        { controls }
        <CardSegment padding="sm" vertical>
          <DataGrid
              columns={3}
              data={data}
              labelMap={labelMap} />
          <BottomRow>
            <NotesWrapper>
              <Label subtle>Notes</Label>
              <span>{ notes }</span>
            </NotesWrapper>
            <ButtonsWrapper>
              <IconButton
                  icon={<FontAwesomeIcon icon={faPrint} color={OL.GREY02} />}
                  onClick={this.goToPrintInfraction} />
              <EditButton />
            </ButtonsWrapper>
          </BottomRow>
        </CardSegment>
      </Card>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(InfractionDisplay);
