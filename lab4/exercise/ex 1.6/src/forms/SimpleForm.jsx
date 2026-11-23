
import { useRef, useState } from 'react';
import InputField from '../components/InputField';

const initialValues = {
  name: '',
  email: '',
  password: '',
};

function validateField(name, value) {
  switch (name) {
    case 'name':
      return value.trim() ? '' : 'Name is required.';

    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? ''
        : 'Please enter a valid email address.';

    case 'password':
      return value.length >= 8
        ? ''
        : 'Password must contain at least 8 characters.';

    default:
      return '';
  }
}

function validateForm(values) {
  return Object.fromEntries(
    Object.entries(values).map(([name, value]) => [
      name,
      validateField(name, value),
    ])
  );
}

function SimpleForm() {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const fieldRefs = useRef({});

  // Derived state: errors are calculated from current values.
  const errors = validateForm(values);

  // Derived state: no separate useEffect or isValid state.
  const isValid = Object.values(errors).every((error) => !error);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((previousValues) => ({
      ...previousValues,
      [name]: value,
    }));
  }

  function handleBlur(event) {
    const { name } = event.target;

    setTouched((previousTouched) => ({
      ...previousTouched,
      [name]: true,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);

    const currentErrors = validateForm(values);
    const firstInvalidField = Object.keys(currentErrors).find(
      (name) => currentErrors[name]
    );

    if (firstInvalidField) {
      fieldRefs.current[firstInvalidField]?.focus();

      fieldRefs.current[firstInvalidField]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      return;
    }

    alert('Form submitted successfully!');
  }

  function resetForm() {
    setValues(initialValues);
    setTouched({});
    setSubmitted(false);
  }

  return (
    <section className="form-container">
      <h1>Simple Form</h1>

      <p className="form-description">
        Complete all fields to submit the form.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <InputField
          id="name"
          label="Full Name"
          value={values.name}
          error={
            (touched.name || submitted) ? errors.name : ''
          }
          onChange={handleChange}
          onBlur={handleBlur}
          inputRef={(element) => {
            fieldRefs.current.name = element;
          }}
        />

        <InputField
          id="email"
          label="Email"
          type="email"
          value={values.email}
          error={
            (touched.email || submitted) ? errors.email : ''
          }
          onChange={handleChange}
          onBlur={handleBlur}
          inputRef={(element) => {
            fieldRefs.current.email = element;
          }}
        />

        <InputField
          id="password"
          label="Password"
          type="password"
          value={values.password}
          error={
            (touched.password || submitted) ? errors.password : ''
          }
          onChange={handleChange}
          onBlur={handleBlur}
          inputRef={(element) => {
            fieldRefs.current.password = element;
          }}
        />

        <div className="form-status" aria-live="polite">
          {isValid
            ? 'All fields are valid.'
            : 'Please check your information.'}
        </div>

        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button" className="reset-button" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default SimpleForm;
