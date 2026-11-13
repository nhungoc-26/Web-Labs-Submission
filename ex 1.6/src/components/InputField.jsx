
function InputField({
  id,
  label,
  type = 'text',
  value,
  error,
  onChange,
  onBlur,
  inputRef,
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>

      <input
        ref={inputRef}
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholder={`Enter your ${label.toLowerCase()}`}
      />

      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default InputField;
