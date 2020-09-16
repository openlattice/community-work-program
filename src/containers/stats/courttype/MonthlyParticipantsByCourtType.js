// @flow
import React, { useState } from 'react';

import { faSearch } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  ExpansionPanel,
  ExpansionPanelDetails,
  IconButton,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  DOWNLOAD_COURT_TYPE_DATA,
  GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE,
  downloadCourtTypeData,
  getMonthlyParticipantsByCourtType,
} from './CourtTypeActions';

import { requestIsPending } from '../../../utils/RequestStateUtils';
import { SHARED, STATE, STATS } from '../../../utils/constants/ReduxStateConsts';
import { MONTHS_OPTIONS, YEARS_OPTIONS } from '../consts/TimeConsts';
import {
  SpinnerWrapper,
  StyledExpansionPanelSummary,
  expandIcon,
} from '../styled/ExpansionStyles';
import {
  ActionsWrapper,
  GraphHeader,
  InnerHeaderRow,
  SelectsWrapper,
} from '../styled/GraphStyles';
import { formatParticipantsByCourtTypeDataForDownload } from '../utils/StatsUtils';

const { ACTIONS, REQUEST_STATE } = SHARED;
const { MONTHLY_PARTICIPANTS_BY_COURT_TYPE } = STATS;

type Props = {
  actions :{
    downloadCourtTypeData :RequestSequence;
    getMonthlyParticipantsByCourtType :RequestSequence;
  };
  monthlyParticipantsByCourtType :Map;
  requestStates :{
    DOWNLOAD_COURT_TYPE_DATA :RequestState;
    GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE :RequestState;
  };
};

const MonthlyParticipantsByCourtTypeList = ({ actions, monthlyParticipantsByCourtType, requestStates } :Props) => {
  const courtTypes :List = monthlyParticipantsByCourtType.keySeq().toList();

  const today :DateTime = DateTime.local();
  const [month, setMonth] = useState(MONTHS_OPTIONS[today.month - 1]);
  const currentYearOption :Object = YEARS_OPTIONS.find((obj) => obj.value === today.year);
  const [year, setYear] = useState(currentYearOption);

  const getNewData = () => {
    actions.getMonthlyParticipantsByCourtType({ month: month.value, year: year.value });
  };

  const downloadParticipantsByCourtType = () => {
    const formattedData :List = formatParticipantsByCourtTypeDataForDownload(monthlyParticipantsByCourtType);
    /* eslint-disable-next-line */
    const fileName :string = `CWP_Participant_Names_by_Court_Type_${MONTHS_OPTIONS[month.value - 1].label}_${year.value}`;
    actions.downloadCourtTypeData({
      courtTypeData: formattedData,
      fileName,
    });
  };

  return (
    <div>
      <Card>
        <GraphHeader>
          <InnerHeaderRow>
            <div>Participants by Court Type, Monthly</div>
            <Button
                isLoading={requestIsPending(requestStates[DOWNLOAD_COURT_TYPE_DATA])}
                onClick={downloadParticipantsByCourtType}>
              Download
            </Button>
          </InnerHeaderRow>
          <ActionsWrapper>
            <SelectsWrapper>
              <Select
                  name="month"
                  onChange={setMonth}
                  options={MONTHS_OPTIONS}
                  placeholder={MONTHS_OPTIONS[today.month - 1].label} />
              <Select
                  name="year"
                  onChange={setYear}
                  options={YEARS_OPTIONS}
                  placeholder={today.year} />
            </SelectsWrapper>
            <IconButton onClick={getNewData}>
              <FontAwesomeIcon icon={faSearch} />
            </IconButton>
          </ActionsWrapper>
        </GraphHeader>
      </Card>
      <div>
        {
          requestIsPending(requestStates[GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE])
            ? (
              <SpinnerWrapper>
                <Spinner size="2x" />
              </SpinnerWrapper>
            )
            : (
              courtTypes.map((courtTypeName :string) => {
                const participants :List = monthlyParticipantsByCourtType.get(courtTypeName, List())
                  .sort((participantMap1 :Map, participantMap2 :Map) => {
                    const participantName1 :string = participantMap1.get('personName').split(' ')[1];
                    const participantName2 :string = participantMap2.get('personName').split(' ')[1];
                    if (participantName1 < participantName2) return -1;
                    if (participantName1 > participantName2) return 1;
                    return 0;
                  });
                const title = `${courtTypeName} • ${participants.count()}`;
                return (
                  <ExpansionPanel key={courtTypeName}>
                    <StyledExpansionPanelSummary expandIcon={expandIcon}>
                      <div>{ title }</div>
                    </StyledExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <CardSegment padding="0">
                        { participants.map((participantMap :Map) => (
                          <div key={participantMap.get('personName')}>
                            { `${participantMap.get('personName')} • ${participantMap.get('hours')} hours` }
                          </div>
                        ))}
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

const mapStateToProps = (state :Map) => {
  const stats = state.get(STATE.STATS);
  return {
    [MONTHLY_PARTICIPANTS_BY_COURT_TYPE]: stats.get(MONTHLY_PARTICIPANTS_BY_COURT_TYPE),
    requestStates: {
      [DOWNLOAD_COURT_TYPE_DATA]: stats.getIn([ACTIONS, DOWNLOAD_COURT_TYPE_DATA, REQUEST_STATE]),
      [GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE]: stats
        .getIn([ACTIONS, GET_MONTHLY_PARTICIPANTS_BY_COURT_TYPE, REQUEST_STATE]),
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    downloadCourtTypeData,
    getMonthlyParticipantsByCourtType,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(MonthlyParticipantsByCourtTypeList);
