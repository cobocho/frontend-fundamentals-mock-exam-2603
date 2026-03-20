import { css } from '@emotion/react';
import { createContext, useContext, useId, type HTMLAttributes, type ReactNode } from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { colors } from '_tosslib/constants/colors';
import { Text } from '_tosslib/components';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = { name: TName };

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField must be used inside <FormField>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    name: fieldContext.name,
    id: itemContext.id,
    formItemId: `${itemContext.id}-form-item`,
    formDescriptionId: `${itemContext.id}-form-item-description`,
    formMessageId: `${itemContext.id}-form-item-message`,
    ...fieldState,
  };
}

type FormItemContextValue = { id: string };

const FormItemContext = createContext<FormItemContextValue>({ id: '' });

function FormItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const id = useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        css={css`
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        `}
        className={className}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({ children, ...props }: HTMLAttributes<HTMLLabelElement>) {
  return (
    <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600} spanAttributes={props}>
      {children}
    </Text>
  );
}

function FormDescription({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      id={formDescriptionId}
      css={css`
        font-size: 13px;
        color: ${colors.grey500};
        line-height: 1.5;
        margin: 0;
      `}
      className={className}
      {...props}
    >
      {children}
    </p>
  );
}

function FormMessage({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const { error, formMessageId } = useFormField();
  const message = error?.message ?? children;

  if (!message) return null;

  return (
    <span
      id={formMessageId}
      role="alert"
      css={css`
        font-size: 14px;
        font-weight: 400;
        color: ${colors.red500};
        line-height: 1.5;
      `}
      className={className}
      {...props}
    >
      {message}
    </span>
  );
}

export { Form, FormField, FormItem, FormLabel, FormDescription, FormMessage };
