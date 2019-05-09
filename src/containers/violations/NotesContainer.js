// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
// import { Constants } from 'lattice';
import { List, Map } from 'immutable';

import LogoLoader from '../../components/LogoLoader';
import NoInformation from '../../components/participant/NoInformation';
import FetchStates from '../../utils/constants/FetchStates';
import SubmitStates from '../../utils/constants/SubmitStates';

import { CardOuterWrapper } from '../../components/Layout';
import { StyledSelect } from '../../components/controls';
import { emotionStyles } from '../../components/controls/dropdowns/StyledSelect';
import type { FetchState } from '../../utils/constants/FetchStates';
import type { SubmitState } from '../../utils/constants/SubmitStates';
import { violations } from '../participants/FakeData';

// const { OPENLATTICE_ID_FQN } = Constants;

const NotesWrapper = styled.div`
  margin-top: 15px;
`;

const StyledOuterWrapper = styled(CardOuterWrapper)`
  margin: 20px 0;
  padding: 30px;
`;

type Props = {
  noteData :Map;
  digestedComponent :Class<React$Component<*, *>>;
  fetchStateNote :FetchState;
  fetchStateOptions :FetchState;
  getNotes :RequestSequence;
  getNotesList :RequestSequence;
  handleAddNewNote :() => void;
  options :List<Map>;
  submitState :SubmitState;
}

type State = {
  selectedNote ? :Object;
}

class NotesContainer extends Component<Props, State> {

  formRef = React.createRef();

  state = {
    selectedNote: undefined,
  }

  componentDidMount() {
    const { getNotesList } = this.props;
    getNotesList({ violations });
  }

  componentDidUpdate(prevProps :Props) {
    const {
      getNotesList,
      options,
      submitState
    } = this.props;
    const {
      options: prevOptions,
      submitState: prevSubmitState
    } = prevProps;

    if (options !== prevOptions && options.count() > 0) {
      this.handleOnSelectChange(options.first().toJS());
    }

    if (submitState !== prevSubmitState && submitState === SubmitStates.SUBMIT_SUCCESS) {
      getNotesList({ violations });
    }
  }

  handleOnSelectChange = (value :List) => {
    const { getNotes } = this.props;
    this.setState({
      selectedNote: value
    });
    getNotes(value);
  }

  onAddNoteClick = () => {
    const { handleAddNewNote } = this.props;
    handleAddNewNote();
  }

  renderNotes = () => {
    const {
      digestedComponent: DigestedComponent,
      fetchStateNote,
      fetchStateOptions,
      noteData,
    } = this.props;
    if (fetchStateNote === FetchStates.IS_FETCHING || fetchStateOptions === FetchStates.IS_FETCHING) {
      return (
        <StyledOuterWrapper>
          <LogoLoader
              loadingText="Searching..."
              size={30} />
        </StyledOuterWrapper>
      );
    }
    if (noteData.isEmpty()) {
      return (
        <StyledOuterWrapper>
          <NoInformation caption="No Warnings or Violations" />
        </StyledOuterWrapper>
      );
    }

    return (
      <DigestedComponent />
    );
  }

  render() {
    const {
      fetchStateOptions,
      options
    } = this.props;
    const { selectedNote } = this.state;
    return (
      <NotesWrapper>
        <StyledSelect
            isLoading={fetchStateOptions === FetchStates.IS_FETCHING}
            options={options.toJS()}
            value={selectedNote}
            onChange={this.handleOnSelectChange}
            styles={emotionStyles} />
        { this.renderNotes() }
      </NotesWrapper>
    );
  }
}

export default NotesContainer;
