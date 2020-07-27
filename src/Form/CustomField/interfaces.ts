import { CSSProperties, ReactNode } from 'react';

import { FieldProps } from 'formik';

export interface FieldP {
  className: string;
  name: string;
  label: string;
  condition: CSSProperties;
  fieldClassName: string;
  classNameError: string;
  labelClassName: string;
  isErrorHidden: boolean;
  rest?: FieldProps<{}>;
}

type Range = 100 | 200 | 300 | 400 | number;

export interface ErrorT {
  children?: ReactNode;
  touched: any;
  touchedControl: boolean;
  classNameError: string;
  timeout: Range;
  isHideOnSelect: boolean;
}
