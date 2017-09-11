/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import {Accordion, Panel,Button, FormControl, FormGroup, InputGroup } from 'react-bootstrap'
import Yaml from 'js-yaml';

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
            <dt>{name} ({item.ratings})</dt>
            <dd>{item.description}</dd>
        </dl>
    }
}