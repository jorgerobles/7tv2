/* eslint-disable */
import React from 'react';
import PropTypes from "prop-types";
import { DescriptionField } from "react-jsonschema-form";
import TextAreaWidget from "react-jsonschema-form/lib/components/widgets/TextareaWidget";
import FileWidget from "react-jsonschema-form/lib/components/widgets/FileWidget";
import TitleField  from "react-jsonschema-form/lib/components/fields/TitleField";
import ObjectField  from "react-jsonschema-form/lib/components/fields/ObjectField";
import ArrayField  from "react-jsonschema-form/lib/components/fields/ArrayField";

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

export function ToolArrayField(children) {
  return (props)=>{
    return <div><ArrayField {...props}/>{children.map((c,i)=>(React.cloneElement(c,{key:i, widget:props})))}</div>
  }
}


export const CollapseObjectField = function (props) {
  let str=format(((props.uiSchema['ui:options']||{})['template'])||"",props.formData)
  return <details>
            <summary>{str}</summary>
            <ObjectField {...props}/>
          </details>
};