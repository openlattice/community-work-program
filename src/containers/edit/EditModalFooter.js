// @flow
import React from 'react';
import styled from 'styled-components';

import Spinner from '../../components/spinner/Spinner';
import SubmitStates from '../../utils/constants/SubmitStates';
import { PrimaryButton } from '../../components/controls';
import { OL } from '../../core/style/Colors';
import type { SubmitState } from '../../utils/constants/SubmitStates';

const FooterWrapper = styled.div`
  padding: 5px 30px 30px 30px;
`;

type Props = {
  submitState :SubmitState;
  textPrimary :string;
  onClick :(event :SyntheticEvent<HTMLButtonElement>) => void;
}

const EditModalFooter = (props :Props) => {
  const {
    onClick,
    submitState,
    textPrimary
  } = props;
  let content = textPrimary;

  if (submitState === SubmitStates.IS_SUBMITTING) {
    content = <Spinner size={20} color={OL.WHITE} />;
  }
  return (
    <FooterWrapper>
      <PrimaryButton fluid onClick={onClick}>
        { content }
      </PrimaryButton>
    </FooterWrapper>
  );
};

export default EditModalFooter;
