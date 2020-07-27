import { ReactElement } from 'react';

import { FormikProps } from 'formik';

export interface FormProps {
  initialValues: object;
  onSubmit: (data?: object) => void;
  schema?: object;
  children: ReactElement;
  isLoader?: boolean;
  isLoading?: boolean;
  rest?: FormikProps<object>;
}
