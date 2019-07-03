// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  CardSegment,
  DatePicker,
  Input,
  Label
} from 'lattice-ui-kit';

import { WORKSITE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { ButtonsWrapper } from '../../components/Layout';
import { OL } from '../../core/style/Colors';

const {
  DATETIME_END,
  DATETIME_START,
  DESCRIPTION,
  NAME,
} = WORKSITE_FQNS;

const FormRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ButtonsRow = styled(FormRow)`
  margin-top: 20px;
`;

const RowContent = styled.div`
  flex-grow: 1;
  margin: 0 20px 10px 20px;
  min-width: 250px;
`;

const StyledTextArea = styled.textarea`
  background-color: ${OL.GREY10};
  border-radius: 3px;
  border: 1px solid ${props => (props.invalid ? OL.RED01 : OL.GREY05)};
  box-shadow: 0;
  box-sizing: border-box;
  color: ${OL.GREY01};
  display: flex;
  flex: 0 1 auto;
  font-size: 14px;
  line-height: 18px;
  padding: 10px 10px;
  text-overflow: ellipsis;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  width: 100%;

  :hover {
    background-color: ${OL.GREY08};
  }
  :focus {
    border: solid 1px ${OL.PURPLE02};
    background-color: white;
    outline: none;
  }
  :disabled {
    background-color: ${OL.GREY10};
    color: ${OL.GREY02};
    cursor: not-allowed;
  }
`;

type Props = {
  onDiscard :() => void;
};
type State = {
  newWorksiteData :Map;
};

/*
{

}
*/
class AddWorksiteForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      newWorksiteData: Map(),
    };
  }

  handleInputChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { newWorksiteData } = this.state;
    const { name, value } = e.currentTarget;
    console.log('name ', name, 'value: ', value);
    this.setState({ newWorksiteData: newWorksiteData.set(name, value) });
  }

  // handleSelectChange = (value :string, e :Object) => {
  //   const { newWorksiteData } = this.state;
  //   const { name } = e;
  //   this.setState({ newWorksiteData: newWorksiteData.set(name, value) });
  // }

  render() {
    const { onDiscard } = this.props;
    console.log('data: ', this.state.newWorksiteData.toJS());
    return (
      <>
        <CardSegment padding="small" vertical>
          <FormRow>
            <RowContent>
              <Label>Worksite name</Label>
              <Input
                  name={NAME}
                  onChange={this.handleInputChange}
                  type="text" />
            </RowContent>
          </FormRow>
          <FormRow>
            <RowContent>
              <Label>Description of work available</Label>
              <StyledTextArea
                  name={DESCRIPTION}
                  onChange={this.handleInputChange}
                  rows={3} />
            </RowContent>
          </FormRow>
          <FormRow>
            <RowContent style={{ marginTop: '20px' }}>
              <Label bold>If applicable:</Label>
            </RowContent>
          </FormRow>
          <FormRow>
            <RowContent>
              <Label>Date first active</Label>
              <DatePicker />
            </RowContent>
            <RowContent>
              <Label>Date no longer active</Label>
              <DatePicker />
            </RowContent>
          </FormRow>
          <ButtonsRow>
            <RowContent>
              <ButtonsWrapper>
                <Button onClick={onDiscard} style={{ flex: 1 }}>Discard</Button>
              </ButtonsWrapper>
            </RowContent>
            <RowContent>
              <ButtonsWrapper>
                <Button
                    isLoading={false}
                    mode="primary"
                    onClick={() => {}}
                    style={{ flex: 1 }}>
                  Submit
                </Button>
              </ButtonsWrapper>
            </RowContent>
          </ButtonsRow>
        </CardSegment>
      </>
    );
  }
}

export default AddWorksiteForm;
