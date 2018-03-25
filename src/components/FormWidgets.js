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
  }

  uploadHandler(value,errorSchema){
    
    this.setState({value, errorSchema, crop:{aspect:1}})
    this.props.onChange(value,errorSchema);
  }
  cropHandler(crop,pixelCrop,fileName){
    this.setState({crop, pixelCrop,fileName})
  }
  updateHandler(){
    if (confirm("No Way Back!")){
      getCroppedImg(this.props.value, this.state.pixelCrop, this.state.fileName ).then((src)=>{
        this.props.onChange(src,this.state.errorSchema);
        this.setState({crop:null})
      })
    }
  }

  render(){
    const {name, data, mime} = parseDataUri(this.props.value);
    let fileprops={...this.props, onChange: this.uploadHandler}
    return <div className="pictureWidget">
    <small>Drag to make a crop Marquee</small><br/>
    <ReactCrop src={this.props.value} crop={this.state.crop} onChange={(crop, pixelCrop)=>this.cropHandler(crop, pixelCrop,name)}/>
    <br/>
    <Button onClick={this.updateHandler} bsSize="xsmall" bsStyle="danger" disabled={!this.props.value}><Glyphicon glyph="pencil"/> Crop</Button>
    <Button onClick={e=>{sendAsFile(name,data,mime)}} bsSize="xsmall"  bsStyle="info" disabled={!this.props.value}><Glyphicon glyph="download"/> Download</Button>
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
