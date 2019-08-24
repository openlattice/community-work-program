// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { fromJS, Map, OrderedMap } from 'immutable';
import { DateTime } from 'luxon';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

import { formatAsDate } from '../../utils/DateTimeUtils';
import { EMPTY_FIELD } from '../../containers/participants/ParticipantsConstants';

const labelMap :OrderedMap = OrderedMap({
  sentenceDate: 'Sentence date',
  checkInDeadline: 'Check-in deadline',
  checkedInDate: 'Date checked in',
  orientationDate: 'Orientation date',
  workStartDate: 'Started work',
  sentenceEndDate: 'Sentence end date',
});

const DatesWrapper = styled.div`
  width: 600px;
`;

type Props = {
  orientationDateTime :string;
  sentenceDateTime :string;
};

type State = {
  isEditDatesModalVisible :boolean;
};

class KeyDatesContainer extends Component<Props, State> {

  state = {
    isEditDatesModalVisible: false,
  };

  render() {

    const { orientationDateTime, sentenceDateTime } = this.props;

    const sentenceDate = sentenceDateTime ? formatAsDate(sentenceDateTime) : EMPTY_FIELD;
    const sentenceDateObj = DateTime.fromISO(sentenceDateTime);
    const checkInDeadline = sentenceDateObj.isValid
      ? sentenceDateObj.plus({ hours: 48 }).toLocaleString()
      : EMPTY_FIELD;
    const sentenceEndDate = sentenceDateObj.isValid
      ? sentenceDateObj.plus({ days: 90 }).toLocaleString()
      : EMPTY_FIELD;
    const orientationDateObj = DateTime.fromISO(orientationDateTime);
    const orientationDate = orientationDateObj.isValid
      ? orientationDateObj.toLocaleString(DateTime.DATE_SHORT)
      : EMPTY_FIELD;

    const data :Map = fromJS({
      sentenceDate,
      checkInDeadline,
      checkedInDate: EMPTY_FIELD,
      orientationDate,
      workStartDate: EMPTY_FIELD,
      sentenceEndDate,
    });
    return (
      <DatesWrapper>
        <Card>
          <CardSegment padding="lg" vertical>
            <DataGrid
                columns={3}
                data={data}
                labelMap={labelMap} />
          </CardSegment>
        </Card>
      </DatesWrapper>
    );
  }
}

export default KeyDatesContainer;
