// @flow

import React from 'react';
import type { Element } from 'react';
import styled from 'styled-components';
import {
  Card,
  CardSegment,
  DataGrid,
  Label,
} from 'lattice-ui-kit';
import {
  fromJS,
  List,
  Map,
  OrderedMap
} from 'immutable';

import { getEntityProperties } from '../../../utils/DataUtils';
import { formatAsDate, formatAsTime } from '../../../utils/DateTimeUtils';
import {
  APP_TYPE_FQNS,
  DATETIME_COMPLETED,
  ENROLLMENT_STATUS_FQNS,
  INFRACTION_FQNS,
  INFRACTION_EVENT_FQNS,
  WORKSITE_FQNS,
} from '../../../core/edm/constants/FullyQualifiedNames';

const { WORKSITE_PLAN } = APP_TYPE_FQNS;
const { STATUS } = ENROLLMENT_STATUS_FQNS;
const { CATEGORY } = INFRACTION_FQNS;
const { NOTES, TYPE } = INFRACTION_EVENT_FQNS;
const { NAME } = WORKSITE_FQNS;

const NotesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;
`;

type Props = {
  actions :Element<*>;
  infraction :Map;
  infractionInfo :Map;
  worksitesByWorksitePlan :Map;
};

const DigestedInfractionsContainer = ({
  actions,
  infraction,
  infractionInfo,
  worksitesByWorksitePlan,
} :Props) => {

  const {
    [DATETIME_COMPLETED]: infractionDateTime,
    [NOTES]: infractionNotes,
    [TYPE]: infractionType
  } = getEntityProperties(infraction, [DATETIME_COMPLETED, NOTES, TYPE]);
  const date :string = formatAsDate(infractionDateTime);
  const time :string = formatAsTime(infractionDateTime);

  const violationCategory :string = infractionInfo.get(CATEGORY, '');
  const worksiteEntity :Map = worksitesByWorksitePlan.get(infractionInfo.get(WORKSITE_PLAN));
  const { [NAME]: worksiteName } = getEntityProperties(worksiteEntity, [NAME]);
  const status :string = infractionInfo.get(STATUS, '');

  const labelMap :OrderedMap = OrderedMap({
    infractionType: 'Infraction type',
    violationCategory: 'Violation category, if applicable',
    worksiteName: 'Work Site, if applicable',
    date: 'Date',
    time: 'Time',
    status: 'Resulting enrollment status, if any',
  });
  const data :List = fromJS({
    date,
    infractionType,
    status,
    time,
    violationCategory,
    worksiteName,
  });

  return (
    <Card>
      { actions }
      <CardSegment padding="sm" vertical>
        <DataGrid
            columns={3}
            data={data}
            labelMap={labelMap} />
        <NotesWrapper>
          <Label subtle>Notes</Label>
          <span>{ infractionNotes }</span>
        </NotesWrapper>
      </CardSegment>
    </Card>
  );
};

// $FlowFixMe
export default DigestedInfractionsContainer;
