/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import {Accordion, Panel,Button } from 'react-bootstrap'

import Form, {DescriptionField} from "react-jsonschema-form";

import '../assets/bootstrap/css/paper.min.css'
import '../assets/editor.css'


import { dataURItoBlob } from '../lib/helpers'
import { ToolTextareaWidget , ToolArrayField, CollapseObjectField, PictureWidget, PickColorWidget} from './FormWidgets'
import { SFXSelect, ProfileSelector, MiniCard} from './CharacterWidgets'

const getCharacterById=(id, cast)=>{
    return cast.find(item=>{return item.id == id})
}
   


const log = (type) => console.log.bind(console, type);


const SfxArrayField=ToolArrayField(
    [<SFXSelect/>]
)

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
        const uiSchema = require('../data/'+card+'-uischema.json');
        const schema = require('../data/'+card+'-schema.json');

        const widgets={
            toolTextareaWidget:ToolTextareaWidget,
            pictureWidget:PictureWidget,
        }
        const fields={
            collapseObjectField:CollapseObjectField,
            sfxArrayField:SfxArrayField
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
                widgets={widgets}
                fields={fields}
                ><Button bsStyle="danger" block type="submit">Validate</Button></Form>}
                </div>
        </div>
    }
}


