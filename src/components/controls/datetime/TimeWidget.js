/*
 * @flow
 */

import React, { PureComponent } from 'react';
import moment from 'moment';
import { TimePicker } from '@atlaskit/datetime-picker';
import { emotionStyles } from '../dropdowns/StyledSelect';
import { TIME_HM_FORMAT } from '../../../utils/DateTimeUtils';

type Props = {
  disabled :boolean,
  id :string,
  onChange :(value :string | moment | void) => void,
  format :string,
  value :string | moment,
};

class TimeWidget extends PureComponent<Props> {
  static defaultProps = {
    autofocus: false,
    disabled: false,
    format: TIME_HM_FORMAT,
    value: '',
  }

  componentDidMount() {
    const { value } = this.props;
    if (!value) {
      this.handleChange(moment().format(TIME_HM_FORMAT));
    }
  }

  handleChange = (value :string | moment) => {
    const { onChange } = this.props;
    onChange(value || undefined, 'time');
  }

  render() {
    const {
      handleChange,
      props: {
        id,
        disabled,
        format,
        value
      },
    } = this;
    return (
      <TimePicker
          id={id}
          isDisabled={disabled}
          onChange={handleChange}
          selectProps={{ styles: emotionStyles }}
          timeFormat={format}
          timeIsEditable
          value={value} />
    );
  }
}

export default TimeWidget;
