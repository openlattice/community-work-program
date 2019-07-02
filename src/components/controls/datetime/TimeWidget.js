/*
 * @flow
 */

import React, { PureComponent } from 'react';
import { TimePicker } from 'lattice-ui-kit';
import { TIME_HM_FORMAT, formatAsTime } from '../../../utils/DateTimeUtils';

type Props = {
  disabled :boolean,
  id :string,
  onChange :(value :string | void) => void,
  format :string,
  value :string,
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
      this.handleChange(formatAsTime(value));
    }
  }

  handleChange = (value :string) => {
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
          timeFormat={format}
          timeIsEditable
          value={value} />
    );
  }
}

export default TimeWidget;
