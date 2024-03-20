/* eslint-disable */
import React from 'react'
import {Button} from 'react-bootstrap'

import Form from "react-jsonschema-form";

import '../assets/bootstrap/css/paper.min.css'
import '../assets/editor.css'
import {
    CollapseObjectField,
    IconCheckboxes,
    ObjectSelectField,
    PictureWidget,
    ToolArrayField,
    ToolTextareaWidget
} from './FormWidgets'
import {ModSelect, ProfileSelector, SFXSelect, SQSelect} from './CharacterWidgets'

const getCharacterById=(id, cast)=>{
    return cast.find(item=>{return item.id == id})
}

const applyToProps=(dict,props,value)=>{
    return Object.assign(dict,
        props.reduce((obj,item)=>{obj[item]=value;return obj;},{})
    );
}

const diff=(arr1,arr2)=>{
    return arr2.filter(function(i) {return arr1.indexOf(i) < 0;});
}

const log = (type) => console.log.bind(console, type);


const SfxArrayField=ToolArrayField([<SFXSelect/>])
const SQArrayField=ToolArrayField([<SQSelect/>])
const ModArrayField=ToolArrayField([<ModSelect/>])

export class CharacterEditor extends React.Component {
    
    constructor(props){
        super(props);
        this.handleChange=this.handleChange.bind(this)
    }

    handleChange(data){
        if (this.props.onChange)
            this.props.onChange(data)
    }

    render(){
        let character=getCharacterById(this.props.characterId, this.props.cast);

        if (!character) 
            return <div className="paper characterEditor"><div style={{margin:20}}><ProfileSelector/></div></div>;

        const card=character.__card.toLowerCase();
        const uiSchema=require('../data/' + card + '-uischema.json')
        const schema = require('../data/'+card+'-schema.json');

        const widgets={
            toolTextareaWidget:ToolTextareaWidget,
            pictureWidget:PictureWidget,
            iconCheckboxes:IconCheckboxes
        }
        const fields={
            collapseObjectField:CollapseObjectField,
            sfxArrayField:SfxArrayField,
            sqArrayField:SQArrayField,
            modArrayField:ModArrayField,
            objectSelectField:ObjectSelectField,

        }
        return <div className="paper characterEditor">
            <div style={{margin:20}}>
            <Form schema={schema}
                onChange={this.handleChange}
                onSubmit={log("submitted")}
                onError={log("errors")}
                uiSchema={uiSchema}
                liveValidate
                formData = {character}
                formContext = {character}
                widgets={widgets}
                fields={fields}
                ><Button bsStyle="danger" block type="submit">Validate</Button></Form>
                </div>
        </div>
    }
}


