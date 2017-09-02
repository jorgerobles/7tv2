/* eslint-disable */
import React from 'react';
import PropTypes from "prop-types";
import { DescriptionField } from "react-jsonschema-form";
import { ButtonGroup, Button } from "react-bootstrap";
import { insertAtCaret } from '../lib/helpers'

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


  const textToolsWidgets={
    ToolInsertText:function(options,widget){
      let node=document.getElementById(widget.id);
      let insert=(text)=>{
        insertAtCaret(node,text)
        widget.onChange(node.value)
      }
      return (props)=>{
        return <ButtonGroup bsSize="xsmall">{options.map((text,i)=>{ 
          return <Button bsStyle="info" key={i} onClick={e=>insert(text)}>Insert {text}</Button>})
          }</ButtonGroup>
      }
    }
  }

  const parseTextTools=(textTools,props)=>{
      return Object.entries(textTools).map((entry, i)=>{
        let [cmp, options] = entry;
        let Fcmp=textToolsWidgets[cmp](options, props);
        return <Fcmp key={i} />
      })
  }

  export function ToolTextareaWidget(props) {
    const {
      id,
      options,
      placeholder,
      value,
      required,
      disabled,
      readonly,
      autofocus,
      onChange,
      onBlur,
      onFocus,
    } = props;
    const _onChange = ({ target: { value } }) => {
      return onChange(value === "" ? options.emptyValue : value);
    };
    let textTools;
    return (
      <div>
        {parseTextTools(options.textTools,{...props})}
        <textarea
          id={id}
          className="form-control"
          value={typeof value === "undefined" ? "" : value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          autoFocus={autofocus}
          rows={options.rows}
          onBlur={onBlur && (event => onBlur(id, event.target.value))}
          onFocus={onFocus && (event => onFocus(id, event.target.value))}
          onChange={_onChange}
        />
      </div>
    );
  }

  ToolTextareaWidget.defaultProps = { 
    autofocus: false,
    options: {},
  };
  
  if (process.env.NODE_ENV !== "production") {
    ToolTextareaWidget.propTypes = {
      schema: PropTypes.object.isRequired,
      id: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      options: PropTypes.shape({
        rows: PropTypes.number,
      }),
      value: PropTypes.string,
      required: PropTypes.bool,
      disabled: PropTypes.bool,
      readonly: PropTypes.bool,
      autofocus: PropTypes.bool,
      onChange: PropTypes.func,
      onBlur: PropTypes.func,
      onFocus: PropTypes.func,
    };
  }