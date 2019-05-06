/*
 * @flow
 */

import React, { PureComponent } from 'react';
import moment from 'moment';
import { DatePicker } from '@atlaskit/datetime-picker';
import { emotionStyles } from '../dropdowns/StyledSelect';
import { DATE_MDY_SLASH_FORMAT, ISO_DATE_FORMAT } from '../../../utils/DateTimeUtils';

type Props = {
  disabled ? :boolean,
  format ? :string,
  id :string,
  onChange :(value :string | moment | void) => void,
  value ? :string | moment,
};

class DateWidget extends PureComponent<Props> {
  static defaultProps = {
    autofocus: false,
    format: DATE_MDY_SLASH_FORMAT,
    disabled: false,
    value: '',
  }

  componentDidMount() {
    const { value } = this.props;
    if (!value) {
      this.handleChange(moment().format(ISO_DATE_FORMAT));
    }
  }

  handleChange = (value :string | moment) => {
    const { onChange } = this.props;
    onChange(value || undefined, 'date');
  }

  render() {
    const {
      handleChange,
      props: {
        id,
        format,
        disabled,
        value
      },
    } = this;
    return (
      <DatePicker
          dateFormat={format}
          id={id}
          isDisabled={disabled}
          disabled={[]}
          onChange={handleChange}
          selectProps={{ styles: emotionStyles }}
          value={value} />
    );
  }
}

export default DateWidget;
