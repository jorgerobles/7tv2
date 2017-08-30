import React from 'react'
import { connect } from 'react-redux'
import { Button, Dropdown, NavItem, Icon } from 'react-materialize'

import Form, {DescriptionField} from "react-jsonschema-form";

import RcSelect from 'react-schema-form-rc-select/lib/RcSelect';
import 'rc-select/assets/index.css'

import './assets/bootstrap/css/paper.min.css'
import './assets/editor.css'

const getCharacterById=(id, cast)=>{
    return cast.find(item=>{return item.id == id})
}
  

const uiSchema = require('./data/model-uischema.json');
const schema = require('./data/model-schema.json');

const log = (type) => console.log.bind(console, type);

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
        return <div className="paper characterEditor">
            <div style={{margin:20}}>
            {character ? <Form schema={schema}
                onChange={this.handleChange}
                onSubmit={log("submitted")}
                onError={log("errors")}
                uiSchema={uiSchema}
                formData = {character}
                /> : <h4>Select a character</h4>}
                </div>
        </div>
    }
}
