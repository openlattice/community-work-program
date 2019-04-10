// @flow
import React, { Component } from 'react';
import { List, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import type { Match, RouterHistory } from 'react-router';

import DigestedWarningsViolationsContainer from './DigestedWarningsViolationsContainer';
import NotesContainer from './NotesContainer';
import FetchStates from '../../utils/constants/FetchStates';
import SubmitStates from '../../utils/constants/SubmitStates';
import type { FetchState } from '../../utils/constants/FetchStates';
import type { SubmitState } from '../../utils/constants/SubmitStates';
import {
  getWarningsViolationsList,
  getWarningsViolationsNote,
} from '../participant/ParticipantActions';

type Props = {
  actions :Object;
  noteData :Map;
  entityKeyIdMap :Map;
  fetchStateNote :FetchState;
  fetchStateOptions :FetchState;
  history :RouterHistory;
  match :Match;
  options :List;
  submitState :SubmitState;
}

class WarningsViolationsContainer extends Component<Props> {

  handleAddNewNote = () => {
  }

  render() {
    const {
      actions,
      ...rest
    } = this.props;
    return (
      <NotesContainer
          digestedComponent={DigestedWarningsViolationsContainer}
          getNotes={actions.getWarningsViolationsNote}
          getNotesList={actions.getWarningsViolationsList}
          handleAddNewNote={this.handleAddNewNote}
          {...rest} />
    );
  }
}

const mapStateToProps = state => ({
  noteData: state.getIn(['person', 'note', 'data'], Map()),
  fetchStateNote: state.getIn(['person', 'note', 'fetchState'], FetchStates.PRE_FETCH),
  fetchStateOptions: state.getIn(['person', 'options', 'fetchState'], FetchStates.PRE_FETCH),
  options: state.getIn(['person', 'options', 'data'], List()),
  submitState: state.getIn(['person', 'submitState'], SubmitStates.PRE_SUBMIT),
});

const mapDispatchToProps = (dispatch :Dispatch<*>) => ({
  actions: bindActionCreators({
    getWarningsViolationsList,
    getWarningsViolationsNote,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(WarningsViolationsContainer);
