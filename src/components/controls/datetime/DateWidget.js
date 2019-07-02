/*
 * @flow
 */

import React, { PureComponent } from 'react';
import { DatePicker } from 'lattice-ui-kit';
import { DATE_MDY_SLASH_FORMAT, formatAsISODate } from '../../../utils/DateTimeUtils';

type Props = {
  disabled ? :boolean,
  format ? :string,
  id :string,
  onChange :(value :string | void) => void,
  value ? :string,
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
      this.handleChange(formatAsISODate(value));
    }
  }

  handleChange = (value :string) => {
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
          value={value} />
    );
  }
}

export default DateWidget;
