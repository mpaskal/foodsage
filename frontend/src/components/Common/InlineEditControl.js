import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";

const InlineEditControl = ({
  value,
  onChange,
  type = "text",
  options = [],
  validator,
  formatDisplay = (val) => val,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value); // Sync with external changes
  }, [value]);

  const handleBlur = () => {
    if (validator && !validator(localValue)) {
      setLocalValue(value); // Revert if invalid
    } else {
      onChange(localValue);
    }
    setEditMode(false);
  };

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  return editMode ? (
    type === "select" ? (
      <Form.Control
        as="select"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        autoFocus
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </Form.Control>
    ) : (
      <Form.Control
        type={type}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        autoFocus
      />
    )
  ) : (
    <div onClick={() => setEditMode(true)}>{formatDisplay(value)}</div>
  );
};

export default InlineEditControl;
