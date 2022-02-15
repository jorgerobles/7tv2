/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux'
import Queue from 'promise-queue';
import ReactDOM from 'react-dom';
import { marked } from 'marked';
import { loadYamlFile, saveYamlFile } from '../reducers/index';
import { SplitButton, MenuItem, Button, ButtonToolbar, Glyphicon, DropdownButton, Collapse} from 'react-bootstrap';
import { sendAsFile, sendAsImage, getAsImage } from '../lib/helpers'
import slug from 'slug';
import jsPDF from 'jspdf';
import '../assets/fonts/din-cond/style.css';

import { resolve } from 'path';
import sortBy from 'sort-by'
import { range } from 'rxjs';

const PAGE_WIDTH=10.55;
const PAGE_HEIGHT=7.55;
const MARGIN_X=0.3;
const MARGIN_Y=0.3;
const CARD_WIDTH=5;
const CARD_HEIGHT=3.5;
const CARD_OFFSETX=0;
const CARD_OFFSETY=-0.03

export class FileField extends React.Component {

    constructor(props) {
        super(props);
        this._domclick = function (ce) {
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

const getImageDimensions= (file) => {
    return new Promise (function (resolved, rejected) {
      var i = new Image()
      i.onload = function(){
        resolved({w: i.width, h: i.height})
      };
      i.src = file
    })
  }

export const downloadCharactersAsPDF=(cast,fileName='7TVcast',status=console.warn)=>{

    

    let doc = new jsPDF({orientation: 'landscape',format:[PAGE_WIDTH,PAGE_HEIGHT],unit:'in'});
        
        

    var i=0;
    let promises=cast.sort(sortBy('__card')).map((item)=>{
        return new Promise((rs,rj)=>{
            getAsImage(document.getElementById(item.id),{scale:2}).then((img)=>{
                status("Processing image "+(++i)+"/"+cast.length);
                rs({dataURL: img,type:item.__card.replace(/.*_(.*)$/,'$1')})
            });
    })});
    
    

    Promise.all(promises).then((items)=>{
        chunk(items,0,(i,p)=>{return i.type!==p.type;}).forEach((c,cn)=>{ 
            let positions = cardGrid(c[0].type);
            chunk(c,positions.length).forEach((itemsperpage,page)=>{
                
                status("Generating page "+(page+1))
                if (cn||page) doc.addPage();
                itemsperpage.forEach((item,j)=>{
                    let {dataURL,type} = item;
                    let [fw,fh] = cardFactor(type);
                    doc.addImage(dataURL,'JPEG',positions[j].x,positions[j].y,CARD_WIDTH*fw,CARD_HEIGHT*fh)
                })
                cardCuts(c[0].type,doc)
            });


        });
        doc.save(fileName+'.pdf')
        status(null)
       
    })

}

const chunk = (r,j,fn=(i)=>{return false;}) => r.reduce((a,b,i,g) => {
    if (!i || j&&(!(a[a.length-1].length % j)) ||  (fn(b,g[!i?i:i-1]))) a.push([])
        a[a.length-1].push(g[i])
    return a;
}, []);


const cardGrid=function(type){

    let [fw,fh] = cardFactor(type);

    switch(type){
        case 'small': 
            return Array.from(Array(8).keys()).map((v)=>({x:(v%2)*CARD_WIDTH*fw+MARGIN_X, y: Math.floor(v/2)*CARD_HEIGHT*fh+MARGIN_Y}));
        break;
        case 'large': 
            return Array.from(Array(2).keys()).map((v)=>({x:(v%2)*CARD_WIDTH*fw+MARGIN_X, y: Math.floor(v/2)*CARD_HEIGHT*fh+MARGIN_Y}));
        break;
        default: 
            return Array.from(Array(4).keys()).map((v)=>({x:(v%2)*CARD_WIDTH*fw+MARGIN_X, y: Math.floor(v/2)*CARD_HEIGHT*fh+MARGIN_Y}));
        break;
    } 
}

const cardCuts=function(type,doc){
    doc.setLineWidth(0.01)
    doc.setDrawColor(255,255,255);
    switch(type){
        case 'large':
            dottedLine(doc,0,MARGIN_Y+CARD_HEIGHT+CARD_OFFSETY,PAGE_WIDTH,MARGIN_Y+CARD_HEIGHT+CARD_OFFSETY,0.01)
        break;
        default:
            dottedLine(doc,MARGIN_X+CARD_WIDTH/2,0,MARGIN_X+CARD_WIDTH/2,PAGE_HEIGHT,0.05)
            dottedLine(doc,MARGIN_X+CARD_WIDTH,0,MARGIN_X+CARD_WIDTH,PAGE_HEIGHT,0.01)
            dottedLine(doc,MARGIN_X+CARD_WIDTH/2*3,0,MARGIN_X+CARD_WIDTH/2*3,PAGE_HEIGHT,0.05)
            dottedLine(doc,0,MARGIN_Y+CARD_HEIGHT+CARD_OFFSETY,PAGE_WIDTH,MARGIN_Y+CARD_HEIGHT+CARD_OFFSETY,0.01)
        break;
    }
}

const cardFactor=function(type){
    switch(type){
        case 'small': return [1,0.5]; break;
        case 'large': return [1,2]; break;
        default: return [1,1];
    } 
}


export const Marked = ({md="", Component="span", Options={},...rest})=>{
    let __html=marked(md,Options);
        if (Options.inline) __html=__html.replace(/^<p>/gi,'').replace(/<\/p>[\r\n]*$/gi,'').replace(/[\r\n]/gi,'')
    return <Component {...{...rest}} dangerouslySetInnerHTML={{__html}}/>
}


export class Toolbar extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {
          status: null,
        };
    }

    status(status){
        this.setState({status: status? "("+status+")":''}); 
        this.forceUpdate();
    }

    render(){

        return <div className="ui paper editorToolBar">
                <h2 className="din" style={{textAlign:"center", marginBottom:0}}>7TV Studios</h2>
                <h5 className="din" style={{textAlign:"center", marginTop:0}}> casting agency</h5>
               <div style={{margin:5}}>
               <DropdownButton bsStyle="primary" bsSize="small" title="New"  id="new_model" >
                <MenuItem eventKey="1" onClick={e=>this.props.dispatch({ type: 'CHARACTER_NEW' })}>Character</MenuItem>
                <MenuItem eventKey="2" onClick={e=>this.props.dispatch({ type: 'CHARACTER_NEW', payload:{ __card:'vehicle'} })}>Vehicle</MenuItem>
                <MenuItem eventKey="3" onClick={e=>this.props.dispatch({ type: 'CHARACTER_NEW', payload:{ __card:'vehicle_large'} })}>Extended Vehicle</MenuItem>
                <MenuItem eventKey="4" onClick={e=>this.props.dispatch({ type: 'CHARACTER_NEW', payload:{ __card:'unit'} })}>Unit</MenuItem>
                <hr/>
                <MenuItem eventKey="5" onClick={e=>this.props.dispatch({ type: 'CHARACTER_NEW', payload:{ __card:'gadget_small'} })}>Gadget</MenuItem>
               </DropdownButton>
              
                
                <FileField style={{display:"block",margin: "5px 0 5px 0"}} accept=".yaml" onChange={e => loadCharacter(e, (file) => this.props.dispatch({ type: 'CHARACTER_LOAD', payload: file }))}><Button block  bsSize="small" bsStyle="success"><Glyphicon glyph="upload" /> Load .Yaml</Button></FileField>
                
                <Button block bsSize="small" onClick={e=>downloadCharacters(this.props.cast)} bsStyle="warning"><Glyphicon glyph="download" /> Download as .Yaml</Button>
                <Button block bsSize="small" onClick={e=>downloadCharactersAsImages(this.props.cast)} bsStyle="danger"><Glyphicon glyph="download" /> Download as Single Images</Button>
                <Button block bsSize="small" onClick={e=>downloadCharactersAsPDF(this.props.cast, null,this.status.bind(this))} bsStyle="danger"><Glyphicon glyph="download" /> Download as PDF {this.state.status}</Button>
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