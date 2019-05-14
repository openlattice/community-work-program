// @flow
import React, { Component } from 'react';
import type { StatelessFunctionalComponent } from 'react';
import { connect } from 'react-redux';
import { fromJS, Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';

import EditModalFooter from './EditModalFooter';
import SubmitStates from '../../utils/constants/SubmitStates';
import type { SubmitState } from '../../utils/constants/SubmitStates';

type Props = {
  body :StatelessFunctionalComponent<*>;
  edm :Map;
  formData :Map;
  isVisible :boolean;
  onClose :() => void;
  person :Map;
  submitState :SubmitState;
  textPrimary :string;
  textTitle :string;
};

type State = {
  data :Map;
  originalData :Map;
};

class EditModal extends Component<Props, State> {
  submitButtonRef :{ current :null | HTMLButtonElement } = React.createRef();

  constructor(props :Props) {
    super(props);
    this.state = {
      data: props.formData,
      originalData: props.formData,
    };
  }

  componentDidUpdate(prevProps :Props) {
    const { formData, submitState, onClose } = this.props;
    const { formData: prevFormData, submitState: prevSubmitState } = prevProps;

    if (!formData.equals(prevFormData)) {
      this.setStateDataDefaults();
    }

    if (
      prevSubmitState !== submitState
      && submitState === SubmitStates.SUBMIT_SUCCESS
    ) {
      onClose();
    }
  }

  setStateDataDefaults = () => {
    const { formData } = this.props;
    this.setState({
      data: formData,
      originalData: formData
    });
  }

  resetState = () => {
    this.setState({
      data: Map(),
      originalData: Map()
    });
  }

  onClickPrimary = () => {
    if (this.submitButtonRef) {
      const { current } = this.submitButtonRef;
      if (current) {
        current.click();
      }
    }
  }

  onSubmit = () => {
  }

  onChange = ({ formData } :Object) => {
    const { data } = this.state;
    const newDataImmutable = fromJS(formData);
    if (!data.equals(newDataImmutable)) {
      this.setState({ data: newDataImmutable });
    }
  }

  renderFooter = ({ textPrimary, onClickPrimary }) => {
    const { submitState } = this.props;
    return (
      <EditModalFooter
          onClick={onClickPrimary}
          submitState={submitState}
          textPrimary={textPrimary} />
    );
  }

  render() {
    const {
      body,
      formData,
      ...rest
    } = this.props;
    const { data } = this.state;
    const ModalBody :StatelessFunctionalComponent<*> = body;
    return (
      <Modal
          onClickPrimary={this.onClickPrimary}
          shouldCloseOnOutsideClick={false}
          withFooter={this.renderFooter}
          {...rest}>
        <ModalBody />
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  edm: state.get('edm')
});

// $FlowFixMe
export default connect(mapStateToProps)(EditModal);
