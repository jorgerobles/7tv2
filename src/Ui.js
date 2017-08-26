import React, { Component } from 'react';
import { connect } from 'react-redux'
import Queue from 'promise-queue';
import Yaml from 'js-yaml';
import  {Button } from 'react-materialize'

export const loadYamlFile = (file) => {
    return () => {
        return new Promise((accept, reject) => {
            let reader = new FileReader();
            reader.onload = (data) => {
                try {
                    let objs = [];
                    Yaml.safeLoadAll(reader.result, (obj) => { objs.push(obj) });
                    accept(objs)
                } catch (e) {
                    console.error(e)
                    reject(e)
                }
            }
            reader.readAsText(file);
        })
    }
}


export class FileField extends React.Component {
    
    constructor(props) {
        super(props);
        this._domclick = function(ce) {
            ce.preventDefault();
            let modifiers={ ctrl: ce.ctrlKey, shift: ce.shiftKey, meta: ce.metaKey };
            if (this.input.__changeHandler) this.input.removeEventListener('change',this.input.__changeHandler)
            this.input.value="";
            this.input.__changeHandler = (e)=> {
                e.preventDefault();
                this.props.onChange(e,modifiers)
            }
            this.input.addEventListener('change',this.input.__changeHandler)
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
            <span ref={(input)=>this.clicker = input}>{this.props.children}</span><input type="file" ref={(input) => { this.input = input }} multiple style={{display:"none"}} accept={this.props.accept} />
        </span>
    }
}

export const loadCharacter=(e,action)=>{
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

export function Toolbar({ action, dispatch }) {
    return <div className="toolbar">
        <Button floating fab='vertical' icon='menu' className='red' large style={{bottom: '45px', right: '24px'}}>
        <Button floating icon='add' className='red'/>
        <Button floating icon='format_quote' className='yellow darken-1'/>
        <Button floating icon='publish' className='green'/>
        <FileField accept=".yaml" onChange={e=>loadCharacter(e, (file) => dispatch({ type: 'CHARACTER_LOAD', payload: file }))}><Button floating icon='attach_file' className='blue'/></FileField>
    </Button>
    </div>
}

Toolbar = connect()(Toolbar);
