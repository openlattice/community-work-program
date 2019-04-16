/*
 * @flow
 */

import React, { PureComponent } from 'react';
import moment from 'moment';
import { DatePicker } from '@atlaskit/datetime-picker';
import { emotionStyles } from '../dropdowns/StyledSelect';
// import { DATE_MDY_SLASH_FORMAT, ISO_DATE_FORMAT } from '../../../utils/DateTimeUtils';
const DATE_MDY_SLASH_FORMAT :string = 'MM/DD/YYYY';

const ISO_DATE_FORMAT :string = 'YYYY-MM-DD';
type Props = {
  disabled ? :boolean,
  format ? :string,
  id :string,
  onChange :(value :string | moment | void) => void,
  options :{now :boolean},
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
    const { options, value } = this.props;
    console.log('options: ', options);
    if (!value && options && options.now) {
      this.handleChange(moment().format(ISO_DATE_FORMAT));
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
          onChange={handleChange}
          placeholder={DATE_MDY_SLASH_FORMAT}
          selectProps={{ styles: emotionStyles }}
          value={value} />
    );
  }
}

export default DateWidget;
