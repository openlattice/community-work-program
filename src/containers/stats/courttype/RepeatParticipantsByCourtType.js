// @flow
import React, { useEffect } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Card,
  CardSegment,
  ExpansionPanel,
  ExpansionPanelDetails,
  Spinner,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import type { RequestState } from 'redux-reqseq';

import { GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE, getRepeatParticipantsByCourtType } from './CourtTypeActions';

import { TableHeader, TableName } from '../../../components/table/styled/index';
import { SHARED, STATE, STATS } from '../../../utils/constants/ReduxStateConsts';
import {
  SpinnerWrapper,
  StyledExpansionPanelSummary,
  expandIcon,
} from '../styled/ExpansionStyles';

const { REPEAT_PARTICIPANT_COUNTS_BY_COURT_TYPE } = STATS;
const { ACTIONS } = SHARED;
const { isPending } = ReduxUtils;

const Header = styled(TableHeader)`
  justify-content: space-between;
  padding-bottom: 20px;
`;

const SmallerTableName = styled(TableName)`
  font-size: 20px;
`;

const RepeatParticipantsByCourtType = () => {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getRepeatParticipantsByCourtType());
  }, [dispatch]);

  const repeatParticipantCountsByCourtType = useSelector((store) => store
    .getIn([STATE.STATS, REPEAT_PARTICIPANT_COUNTS_BY_COURT_TYPE]));

  const fetchRequestState :?RequestState = useRequestState([
    STATE.STATS,
    ACTIONS,
    GET_REPEAT_PARTICIPANTS_BY_COURT_TYPE
  ]);

  const courtTypes = repeatParticipantCountsByCourtType
    .filter((repeatParticipantMap :Map, courtType :string) => courtType !== '')
    .keySeq()
    .toList()
    .sort();

  return (
    <div>
      <Card>
        <Header padding="40px" vertical={false}>
          <SmallerTableName>
            Repeat Enrollment Counts By Court Type
          </SmallerTableName>
        </Header>
      </Card>
      <div>
        {
          isPending(fetchRequestState)
            ? (
              <SpinnerWrapper>
                <Spinner size="2x" />
              </SpinnerWrapper>
            )
            : (
              courtTypes.map((courtType :string) => {
                const repeatParticipantMap :Map = repeatParticipantCountsByCourtType.get(courtType);
                const enrollmentCountList = repeatParticipantMap.keySeq().toList().sort();
                return (
                  <ExpansionPanel key={courtType}>
                    <StyledExpansionPanelSummary expandIcon={expandIcon}>
                      <Typography variant="body2">{courtType}</Typography>
                    </StyledExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <CardSegment padding="0">
                        {
                          enrollmentCountList.map((enrollmentCount :number) => {
                            const frequency = repeatParticipantMap.get(enrollmentCount);
                            return (
                              <div key={`${enrollmentCount}-${frequency}`}>
                                {`${frequency} ${frequency === 1 ? 'person' : 'people'}
                                 returned ${enrollmentCount} times`}
                              </div>
                            );
                          })
                        }
                      </CardSegment>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                );
              })
            )
        }
      </div>
    </div>
  );
};

export default RepeatParticipantsByCourtType;
