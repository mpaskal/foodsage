import React, { useState, useEffect } from "react";
import { Form, Image } from "react-bootstrap";

const InlineEditControl = ({
  value,
  onChange,
  type = "text",
  options = [],
  validator,
  formatDisplay = (val) => val,
  getImageSrc,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (validator && !validator(localValue)) {
      setLocalValue(value);
    } else {
      onChange(localValue);
    }
    setEditMode(false);
  };

  const handleChange = (e) => {
    if (type === "file") {
      onChange(e.target.files[0]);
      setEditMode(false);
    } else {
      setLocalValue(e.target.value);
    }
  };

  if (type === "file") {
    return (
      <div>
        <Form.Control
          type="file"
          onChange={handleChange}
          style={{ display: editMode ? "block" : "none" }}
        />
        <Image
          src={getImageSrc(value)}
          alt="Food item"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            cursor: "pointer",
            display: editMode ? "none" : "block",
          }}
          onClick={() => setEditMode(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${process.env.PUBLIC_URL}/placeholder.jpeg`;
          }}
        />
      </div>
    );
  }

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
