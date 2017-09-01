/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux'
import Queue from 'promise-queue';

import { loadYamlFile, saveYamlFile } from '../reducers/index';
import { SplitButton, MenuItem, Button, ButtonToolbar, Glyphicon} from 'react-bootstrap';
import { sendAsFile, sendAsImage } from '../lib/helpers'
import slug from 'slug';

export class FileField extends React.Component {

    constructor(props) {
        super(props);
        this._domclick = function (ce)  {
            ce.preventDefault();
            let modifiers = { ctrl: ce.ctrlKey, shift: ce.shiftKey, meta: ce.metaKey };
            if (this.input.__changeHandler) this.input.removeEventListener('change', this.input.__changeHandler)
            this.input.value = "";
            this.input.__changeHandler = (e) => {
                e.preventDefault();
                this.props.onChange(e, modifiers)
            }
            this.input.addEventListener('change', this.input.__changeHandler)
            this.input.click();
        }.bind(this)
    }

    componentDidMount() {
        this.clicker.addEventListener('click', this._domclick)
    }

    componentWillUnMount() {
        this.clicker.removeEventListener('click', this._domclick)
    }

    render() {
        return <span style={this.props.style} >
            <span ref={(input) => this.clicker = input}>{this.props.children}</span><input type="file" ref={(input) => { this.input = input }} multiple style={{ display: "none" }} accept={this.props.accept} />
        </span>
    }
}

export const loadCharacter = (e, action) => {
    let self = this
    let files = e.target.files;
    if (!window.characterLoader)
        window.characterLoader = new Queue(1, Infinity)

    for (let file of files) {
        window.characterLoader.add(loadYamlFile(file)).then((data) => {
            data.forEach((obj, i) => {
                action(obj, i)
            }, this);

        }).catch(console.error)
    }
}

export const downloadCharacters=(characters)=>{
    sendAsFile("7TV_cast.yaml",saveYamlFile(characters,true,'application/x-yaml'))
}

export const downloadSingleCharacter=(character)=>{
    sendAsFile("7TV_cast-"+slug(character.name||character.id)+".yaml",saveYamlFile(character,false,'application/x-yaml'));
}

export const downloadCharactersAsImages=(cast)=>{
    cast.forEach(item=>{
        sendAsImage(item.id, "7TV_cast-"+slug(item.name||item.id)+".png",{scale:2});
    })
    
}

export class Toolbar extends React.Component {
    render(){
        return <div className="ui paper">
                <h2 className="din" style={{textAlign:"center", marginBottom:0}}>7TV Studios</h2>
                <h5 className="din" style={{textAlign:"center", marginTop:0}}> casting agency</h5>
               <div style={{margin:5}}>
                <Button bsSize="small" block  onClick={e=>this.props.dispatch({ type: 'CHARACTER_NEW' })} bsStyle="primary"><Glyphicon glyph="plus" /> New</Button>
                <FileField style={{display:"block",margin: "5px 0 5px 0"}} accept=".yaml" onChange={e => loadCharacter(e, (file) => this.props.dispatch({ type: 'CHARACTER_LOAD', payload: file }))}><Button block  bsSize="small" bsStyle="success"><Glyphicon glyph="upload" /> Load .Yaml</Button></FileField>
                
                <Button block bsSize="small" onClick={e=>downloadCharacters(this.props.cast)} bsStyle="warning"><Glyphicon glyph="download" /> Download as .Yaml</Button>
                
                <Button block bsSize="small" onClick={e=>downloadCharactersAsImages(this.props.cast)} bsStyle="danger"><Glyphicon glyph="download" /> Download as Images</Button>
                
                <Button block bsSize="small" onClick={e=> {if (confirm('Are you sure?')) this.props.dispatch({type: 'CAST_CLEAR'});}} bsStyle="info"><Glyphicon glyph="trash" /> Reset all</Button>
               </div>
            
        </div>
    }
}

Toolbar = connect(
    (state)=>{return {cast: state.cast}}
)(Toolbar);
