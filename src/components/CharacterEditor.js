/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import {Accordion, Panel,Button } from 'react-bootstrap'

import Form, {DescriptionField} from "react-jsonschema-form";

import RcSelect from 'react-schema-form-rc-select/lib/RcSelect';
import 'rc-select/assets/index.css'

import '../assets/bootstrap/css/paper.min.css'
import '../assets/editor.css'

import Queue from 'promise-queue';
import Yaml from 'js-yaml';
import { loadYamlFile } from '../reducers/index'
import { dataURItoBlob } from '../lib/helpers'


const getCharacterById=(id, cast)=>{
    return cast.find(item=>{return item.id == id})
}
  

const uiSchema = require('../data/model-uischema.json');
const schema = require('../data/model-schema.json');

const log = (type) => console.log.bind(console, type);


export class ProfileSelector extends React.Component {

    constructor(props){
        super(props)
        this.state={
            casting:{},
            selected: null,
            character:null
        }
    }

    componentDidMount()
    {
        fetch(require('../data/casting-heroes.yaml')).then((response)=>{
            response.text().then(function(txt){ this.setState({...this.state, casting: {...this.state.casting, Heroes: Yaml.safeLoad(txt)}})}.bind(this))
        })
        fetch(require('../data/casting-villains.yaml')).then((response)=>{
            response.text().then(function(txt){ this.setState({...this.state, casting: {...this.state.casting, Villains: Yaml.safeLoad(txt)}})}.bind(this))
        })
        fetch(require('../data/casting-extras.yaml')).then((response)=>{
            response.text().then(function(txt){ this.setState({...this.state, casting: {...this.state.casting, Extras: Yaml.safeLoad(txt)}})}.bind(this))
        })
    }
    /*  */
    render(){
        let cast;
        let select = (item)=>{
            let [selected, character] = item;
            if (this.state.selected && (selected==this.state.selected)){
                selected=null;
                character=null;
            }
            
            this.setState(Object.assign(this.state,{selected,character}))
        }
        if (this.state.casting){
            cast=(<Accordion>{Object.entries(this.state.casting).map((entry, i)=>{
                let [key, chr] = entry;
                return <Panel header={key} eventKey={i} key={i}><div className="listing">
                    {Object.entries(chr).map(
                        (item,j)=>{
                            let [name,char] = item;
                            return <MiniCard character={item} key={j} onClick={e=>{select(item)}} selected={this.state.selected && (this.state.selected===name)}/>
                        }
                    )}
                </div></Panel>
            })}</Accordion>)
            
        }

        const fromTemplate=()=>{
            this.props.dispatch({
                type:'CHARACTER_NEW', 
                payload: Object.assign({},this.state.character,{name: this.state.selected, profile: this.state.selected})
            });
        }

        return <div className="ProfileSelector">
            <h4>Select a character or Create new</h4>
            {cast}
            <Button onClick={e=>fromTemplate()} bsStyle="primary" block disabled={!this.state.selected}>New from template</Button>
        </div>
    }
}

ProfileSelector=connect()(ProfileSelector)

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
                liveValidate
                formData = {character}
                ><Button bsStyle="danger" block type="submit">Validate</Button></Form> : <ProfileSelector/>}
                </div>
        </div>
    }
}

export class MiniCard extends React.Component {
    render(){
        let [name, item] = this.props.character;
        return <dl className={"miniCard "+((this.props.selected)?'selected':'')} onClick={this.props.onClick}>
            <dt>{name} ({item.ratings})</dt>
            <dd>{item.description}</dd>
        </dl>
    }
}
