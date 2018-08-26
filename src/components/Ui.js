/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux'
import Queue from 'promise-queue';
import ReactDOM from 'react-dom';
import marked from 'marked'


import { loadYamlFile, saveYamlFile } from '../reducers/index';
import { SplitButton, MenuItem, Button, ButtonToolbar, Glyphicon, DropdownButton, Collapse} from 'react-bootstrap';
import { sendAsFile, sendAsImage, getAsImage } from '../lib/helpers'
import slug from 'slug';
import jsPDF from 'jspdf';
import chunk from 'chunk';

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
    sendAsFile("7TV_cast.yaml",saveYamlFile(characters,true),'application/x-yaml')
}

export const downloadSingleCharacter=(character)=>{
    sendAsFile("7TV_cast-"+slug(character.name||character.id)+".yaml",saveYamlFile(character,false),'application/x-yaml');
}

export const downloadCharactersAsImages=(cast)=>{
    cast.forEach(item=>{
        sendAsImage(item.id,"7TV_cast-"+slug(item.name||item.id)+".png",{scale:2});
    })
}

const dottedLine=function(doc, xFrom, yFrom, xTo, yTo, segmentLength)
{
    // Calculate line length (c)
    var a = Math.abs(xTo - xFrom);
    var b = Math.abs(yTo - yFrom);
    var c = Math.sqrt(Math.pow(a,2) + Math.pow(b,2));

    // Make sure we have an odd number of line segments (drawn or blank)
    // to fit it nicely
    var fractions = c / segmentLength;
    var adjustedSegmentLength = (Math.floor(fractions) % 2 === 0) ? (c / Math.ceil(fractions)) : (c / Math.floor(fractions));

    // Calculate x, y deltas per segment
    var deltaX = adjustedSegmentLength * (a / c);
    var deltaY = adjustedSegmentLength * (b / c);

    var curX = xFrom, curY = yFrom;
    while (curX <= xTo && curY <= yTo)
    {
        doc.line(curX, curY, curX + deltaX, curY + deltaY);
        curX += 2*deltaX;
        curY += 2*deltaY;
    }
}

export const downloadCharactersAsPDF=(cast,fileName='7TVcast')=>{

    const PAGE_WIDTH=10.55;
    const PAGE_HEIGHT=7.55;
    const MARGIN_X=0.3;
    const MARGIN_Y=0.3;
    const CARD_WIDTH=5;
    const CARD_HEIGHT=3.5;
    const CARD_OFFSETX=0;
    const CARD_OFFSETY=-0.3

    let doc = new jsPDF({orientation: 'landscape',format:[PAGE_WIDTH,PAGE_HEIGHT],unit:'in'});
        
    let promises=cast.map((item)=>{
        return getAsImage(document.getElementById(item.id),{scale:2})
    })
    const positions=[{x:0,y:0},{x:CARD_WIDTH+CARD_OFFSETX,y:0},{x:0,y:CARD_HEIGHT+CARD_OFFSETY},{x:CARD_WIDTH+CARD_OFFSETX,y:CARD_HEIGHT+CARD_OFFSETY}];
    

    Promise.all(promises).then((dataurls,i)=>{
        chunk(dataurls,positions.length).forEach((c,page)=>{
            if (page) doc.addPage();
            doc.setDrawColor(255,255,255);
            doc.setLineWidth(0.01)
            c.forEach((dataURL,j)=>{
                doc.addImage(dataURL,'JPEG',MARGIN_X+positions[j].x,MARGIN_Y+positions[j].y,CARD_WIDTH,CARD_HEIGHT)
            })
            dottedLine(doc,MARGIN_X+CARD_WIDTH/2,0,MARGIN_X+CARD_WIDTH/2,PAGE_HEIGHT,0.05)
            dottedLine(doc,MARGIN_X+CARD_WIDTH,0,MARGIN_X+CARD_WIDTH,PAGE_HEIGHT,0.01)
            dottedLine(doc,MARGIN_X+CARD_WIDTH/2*3,0,MARGIN_X+CARD_WIDTH/2*3,PAGE_HEIGHT,0.05)
            dottedLine(doc,0,MARGIN_Y+CARD_HEIGHT+CARD_OFFSETY,PAGE_WIDTH,MARGIN_Y+CARD_HEIGHT+CARD_OFFSETY,0.01)
        })
        doc.save(fileName+'.pdf')
    })

}


