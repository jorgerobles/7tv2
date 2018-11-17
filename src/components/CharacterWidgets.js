/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import {Accordion, Panel,Button, FormControl, FormGroup, InputGroup, Label } from 'react-bootstrap'
import Yaml from 'js-yaml';
import { readContext } from '../lib/helpers'
import { Marked } from './Ui'
import Holdable from 'react-holdable'
import UnsupportedField from '../../node_modules/react-jsonschema-form/lib/components/fields/UnsupportedField';
import uuid from 'uuid';

const parseTrait=(label,text)=>{
    let trait={}
    if (typeof text === 'string') {
        trait.description=text
    } else {
        trait=Object.assign({},text)
    }
    trait.cost=trait.cost || 0
    trait.name=label
    return trait;
} 

export class SFXSelect extends React.Component {
    
    constructor(props){
        super(props)
        this.handleClick=this.handleClick.bind(this)
        this.state={
            data: {},
            value:null
        }
    }

    handleClick(e){
        if (!this.state.value) return;
        let formData=this.props.widget.formData;
        this.props.widget.onChange([...formData,this.state.value],{ validate: false })
    }

    componentDidMount()
    {
        fetch(require('../data/sfx.yaml')).then((response)=>{
            response.text().then(function(txt){this.setState({data:Yaml.safeLoad(txt)})}.bind(this))
        })
    }
    render(){
        return <FormGroup>
                <InputGroup><FormControl componentClass="select" placeholder="Select SFX to add" defaultValue="" onChange={e=>{this.setState(Object.assign(this.state,{value:JSON.parse(e.target.value)}))}}>
            <option>Select SFX to append</option>
            {Object.entries(this.state.data).map((entry,i)=>{
                let [group,item]=entry;
                return <optgroup key={i} label={group}>{Object.entries(item).map((sfx_entry,j)=>{
                    let [label,value]=sfx_entry;
                    return <option key={j} value={JSON.stringify(parseTrait(label, value))}>{label}</option>
                })}</optgroup>
            })}
        </FormControl><InputGroup.Button><Button bsStyle="success" onClick={e=>{this.handleClick(e)}}>Add SFX</Button></InputGroup.Button></InputGroup></FormGroup>
    }
}

SFXSelect=connect((state)=>({currentCharacter: state.currentCharacter}))(SFXSelect)

export class SQSelect extends React.Component {
    
    constructor(props){
        super(props)
        this.handleClick=this.handleClick.bind(this)
        this.state={
            data: {},
            value:null
        }
    }

    handleClick(e){
        if (!this.state.value) return;
        let formData=this.props.widget.formData;
        this.props.widget.onChange([...formData,this.state.value],{ validate: false })
    }

    componentDidMount()
    {
        fetch(require('../data/sfx-sq.yaml')).then((response)=>{
            response.text().then(function(txt){this.setState({data:Yaml.safeLoad(txt)})}.bind(this))
        })
    }
    render(){
        return <FormGroup>
                <InputGroup><FormControl componentClass="select" placeholder="Select SFX to add" defaultValue="" onChange={e=>{this.setState(Object.assign(this.state,{value:JSON.parse(e.target.value)}))}}>
            <option>Select SFX to append</option>
            {Object.entries(this.state.data).map((entry,i)=>{
                let [group,item]=entry;
                return <optgroup key={i} label={group}>{Object.entries(item).map((sfx_entry,j)=>{
                    let [label,value]=sfx_entry;
                    return <option key={j} value={JSON.stringify(parseTrait(label, value))}>{label}</option>
                })}</optgroup>
            })}
        </FormControl><InputGroup.Button><Button bsStyle="success" onClick={e=>{this.handleClick(e)}}>Add SFX</Button></InputGroup.Button></InputGroup></FormGroup>
    }
}

SQSelect=connect((state)=>({currentCharacter: state.currentCharacter}))(SQSelect)



export const PROFILES=readContext(require.context('../data/casts', true))

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
        Object.entries(PROFILES).forEach(([file,path])=>{

        fetch(path).then((response)=>{
                response.text().then(function(txt){ 
                    let data={}
                    Yaml.safeLoadAll(txt).forEach(item=>{
                        data[item.name]=item;
                    })
                    this.setState({...this.state, casting: {...this.state.casting,[file.replace(/(^\.\/)|(\.yaml$)/gi,'').replace(/_/gi," ")]:data}})
                }.bind(this))
            })
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

        let create = (item) =>{
            let [selected, character] = item;
            fromTemplate(character)
        }

        if (this.state.casting){
            cast=(<Accordion>{Object.entries(this.state.casting).map((entry, i)=>{
                let [key, chr] = entry;
                return <Panel header={key} eventKey={i} key={i}><div className="listing">
                    {Object.entries(chr).map(
                        (item,j)=>{
                            let [name,char] = item;
                            return <Holdable key={uuid.v4()} 
                                onHoldComplete={e=>{create(item)}} 
                                onClickComplete={e=>{select(item)}} 
                            ><MiniCard character={item} key={j} selected={this.state.selected && (this.state.selected===name)} /></Holdable>
                        }
                    )}
                </div></Panel>
            })}</Accordion>)
            
        }

        const fromTemplate=(item=null)=>{
            if (!item) 
                item=this.state.character
            this.props.dispatch({
                type:'CHARACTER_NEW', 
                payload: Object.assign({},item,{name: item.name, profile: item.name})
            });
        }

        return <div className="profileSelector">
            <h4>Select a character or Create new</h4>
            {cast}
            <Button onClick={e=>fromTemplate()} bsStyle="primary" block disabled={!this.state.selected}>New from template</Button>
        </div>
    }
}

ProfileSelector=connect()(ProfileSelector)
    
export class MiniCard extends React.Component {
    render(){
        let [name, item] = this.props.character;
        return <dl className={"miniCard "+((this.props.selected)?'selected':'')} onClick={this.props.onClick}>
            <dt>{name} {item.ratings? `(${item.ratings})`:''} {item.__card? '':<Label>Incomplete</Label>}</dt>
            <dd><Marked md={item.description}/></dd>
        </dl>
    }
}