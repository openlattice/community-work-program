// @flow
import React from 'react';

import { Button } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';

import { downloadEnrollments } from './actions';

const DownloadContainer = () => {
  const dispatch = useDispatch();

  const onDownloadClick = () => {
    dispatch(downloadEnrollments());
  };

  return (
    <Button color="primary" onClick={onDownloadClick}>Download Enrollments, etc.</Button>
  );
};

export default DownloadContainer;
