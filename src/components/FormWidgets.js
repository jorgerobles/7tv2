/* eslint-disable */
import React from 'react';
import PropTypes from "prop-types";
import { DescriptionField } from "react-jsonschema-form";
import TextAreaWidget from "react-jsonschema-form/lib/components/widgets/TextareaWidget";
import FileWidget from "react-jsonschema-form/lib/components/widgets/FileWidget";
import TitleField  from "react-jsonschema-form/lib/components/fields/TitleField";
import ObjectField  from "react-jsonschema-form/lib/components/fields/ObjectField";
import { ButtonGroup, Button, Glyphicon, Collapse } from "react-bootstrap";
import { insertAtCaret } from '../lib/helpers'
import format from 'string-template'
import { sendAsFile, parseDataUri } from '../lib/helpers'

const textToolsWidgets={
  ToolInsertText:function(options,widget){
    let insert=(text)=>{
      let node=document.getElementById(widget.id);
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
  const { options } =props
  return (
    <div>
      {parseTextTools(options.textTools,{...props})}
      <TextAreaWidget {...props}/>
    </div>)
}

export function PictureWidget(props) {
  let image;
  
  if ((props.value||"").search(/^data:image\/\w+/gi)!==false) 
    image=<img className="preview" src={props.value}/>
  
  const {name, data, mime} = parseDataUri(props.value);

  return <div className="pictureWidget">{image}<FileWidget {...props}/><Button onClick={e=>{sendAsFile(name,data,mime)}} bsStyle="info"><Glyphicon glyph="download"/> Download</Button></div>
}

const parseTools=(options,props)=>{
  console.log(props)
}

export function ArrayFieldTemplate(props) {
  return (
    <div className={props.className}>
      
      <TitleField id={`${props.idSchema.$id}__title`} title={props.uiSchema["ui:title"] || props.title} required={props.required} />
      

      {(props.uiSchema["ui:description"] || props.schema.description) && (
        <div
          className="field-description"
          key={`field-description-${props.idSchema.$id}`}>
          {props.uiSchema["ui:description"] || props.schema.description}
        </div>
      )}
      {props.items &&
        props.items.map(element => (
          <div key={element.index} className="array-item">

            
            <div style={{float:"right"}}>
            <ButtonGroup bsSize="small">
           
              <Button  disabled={!element.hasMoveDown}
                onClick={element.onReorderClick(
                  element.index,
                  element.index + 1
                )}>
                <Glyphicon glyph="arrow-down"/>
              </Button>
            
            
              <Button  disabled={!element.hasMoveUp}
                onClick={element.onReorderClick(
                  element.index,
                  element.index - 1
                )}>
                <Glyphicon glyph="arrow-up"/>
              </Button>
            
            <Button  bsStyle="danger" onClick={element.onDropIndexClick(element.index)}><Glyphicon glyph="remove"/></Button>
            </ButtonGroup>
            </div>
            {element.children}
          </div>
        ))}

      {props.canAdd && (
        <div className="row">
        {parseTools(props.uiSchema["ui:options"],{...props})}
        <Button block onClick={props.onAddClick} bsStyle="success">Add new</Button>
        </div>
      )}
    </div>
  );
}


export const CollapseObjectField = function (props) {
  let str=format(((props.uiSchema['ui:options']||{})['template'])||"",props.formData)
  return <details>
            <summary>{str}</summary>
            <ObjectField {...props}/>
          </details>
};