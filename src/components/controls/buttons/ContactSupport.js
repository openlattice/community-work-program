import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/pro-solid-svg-icons';

import { OL } from '../../../core/style/Colors';

const SupportButton = styled.a.attrs(() => ({
  href: 'https://support.openlattice.com/servicedesk/customer/portal/1',
  target: '_blank'
}))`
  align-items: center;
  background-color: ${OL.WHITE};
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
  bottom: 30px;
  box-shadow: none;
  display: flex;
  flex-direction: row;
  height: 37px;
  justify-content: center;
  position: fixed;
  right: 16px;
  text-decoration: none;
  width: 139px;

  &:hover {
    text-decoration: none;
    background-color: ${OL.GREY14};
  }

  span {
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    color: ${OL.GREY02};
    margin-left: 5px;
  }
`;

const QuestionMarkIcon = styled(FontAwesomeIcon).attrs(() => ({
  color: OL.GREY02,
  icon: faQuestionCircle,
  fixedWidth: true,
}))`
  font-size: 15px;
`;

const ContactSupport = () => (
  <SupportButton>
    <QuestionMarkIcon />
    <span>Contact Support</span>
  </SupportButton>
);

export default ContactSupport;
