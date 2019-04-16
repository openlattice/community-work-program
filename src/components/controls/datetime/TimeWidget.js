/*
 * @flow
 */

import React, { PureComponent } from 'react';
import moment from 'moment';
import { TimePicker } from '@atlaskit/datetime-picker';
import { emotionStyles } from '../dropdowns/StyledSelect';

export const TIME_FORMAT = 'HH:mm';

type Props = {
  disabled :boolean,
  id :string,
  onChange :(value :string | moment | void) => void,
  options :{now :boolean},
  format :string,
  value :string | moment,
};

class TimeWidget extends PureComponent<Props> {
  static defaultProps = {
    autofocus: false,
    disabled: false,
    format: TIME_FORMAT,
    value: '',
  }

  componentDidMount() {
    const { options, value } = this.props;
    if (!value && options && options.now) {
      this.handleChange(moment().format(TIME_FORMAT));
    }
  }

  handleChange = (value :string | moment) => {
    const { onChange } = this.props;
    onChange(value || undefined);
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
          placeholder="e.g. 09:00"
          selectProps={{ styles: emotionStyles }}
          timeFormat={format}
          timeIsEditable
          value={value} />
    );
  }
}

export default TimeWidget;
