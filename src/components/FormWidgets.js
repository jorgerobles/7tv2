import React, { PropTypes } from 'react';
import {DescriptionField} from "react-jsonschema-form";
import { FormGroup, ControlLabel, FormControl, ProgressBar,
  Image, HelpBlock, ListGroup, ListGroupItem } from 'react-bootstrap';


export const  CheckboxWidget = function(props) {
    const {
        schema,
        id,
        value,
        required,
        disabled,
        readonly,
        label,
        autofocus,
        onChange,
      } = props;
    return (
        <div className={`checkbox ${disabled || readonly ? "disabled" : ""}`}>
        {schema.description &&
            <DescriptionField description={schema.description} />}
         
            <input
            type="checkbox"
            id={id}
            checked={typeof value === "undefined" ? false : value}
            required={required}
            disabled={disabled || readonly}
            autoFocus={autofocus}
            onChange={event => onChange(event.target.checked)}
            />
            <label htmlFor={id}>
            {label}
            </label>
         
        </div>
    );
  };  