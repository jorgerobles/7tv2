import React, { Component } from 'react';
import { connect } from 'react-redux'
import Queue from 'promise-queue';
import Yaml from 'js-yaml';


export const loadYamlFile = (file) => {
    return () => {
        return new Promise((accept, reject) => {
            let reader = new FileReader();
                reader.onload=(data) => {
                    try {
                        let obj=Yaml.safeLoad(reader.result);
                        accept(obj)
                    } catch(e) {
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
        this.handleOpen.bind(this)
        this.handleSelect.bind(this)

    }

    componentWillMount() {
        if (!window.characterLoader)
            window.characterLoader = new Queue(1, Infinity)
    }

    handleOpen(e) {
        this.fileinput.value = "";
    }

    handleSelect(e) {
        let self = this
        let files = e.target.files;
        
        for (let file of files) {
            window.characterLoader.add(loadYamlFile(file)).then((data) => {
                self.props.onFileLoad(data)
            }).catch(console.error)
        }
        this.fileinput.value = "";
    }

    render() {
        return <input ref={(input) => { this.fileinput = input }} type="file" onClick={e => this.handleOpen(e)} onChange={e => this.handleSelect(e)} accept={this.props.accept} />
    }
}

export function Toolbar({ action, dispatch }) {
    return <div><FileField accept=".yaml" onFileLoad={(file) => dispatch({ type: 'CHARACTER_LOAD', payload: file })} /></div>
}

Toolbar = connect()(Toolbar);
