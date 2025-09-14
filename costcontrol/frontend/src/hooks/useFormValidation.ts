import { useState, useEffect } from 'react';

export const useFormValidation = (initialValues: any, validate: (values: any) => any) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      const noErrors = Object.keys(errors).length === 0;
      if (noErrors) {
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    }
  }, [errors, isSubmitting]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setValues({
        ...values,
        [name]: checked
      });
    } else {
      setValues({
        ...values,
        [name]: value
      });
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });

    setErrors(validate(values));
  };

  const handleSubmit = (callback: () => void) => (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(
      Object.keys(values).reduce((acc, key) => {
        return {
          ...acc,
          [key]: true
        };
      }, {})
    );

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      callback();
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues
  };
};

