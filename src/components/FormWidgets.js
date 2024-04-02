/* eslint-disable */
import React from 'react';
import {DescriptionField} from "react-jsonschema-form";
import TextAreaWidget from "react-jsonschema-form/lib/components/widgets/TextareaWidget";
import FileWidget from "react-jsonschema-form/lib/components/widgets/FileWidget";
import ObjectField from "react-jsonschema-form/lib/components/fields/ObjectField";
import ArrayField from "react-jsonschema-form/lib/components/fields/ArrayField";

import {Button, ButtonGroup, ButtonToolbar, Glyphicon, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import {blobToDataURI, insertAtCaret, parseDataUri, sendAsFile} from '../lib/helpers'
import format from 'string-template'

import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {NIL, v3 as uuid3} from 'uuid';

import imglyRemoveBackground from "@imgly/background-removal"


const addNameToDataURL = (dataURL, name) => {
    return dataURL.replace(";base64", `;name=${name};base64`);
}

const getCroppedImg = (src, pixelCrop, fileName) => {

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');
        const image = new Image();
        image.onload = function () {

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

            resolve(addNameToDataURL(canvas.toDataURL('image/jpeg'), fileName))
        }

        image.src = src
    })

}


const textToolsWidgets = {
    ToolInsertText: function (options, widget) {
        let insert = (text) => {
            let node = document.getElementById(widget.id);
            insertAtCaret(node, text)
            widget.onChange(node.value)
        }
        return (props) => {
            return <ButtonGroup bsSize="small">{options.map((text, i) => {
                return <Button bsStyle="info" key={i} onClick={e => insert(text)}>{text}</Button>
            })
            }</ButtonGroup>
        }
    }
}

const parseTextTools = (textTools, props) => {
    return Object.entries(textTools).map((entry, i) => {
        let [cmp, options] = entry;
        let Fcmp = textToolsWidgets[cmp](options, props);
        return <Fcmp key={i}/>
    })
}

const baseurl = () => window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;

export function ToolTextareaWidget(props) {
    const {options} = props
    return (
        <div>
            {parseTextTools(options.textTools, {...props})}
            <TextAreaWidget {...props}/>
        </div>)
}

export class PictureWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: "", errorSchema: undefined, crop: {aspect: 1}, progress: false};
        this.uploadHandler = this.uploadHandler.bind(this)
        this.cropHandler = this.cropHandler.bind(this)
        this.updateHandler = this.updateHandler.bind(this)
        this.removeHandler = this.removeHandler.bind(this)
        this.bkgRemovalHandler = this.bkgRemovalHandler.bind(this)
    }

    uploadHandler(value, errorSchema) {
        value = value.replace(/name=([^;]+);/gi, (str, p1) => {
            return 'name=' + encodeURIComponent(p1) + ";"
        })
        this.setState({value, errorSchema})
        this.props.onChange(value, errorSchema);
    }

    cropHandler(crop, pixelCrop, fileName) {
        this.setState({crop, pixelCrop, fileName})
    }

    updateHandler() {
        if (confirm("No Way Back!")) {
            getCroppedImg(this.props.value, this.state.pixelCrop, this.state.fileName).then((src) => {
                this.props.onChange(src, this.state.errorSchema);
                this.setState({crop: {aspect: 1}})
            })
        }
    }

    bkgRemovalHandler() {
        if (!this.props.value) {
            return;
        }

        try {
            const config = {
                publicPath: baseurl() + '/cdn-imgly/',
                debug: true,
                proxyToWorker: true,
                progress: (key, current, total) => {
                    console.log(`Converting ${key}: ${current} of ${total}`)
                }
            }
            this.setState({progress: true})
            imglyRemoveBackground(this.props.value, config).then((blob) => {
                blobToDataURI(blob).then((src) => {
                        this.props.onChange(src, this.state.errorSchema)
                    }
                )
            })
        } catch (error) {
            this.props.onChange(null, this.state.errorSchema)
        } finally {
            this.setState({progress: false})
        }
    }

    removeHandler() {
        this.props.onChange(undefined);
    }


    render() {

        const {name, data, mime} = parseDataUri(this.props.value);
        let fileprops = {...this.props, onChange: this.uploadHandler}
        return <div className="pictureWidget">
            <small>Drag to make a crop Marquee</small>
            <br/>
            <ReactCrop src={this.props.value || ""} crop={this.state.crop}
                       onChange={(crop, pixelCrop) => this.cropHandler(crop, pixelCrop, name)}/>
            <br/>
            <Button onClick={this.updateHandler} bsSize="xsmall" bsStyle="danger"
                    disabled={!!!this.props.value}><Glyphicon glyph="pencil"/> Crop</Button>
            <Button onClick={e => {
                sendAsFile(decodeURIComponent(name), data, mime)
            }} bsSize="xsmall" bsStyle="info" disabled={!!!this.props.value}><Glyphicon
                glyph="download"/> Download</Button>
            <Button onClick={this.bkgRemovalHandler} bsSize="xsmall" bsStyle="success"
                    disabled={this.state.progress || !!!this.props.value}><Glyphicon glyph="scissors"/> Remove
                background {this.state.progress ? <Glyphicon glyph='hourglass'/> : ''}</Button>
            <Button onClick={this.removeHandler} bsSize="xsmall" bsStyle="warning"
                    disabled={!!!this.props.value}><Glyphicon glyph="remove"/> Remove</Button>
            <hr/>
            <FileWidget {...fileprops}/>
        </div>
    }
}

