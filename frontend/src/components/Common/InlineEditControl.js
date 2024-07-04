import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";

const InlineEditControl = ({
  value,
  onChange,
  type = "text",
  validator = null,
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

  return editMode ? (
    <Form.Control
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      autoFocus
    />
  ) : (
    <div onClick={() => setEditMode(true)}>{formatDisplay(value)}</div>
  );
};

export default InlineEditControl;
