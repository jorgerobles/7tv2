/* eslint-disable */
import React from 'react';
import PropTypes from "prop-types";
import { DescriptionField } from "react-jsonschema-form";
import TextAreaWidget from "react-jsonschema-form/lib/components/widgets/TextareaWidget";
import ColorWidget from "react-jsonschema-form/lib/components/widgets/ColorWidget";
import FileWidget from "react-jsonschema-form/lib/components/widgets/FileWidget";
import TitleField  from "react-jsonschema-form/lib/components/fields/TitleField";
import ObjectField  from "react-jsonschema-form/lib/components/fields/ObjectField";
import ArrayField  from "react-jsonschema-form/lib/components/fields/ArrayField";

import { ButtonGroup, Button, Glyphicon, Collapse, Checkbox,  FormGroup, InputGroup, FormControl } from "react-bootstrap";
import { insertAtCaret } from '../lib/helpers'
import format from 'string-template'
import { sendAsFile, parseDataUri } from '../lib/helpers'

import ReactCrop, { makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { SelectField } from 'material-ui';

const addNameToDataURL=(dataURL, name) => {
  return dataURL.replace(";base64", `;name=${name};base64`);
}

const getCroppedImg = (src, pixelCrop, fileName) => {
 
  return new Promise((resolve,reject)=>{
    const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    const image=new Image();
          image.onload=function(){
            
            ctx.drawImage(
              image,
              pixelCrop.x,
              pixelCrop.y,
              pixelCrop.width,
              pixelCrop.height,
              0,
              0,
              pixelCrop.width,
              pixelCrop.height
            );
            
            resolve(addNameToDataURL(canvas.toDataURL('image/jpeg'),fileName))
          }

          image.src=src
      })
        
}

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

export class PictureWidget extends React.Component {
  constructor(props){
    super(props);
    this.state={value:"", errorSchema:undefined, crop:{aspect:1}};
    this.uploadHandler=this.uploadHandler.bind(this)
    this.cropHandler=this.cropHandler.bind(this)
    this.updateHandler=this.updateHandler.bind(this)
    this.removeHandler=this.removeHandler.bind(this)
  }

  uploadHandler(value,errorSchema){
    value=value.replace(/name=([^;]+);/gi,(str,p1)=>{return 'name='+encodeURIComponent(p1)+";"})
    this.setState({value, errorSchema})
    this.props.onChange(value,errorSchema);
  }
  cropHandler(crop,pixelCrop,fileName){
    this.setState({crop, pixelCrop,fileName})
  }
  updateHandler(){
    if (confirm("No Way Back!")){
      getCroppedImg(this.props.value, this.state.pixelCrop, this.state.fileName ).then((src)=>{
        this.props.onChange(src,this.state.errorSchema);
        this.setState({crop:{aspect:1}})
      })
    }
  }

  removeHandler(){
    this.props.onChange(undefined);
  }

  render(){
    
    const {name, data, mime} = parseDataUri(this.props.value);
    let fileprops={...this.props, onChange: this.uploadHandler}
    return <div className="pictureWidget">
    <small>Drag to make a crop Marquee</small><br/>
    <ReactCrop src={this.props.value||""} crop={this.state.crop} onChange={(crop, pixelCrop)=>this.cropHandler(crop, pixelCrop,name)}/>
    <br/>
    <Button onClick={this.updateHandler} bsSize="xsmall" bsStyle="danger" disabled={!!!this.props.value}><Glyphicon glyph="pencil"/> Crop</Button>
    <Button onClick={e=>{sendAsFile(decodeURIComponent(name),data,mime)}} bsSize="xsmall"  bsStyle="info" disabled={!!!this.props.value}><Glyphicon glyph="download"/> Download</Button>
    <Button onClick={this.removeHandler} bsSize="xsmall"  bsStyle="warning" disabled={!!!this.props.value}><Glyphicon glyph="remove"/> Remove</Button>
    <hr/>
    <FileWidget {...fileprops}/>
    </div>
  }
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

export class ObjectSelectField extends React.Component {
  constructor(props) {
    /*
    schema: The JSON schema for this field;
    uiSchema: The uiSchema for this field;
    idSchema: The tree of unique ids for every child field;
    formData: The data for this field;
    errorSchema: The tree of errors for this field and its children;
    registry: A registry object (read next).
    formContext: A formContext object (read next next).
    */
    super(props);
    this.state = {value: props.formData};
    this.options = props.schema.enum;
    
  }

  onChange(e) {
    this.setState({value: JSON.parse(e.target.value)},()=>{this.props.onChange(this.state.value)})
  }

  render() {
    let props=this.props

     
      let widget=<select onChange={(e)=>{this.onChange(e)}} className="form-control" id={props.idSchema.$id} value={JSON.stringify(this.state.value)}>
        {this.options.map((option,i)=>{ return <option key={i} value={JSON.stringify(option)} >{Object.keys(option)[0]}</option> })}
        </select>
     

    return (

      <div>
      {(props.uiSchema["ui:title"] || props.schema.title) && (
        <label id={`${props.idSchema.$id}__title`}>
          {props.schema.title || props.uiSchema["ui:title"]}
        </label>
      )}
      {props.description && (
        <DescriptionField
          id={`${props.idSchema.$id}__description`}
          description={props.schema.description}
          formContext={props.formContext}
        />
      )}
      {widget}
    </div>
      
    );
  }
}
  