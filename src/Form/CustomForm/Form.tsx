import React from 'react';
import { Formik } from 'formik';
// import { AjaxLoader } from 'hoc';

import { FormProps } from './interfaces';

const wrapFormik = (
  _Component: React.ReactElement,
  _props: FormProps['rest']
) => {
  return React.cloneElement(_Component, _props);
};

export const CustomForm = ({
  initialValues,
  onSubmit,
  schema,
  children,
  isLoader,
  ...rest
}: FormProps) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={schema}
      {...rest}
    >
      {props => wrapFormik(children, props)}
    </Formik>
  );
};
