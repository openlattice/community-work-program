// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
// import type { Match, RouterHistory } from 'react-router';
// import { bindActionCreators, type Dispatch } from 'redux';

import LogoLoader from '../../components/LogoLoader';
import SubmitStates from '../../utils/constants/SubmitStates';

import type { SubmitState } from '../../utils/constants/SubmitStates';
import { OL } from '../../utils/constants/Colors';
import { EditButton } from '../../components/controls/index';

// styled components

const NoteWrapper = styled.div`
  margin-top: 20px;
  padding: 40px;
  background-color: ${OL.WHITE};
  border: 1px solid ${OL.GREY08};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const InfoWrapper = styled.div`
  width: 100%;
  display: flex;
  margin: 15px 0;
  justify-content: flex-start;
  align-items: center;
`;

const InfoBlock = styled.span`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  margin-right: 150px;

  :last-of-type {
    margin-right: none;
  }
`;

const Title = styled.div`
  display: flex;
  justify-content: flex-start;
  color: ${OL.GREY02};
  font-weight: 600;
  margin: 5px 0;
`;

const Data = styled.div`
  display: flex;
  justify-content: flex-start;
  color: ${(props) => {
    if (props.level) {
      return props.level === 'Warning' ? OL.YELLOW01 : OL.RED01;
    }
    return OL.GREY15;
  }};
`;

const EditButtonWrapper = styled.span`
  display: flex;
  justify-self: flex-end;
  align-self: flex-start;
  margin-left: 60px;
`;

type Props = {
  actions :{
    editAction :RequestSequence;
  };
  // edm :Map;
  // entityKeyIdMap :Map;
  // history :RouterHistory;
  // match :Match;
  violationData :Map;
  submitState :SubmitState;
};

class DigestedWarningsViolationsContainer extends Component<Props> {

  formRef = React.createRef();

  renderDigested = () => {
    const { violationData } = this.props;
    if (violationData === undefined) {
      return (
        <LogoLoader
            loadingText="Searching..."
            size={30} />
      );
    }
    const date = violationData.get('datetime').split('T')[0];
    const time = violationData.get('datetime').split('T')[1].slice(0, 5);
    return (
      <NoteWrapper>
        <InfoWrapper>
          <InfoBlock>
            <Title>Report Level</Title>
            <Data level={violationData.get('level')}>{violationData.get('level')}</Data>
          </InfoBlock>
          <InfoBlock>
            <Title>Worksite</Title>
            <Data>{violationData.get('worksite')}</Data>
          </InfoBlock>
          <InfoBlock>
            <Title>Case Number</Title>
            <Data>1234567890123456</Data>
          </InfoBlock>
          <EditButtonWrapper>
            <EditButton>Edit</EditButton>
          </EditButtonWrapper>
        </InfoWrapper>
        <InfoWrapper>
          <InfoBlock>
            <Title>Date</Title>
            <Data>{date}</Data>
          </InfoBlock>
          <InfoBlock>
            <Title>Time</Title>
            <Data>{time}</Data>
          </InfoBlock>
        </InfoWrapper>
        <InfoWrapper>
          <InfoBlock>
            <Title>Description of Incident</Title>
            <Data>{violationData.get('description')}</Data>
          </InfoBlock>
        </InfoWrapper>
      </NoteWrapper>
    );
  }

  render() {
    return (
      <div ref={this.formRef}>
        { this.renderDigested() }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  // edm: state.get('edm'),
  // entityKeyIdMap: state.getIn(['counselingProgress', 'note', 'entityKeyIdMap'], Map()),
  violationData: state.getIn(['person', 'note', 'data'], Map()),
  submitState: state.getIn(['person', 'submitState'], SubmitStates.PRE_SUBMIT)
});

// const mapDispatchToProps = (dispatch :Dispatch<*>) => ({
//   actions: bindActionCreators({
//     editAction: update
//   }, dispatch)
// });

export default connect(mapStateToProps)(DigestedWarningsViolationsContainer);
