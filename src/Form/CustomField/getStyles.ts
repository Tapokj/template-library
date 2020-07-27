import { getIn } from 'formik';

import { CSSProperties } from 'react';

export const getStyles = (
  errors: object,
  fieldName: string,
  condition: CSSProperties
) => {
  if (getIn(errors, fieldName)) {
    return condition;
  }

  return null;
};