export class IconCheckboxes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorSchema: undefined,
            categories: [... new Set(props.options.enumOptions.map((i)=>i.value.category))],
            items: props.options.enumOptions.reduce((c, i) => {
                Object.assign(c,{[uuid3(JSON.stringify(i.value),NIL)]:i.value})
                return c;
            }, {})
        };

    }

    selected(values){
        return values.filter(i=>i!==undefined).map((i) => uuid3(JSON.stringify(i), NIL));
    }

    entriesByCategory(label){

        return Object.entries(this.state.items).filter((i)=>i[1].category===label)
    }

    changeHandler(values, errorSchema){
        this.props.onChange(values.map((value)=>this.state.items[value]), this.state.errorSchema)
    }
    render() {

        const items = this.state.categories.map((label,i ) => {
            return <div key={i}><strong>{label}</strong> <ButtonToolbar>
                <ToggleButtonGroup type="checkbox" value={this.selected(this.props.value)} onChange={e=>this.changeHandler(e)}>{
                    this.entriesByCategory(label).map((subEntry)=>{
                        let [hash, item] = subEntry
                        return <ToggleButton title={item.name} key={hash} value={hash}><i className={`font-7tv2-${item.category}`}>{item.chr}</i></ToggleButton>
                    })
                }</ToggleButtonGroup>
            </ButtonToolbar></div>
        })

        return <div className="iconCheckboxes">{items}</div>
    }
}

const parseTools = (options, props) => {
    console.log(props)
}

export function ToolArrayField(children) {
    return (props) => {
        return <div><ArrayField {...props}/>{children.map((c, i) => (React.cloneElement(c, {key: i, widget: props})))}
        </div>
    }
}


export const CollapseObjectField = function (props) {
    let str = format(((props.uiSchema['ui:options'] || {})['template']) || "", props.formData)
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
        this.setState({value: JSON.parse(e.target.value)}, () => {
            this.props.onChange(this.state.value)
        })
    }

    render() {
        let props = this.props


        let widget = <select onChange={(e) => {
            this.onChange(e)
        }} className="form-control" id={props.idSchema.$id} value={JSON.stringify(this.state.value)}>
            {this.options.map((option, i) => {
                return <option key={i} value={JSON.stringify(option)}>{Object.keys(option)[0]}</option>
            })}
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
  