export class Toolbar extends React.Component {
    render(){
        return <div className="ui paper editorToolBar">
                <h2 className="din" style={{textAlign:"center", marginBottom:0}}>7TV Studios</h2>
                <h5 className="din" style={{textAlign:"center", marginTop:0}}> casting agency</h5>
               <div style={{margin:5}}>
               <DropdownButton bsStyle="primary" bsSize="small" title="New"  id="new_model" >
                <MenuItem eventKey="1" onClick={e=>this.props.dispatch({ type: 'CHARACTER_NEW' })}>Character</MenuItem>
                <MenuItem eventKey="2" onClick={e=>this.props.dispatch({ type: 'CHARACTER_NEW', payload:{ __card:'vehicle'} })}>Vehicle</MenuItem>
                <MenuItem eventKey="3" onClick={e=>this.props.dispatch({ type: 'CHARACTER_NEW', payload:{ __card:'unit'} })}>Unit</MenuItem>
               </DropdownButton>
              
                
                <FileField style={{display:"block",margin: "5px 0 5px 0"}} accept=".yaml" onChange={e => loadCharacter(e, (file) => this.props.dispatch({ type: 'CHARACTER_LOAD', payload: file }))}><Button block  bsSize="small" bsStyle="success"><Glyphicon glyph="upload" /> Load .Yaml</Button></FileField>
                
                <Button block bsSize="small" onClick={e=>downloadCharacters(this.props.cast)} bsStyle="warning"><Glyphicon glyph="download" /> Download as .Yaml</Button>
                <Button block bsSize="small" onClick={e=>downloadCharactersAsImages(this.props.cast)} bsStyle="danger"><Glyphicon glyph="download" /> Download as Single Images</Button>
                <Button block bsSize="small" onClick={e=>downloadCharactersAsPDF(this.props.cast)} bsStyle="danger"><Glyphicon glyph="download" /> Download as PDF</Button>
                <Button block bsSize="small" onClick={e=> {if (confirm('Are you sure? This will wipe all the current cards! It is a bloody nuke!')) this.props.dispatch({type: 'CAST_CLEAR'});}} bsStyle="info"><Glyphicon glyph="trash" /> Reset all</Button>
               </div>
            
        </div>
    }
}

Toolbar = connect(
    (state)=>{return {cast: state.cast}}
)(Toolbar);


export class Help extends React.Component {

    constructor(...args) {
        super(...args);
        this.state = {
          open: false,
        };
    }

    render(){
        return <div className="ui paper" style={{margin:5}} >

       
        <Button block bsSize="small" onClick={() => this.setState({ open: !this.state.open })} bsStyle="default">Help</Button>
        <Collapse in={this.state.open}><div className="help" dangerouslySetInnerHTML={{__html:marked(require("!raw-loader!../HELP.md"))}} ></div></Collapse>


      </div>
    }
}

const downloadSnapshot=function(state)
{
    let d=new Date();
    sendAsFile("7TV-debug-"+d+".json",JSON.stringify(state),'application/json');
}


export class Rescue extends React.Component {
    render(){
        return <div className="ui paper"> <DropdownButton bsStyle="primary" bsSize="xsmall" title="Debug"  id="new_model" dropup >
            <MenuItem eventKey="1" onClick={e=>downloadSnapshot(this.props.state)}>Download data snapshot</MenuItem>
       </DropdownButton></div>
    }
}

Rescue = connect((state)=>({state}))(Rescue);