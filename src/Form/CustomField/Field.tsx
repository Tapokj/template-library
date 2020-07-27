import React from 'react';

import { Field, useFormikContext, FormikProps } from 'formik';
import { DisplayError } from './Error';
import { getStyles } from './getStyles';

import { FieldP } from './interfaces';

const fc: { [key: string]: FormikProps<{}> } = {};

export const CustomField = ({
  className,
  name,
  condition,
  fieldClassName,
  label,
  labelClassName,
  classNameError,
  isErrorHidden,
  ...rest
}: FieldP) => {
  const { touched, errors } = useFormikContext<typeof fc>();

  return (
    <div className={className}>
      {label && <p className={labelClassName}>{label}</p>}
      <Field
        {...rest}
        className={fieldClassName}
        style={touched[name] && getStyles(errors, name, condition)}
        name={name}
      />
      {!isErrorHidden && (
        <DisplayError
          classNameError={classNameError}
          touchedControl
          touched={touched[name]}
        >
          {errors[name]}
        </DisplayError>
      )}
    </div>
  );
};

const defaultProps: FieldP = {
  label: '',
  name: '',
  condition: { border: '1px solid red' },
  isErrorHidden: false,
  classNameError: '',
  className: '',
  labelClassName: '',
  fieldClassName: '',
};

CustomField.defaultProps = defaultProps;
