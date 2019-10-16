// @flow
import { isDefined } from '../../utils/LangUtils';

const getWorksiteStatus = (dateActive :string, dateInactive :string) :string => {

  const active :boolean = !isDefined(dateInactive) && isDefined(dateActive);
  const status :string = active ? 'Active' : 'Inactive';
  return status;
};

export {
  getWorksiteStatus,
};
