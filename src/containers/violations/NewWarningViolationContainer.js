// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';
import moment from 'moment';
import type { RouterHistory } from 'react-router';

import * as Routes from '../../core/router/Routes';
import { PARTICIPANT_PROFILE_WIDTH } from '../../core/style/Sizes';
import { OL } from '../../utils/constants/Colors';
import { emotionStyles } from '../../components/controls/dropdowns/StyledSelect';
import {
  BackNavButton,
  PrimaryButton,
  RadioWidget,
  StyledSelect,
  DateWidget,
  TimeWidget,
} from '../../components/controls/index';
import { worksites, caseNumbers } from '../participants/FakeData';
import { ISO_DATE_FORMAT, TIME_HM_FORMAT } from '../../utils/DateTimeUtils';

const FormWrapper = styled.div`
  width: ${PARTICIPANT_PROFILE_WIDTH}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: center;
  margin-top: 30px;
  position: relative;
`;

const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  width: 100%;
  margin-bottom: 30px;
`;

const NameRowWrapper = styled.div`
  margin: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NameHeader = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: ${OL.BLACK};
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin: 15px;
  background-color: ${OL.WHITE};
  border: 1px solid ${OL.GREY08};
  border-radius: 5px;
  padding: 40px 40px 40px 100px;
  min-height: 400px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 15px;
`;

const InfoBlock = styled.span`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  margin-right: 50px;

  :last-of-type {
    margin-right: none;
  }
`;

const Title = styled.div`
  display: flex;
  justify-content: flex-start;
  color: ${OL.GREY02};
  font-weight: 600;
  margin: 8px 0;
`;

const ActionWrapper = styled.div`
  /* position: fixed; */
  width: ${props => props.width}px;
  z-index: ${props => (props.zIndex ? props.zIndex : 200)};
`;

const TextArea = styled.textarea`
  width: 500px;
  padding: 20px;
  border: 1px solid ${OL.GREY08};
  border-radius: 5px;
  resize: none;

  &:focus {
    outline: 0;
    border-color: ${OL.PURPLE02};
  }
`;

const radioOptions = {
  enumOptions: [
    {
      value: 'Warning',
      label: 'Warning',
    },
    {
      value: 'Violation',
      label: 'Violation',
    },
  ],
  inline: true,
};

const defaultData = Map().withMutations((map :Map) => {
  map.set('reportLevel', undefined);
  map.set('worksite', undefined);
  map.set('caseNumber', undefined);
  map.set('datetime', undefined);
});

type Props = {
  history :RouterHistory;
  location :Object;
  person :Map;
};

type State = {
  formData :Map;
};

class NewWarningViolationContainer extends Component<Props, State> {
  constructor(props :Props) {
    super(props);

    this.state = {
      formData: defaultData,
    };
  }

  getSplitDateAndTime = () :State => {
    const { formData } = this.state;
    const date = moment(formData.get('datetime')).format(ISO_DATE_FORMAT);
    const time = moment(formData.get('datetime')).format(TIME_HM_FORMAT);
    return {
      date,
      time
    };
  }

  mergeDateWithTime = (date, time) => {
    let dateTime;

    if (date || time) {
      const dateValue = date || moment().format(ISO_DATE_FORMAT);
      const timeValue = time || moment().startOf('day').format(TIME_HM_FORMAT);
      dateTime = moment(`${dateValue} ${timeValue}`).toISOString(true);
    }
    return dateTime;
  }

  handleDateTimeChange = (value :string, type :string) => {
    let { formData } = this.state;
    const { date, time } = this.getSplitDateAndTime();
    let newDateTime;
    if (type === 'date') {
      newDateTime = this.mergeDateWithTime(value, time);
    }
    if (type === 'time') {
      newDateTime = this.mergeDateWithTime(date, value);
    }
    formData = formData.set('datetime', newDateTime);
    this.setState({ formData });
  }

  storeReportLevel = (value :string) => {
    let { formData } = this.state;
    formData = formData.set('reportLevel', value);
    this.setState({ formData });
  }

  render() {
    const { formData } = this.state;
    const { history, location } = this.props;
    const personId = location.pathname.split('/')[2];
    const { date, time } = this.getSplitDateAndTime();
    return (
      <FormWrapper>
        <BackNavButton
            onClick={() => {
              history.push(Routes.PARTICIPANT_PROFILE.replace(':subjectId', personId));
            }}>
          Back to Participant's Profile
        </BackNavButton>
        <FormBody>
          <NameRowWrapper>
            <NameHeader>Warning or Violation</NameHeader>
            <PrimaryButton>Submit Report</PrimaryButton>
          </NameRowWrapper>
          <InfoWrapper>
            <InfoRow>
              <InfoBlock>
                <Title>Report Level</Title>
                <RadioWidget
                    onChange={this.storeReportLevel}
                    options={radioOptions}
                    value={formData.get('reportLevel')} />
              </InfoBlock>
              <InfoBlock>
                <Title>Worksite</Title>
                <ActionWrapper width={200} zIndex={300}>
                  <StyledSelect
                      options={worksites}
                      styles={emotionStyles} />
                </ActionWrapper>
              </InfoBlock>
              <InfoBlock>
                <Title>Case Number</Title>
                <ActionWrapper width={200}>
                  <StyledSelect
                      options={caseNumbers}
                      styles={emotionStyles} />
                </ActionWrapper>
              </InfoBlock>
            </InfoRow>
            <InfoRow>
              <InfoBlock>
                <Title>Date of Incident</Title>
                <ActionWrapper width={300}>
                  <DateWidget
                      id="warningViolationDate"
                      onChange={this.handleDateTimeChange}
                      value={date} />
                </ActionWrapper>
              </InfoBlock>
              <InfoBlock>
                <Title>Time of Incident</Title>
                <ActionWrapper width={300}>
                  <TimeWidget
                      id="warningViolationTime"
                      onChange={this.handleDateTimeChange}
                      value={time} />
                </ActionWrapper>
              </InfoBlock>
            </InfoRow>
            <InfoRow>
              <InfoBlock>
                <Title>Description of Incident</Title>
                <TextArea />
              </InfoBlock>
            </InfoRow>
          </InfoWrapper>
        </FormBody>
      </FormWrapper>
    );
  }
}

export default NewWarningViolationContainer;
