/* eslint-disable */
import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { DropdownButton, MenuItem} from 'react-bootstrap';
import slug from 'slug';
import '../assets/fonts/din-cond/style.css';
import '../assets/card.scss'
import { sendAsFile, sendAsImage } from '../lib/helpers'

import {T,zip} from '../index'



import { downloadSingleCharacter, Marked } from './Ui'
import { isString } from 'util';



const stats = { fight: 10, shoot: 10, defence: 10, mind: 10, body: 10, spirit: 10 };



const StatBlock = ({ stats, className="", ...rest }) => {
    return <div className={"stats " + className}>
        {Object.entries(stats).map((entry, i) => {
            let [key, value] = entry;
            return <div key={i} className={key}><div>{key}</div><div><var>{value}</var></div></div>
        })}
    </div>
}

const Pic = ({ photo, ...rest }) => {
    return <div className="pic" style={{backgroundImage: "url("+photo+")"}} />
}



const Weapons = ({ items }) => {

    let colspan=items.length? Object.keys(items[0].effects).length : 1

    return <table className="weapons">
        <thead><tr><td rowSpan="2" className="attack">Attack</td><td  className="range" rowSpan="2">Range</td><td rowSpan="2" className="strike">Strike</td><td className="effects" colSpan={colspan}>Effects</td></tr>
                { (items.length && typeof items[0].effects =='object') ? (<tr>{ Object.keys(items[0].effects).map((key,i)=>{ return <td key={i} className={key}>{key}</td>})}</tr>) : undefined }
            </thead>
        <tbody>
            {items.map((item, i) => {
                let effects=isString(item.effects)? {effects: item.effects} : item.effects;
                return <tr className={slug(item.type||"").toLowerCase()} key={i}>
                    <td className="attack">{item.attack}</td><td className="range">{item.range}</td><td className="strike">+{item.strike}</td>
                    { Object.entries(effects).map((entry,i)=>{
                        let [key,value] = entry;
                        return <Marked key={i} Component='td' className={key} md={value} Options={{inline:true}}/>

                    }) }
                    
                </tr>
            })}
        </tbody>
    </table>
}

const Ratings = ({ value }) => {
    return <div className="ratings"><strong><val>{value}</val> RATINGS</strong></div>
}




const Trait = ({ object, full }) => {
    let { cost, name, level, description } = object
    let stars = cost ? Array(cost).fill("").map((v, i) => { return <i key={i} className="icon-star_icon"></i> }) : undefined
    if (full) {
        return <p><strong><Marked md={name} Options={{inline:true}}/>{level ? ` (${level})` : ''}{stars ? " " : ""}{stars}</strong><br /><Marked md={description}/></p>
        
    }
    return <span>{name}{level ? ` (${level})` : ''}{stars ? " " : ""}{stars}</span>
}

const Description = ({text}) =>{
    return <p className="description"><Marked md={text}/></p>
}

const Title = ({ name="", alignment="", type="" }) => {
    return <div className="title"><strong>{name}</strong> <i className={type.toLowerCase()} /> <span>{alignment} {type}</span></div>
}

const Tags = ({ values, additional=[] }) => {
    return <div className="tags">{values.map((v, i) => { 
        return <i key={i} className={"icon-" + slug(v||"").toLowerCase()}></i> 
    })}{(additional||[]).map((v,i)=>{
        return <img key={i+values.length} src={v} /> 
    })}</div>
}

const CheckRibbon = ({stat, className})=>{
    let slots = Array(Number(stat)).fill("").map((v, i) => { return <div key={i}></div> })
    return <div className={["checkribbon",className].join(' ')}>{slots}</div>
}

export class CardFront extends React.Component {
    render() {
        const card = (this.props.character.__card||"Model").toLowerCase()
        const theme = (this.props.character.__theme||"core").toLowerCase()
        switch(card) {
            case "vehicle":
                return this.renderVehicle(card,theme)
            break;
            case "vehicle_large":
                return this.renderVehicleLarge(card,theme)
            break;
            case "unit":
                return this.renderUnit(card,theme)
            break;
            case "gadget":
                return this.renderGadget(card)
            break;
            default:
                return this.renderModel(card,theme)
            break;
        }
    }

    renderVehicle(card,theme)
    {
        let { health=0, ratings=0,name, type, photo, description="",weapons=[], __custom } = this.props.character
        let __tint = __custom? __custom.tint : 0
        let __genres= __custom ? __custom.genres: null
        let tags = this.props.character.genres||[]
        let sfx = this.props.character.special_effects || [];
        let { capacity=0, armour=0, defence=0 } = this.props.character.stats;

        return <div className="cellophan"><div className={[theme,"card",card,"front",].join(' ')}>
        <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
        <div className="foreground">
            <Title name={name} type={type} />
            <Pic photo={photo}/>
            <StatBlock stats={{ capacity, armour, defence }} />
            {weapons.length? <Weapons items={weapons} />:<Description text={description}/>}
            <div className="sfxribbon">
                <dl><dt>Special effects</dt><dd>{sfx.map((s, i) => (<Trait key={i} object={s} />))}</dd></dl>
            </div>
            <Ratings value={ratings} />
            <CheckRibbon stat={health} className="health" />
            <Tags values={tags} additional={__genres} />
        </div>
        </div></div>
    }

    renderVehicleLarge(card,theme)
    {
        let { health=0,  name,   photo, description="",weapons=[], __custom } = this.props.character
        let __tint = __custom? __custom.tint : 0
        let __genres= __custom ? __custom.genres: null
        let tags = this.props.character.genres||[]
        let sfx = this.props.character.special_effects || [];
        let { move=0, defence=0, armour=0, capacity=0, hood=0, body=0, engine=0, trunk=0, chassis=0 } = this.props.character.stats;
        

        return <div className="cellophan"><div className={[theme,"card",card,"front",].join(' ')}>
        <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
        <div className="foreground">
            <Title name={name}/>
            <Pic photo={photo}/>
            <div className="contentblock">
            <StatBlock stats={{move, defence }} />
            {weapons.length? <Weapons items={weapons} />:<Description text={description}/>}
            <StatBlock stats={{ armour, capacity }} />
            </div>
            <CheckRibbon className="hood"   stat={hood}/>
            <CheckRibbon className="body"   stat={body}/>
            <CheckRibbon className="chassis"  stat={chassis}/>
            <CheckRibbon className="trunk"   stat={trunk}/>
            <CheckRibbon className="engine"  stat={engine}/>
            <CheckRibbon className="health"   stat={health}/>

        </div>
        </div></div>
    }

    renderUnit(card,theme)
    {
        let {__custom} = this.props.character;
        let __tint = __custom? __custom.tint : 0
        return <div className="cellophan"><div className={[theme,"card",card,"front",].join(' ')}>
        <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
        <div className="foreground"></div>
        </div></div>
    }

    renderModel(card,theme) {
        let { fight = 0, shoot = 0, defence = 0, mind = 0, body = 0, spirit = 0 } = this.props.character.stats;
        let { health, ratings, weapons, name, role, type, photo, __custom } = this.props.character
        let __tint = __custom? __custom.tint : 0
        let qlty = this.props.character.star_quality
        let sfx = this.props.character.special_effects;
        let tags = this.props.character.genres || []
        let __genres= __custom ? __custom.genres: null
        
        
        return <div className="cellophan"><div className={[theme,"card",card,"front",].join(' ')}>
             <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
            <div className="foreground" >
            <Title name={name} alignment={T(role)} type={type} />
            <Pic photo={photo}/>
            <StatBlock className="left" stats={{ fight, shoot, defence }} />
            <StatBlock className="right" stats={{ mind, body, spirit }} />
            <div className="sfxribbon">
                <dl><dt>Star quality</dt><dd>{qlty.map((s, i) => (<Trait key={i} object={s} />))}</dd></dl>
                <dl><dt>Special effects</dt><dd>{sfx.map((s, i) => (<Trait key={i} object={s} />))}</dd></dl>
            </div>
            <Weapons items={weapons} />
            <Ratings value={ratings} />
            <CheckRibbon stat={health} className="health" />
            <Tags values={tags} additional={__genres} />
            </div>
        </div></div>
    }

    renderGadget(card){
        let qlty = this.props.character.star_quality
        let sfx = this.props.character.special_effects;
        let { health, ratings, weapons, name, role, type, notes='',__custom } = this.props.character
        let __tint = __custom? __custom.tint : 0
        return <div className="cellophan"><div className={"card "+card+" front"}>
            <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
            <div className="foreground" ></div>
        </div></div>
    }
    
}

export class CardBack extends React.Component {

    render() {
        const card = (this.props.character.__card||"Model").toLowerCase()
        const theme = (this.props.character.__theme||"core").toLowerCase()
        switch(card) {
            case "vehicle_large":
                return this.renderVehicleLarge(card,theme);
            break;
            case "vehicle":
                return this.renderVehicle(card,theme)
            break;
            case "unit":
                return this.renderUnit(card,theme)
            break;
            case "gadget":
                return this.renderGadget(card)
            break;
            default:
                return this.renderModel(card,theme)
            break;
        }
    }
    renderVehicle(card,theme){
        let sfx = this.props.character.special_effects||[];
        let {name, type="",notes="",weapons=[], description="", __custom} = this.props.character
        let __tint = __custom? __custom.tint : 0
        return <div className="cellophan"><div className={[theme,"card",card,"back",].join(' ')}>
        <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
        <div className="foreground">
            <Title name={name} type={type} />
            <section>
                {weapons.length && description? (<heading>Description</heading>):undefined}
                {weapons.length && description? (<Description text={description}/>):undefined}
                {sfx.length? (<heading>Special effects</heading>):undefined}
                {sfx.map((v, i) => (<Trait key={i} object={v} full />))}
                {notes? (<heading>Notes</heading>):undefined}
                <p>{notes}</p>
            </section>
        </div>
        </div></div>
    }

    renderVehicleLarge(card,theme){
        let sfx = this.props.character.special_effects||[];
        let {name, type="",notes="",weapons=[], description="", __custom} = this.props.character
        let __tint = __custom? __custom.tint : 0
        return <div className="cellophan"><div className={[theme,"card",card,"back",].join(' ')}>
        <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
        <div className="foreground">
            <Title name={name} type={type} />
            <section>
                {weapons.length && description? (<heading>Description</heading>):undefined}
                {weapons.length && description? (<Description text={description}/>):undefined}
                {sfx.length? (<heading>Special effects</heading>):undefined}
                {sfx.map((v, i) => (<Trait key={i} object={v} full />))}
                {notes? (<heading>Notes</heading>):undefined}
                <p>{notes}</p>
            </section>
        </div>
        </div></div>
    }

    renderUnit(card,theme) {
        let {name, role, type="",notes="",models=[], description="", photo, __custom} = this.props.character
        let __tint = __custom? __custom.tint : 0
        let tags = this.props.character.genres || []
        let __genres= __custom ? __custom.genres: null
        return <div className="cellophan"><div className={[theme,"card",card,"back",].join(' ')}>
            <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
            <div className="foreground">
            <Title name={name} alignment={T(role)} type={type} />
            <Tags values={tags} additional={__genres} />
            <div className="content">
                <Description text={description}/>
                {models.map((m,i)=>{return <dl className="model" key={i}><dt>{m.qty}</dt><dd>{m.model}</dd></dl>})}
                <Pic photo={photo}/>
            </div>
            </div>
        </div></div>
    }

    renderModel(card,theme) {
        let qlty = this.props.character.star_quality
        let sfx = this.props.character.special_effects;
        let { health, ratings, weapons, name, role, type, notes='',__custom } = this.props.character
        let __tint = __custom? __custom.tint : 0

       
        return <div className="cellophan"><div className={[theme,"card",card,"back",].join(' ')}>
            <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
            <div className="foreground">
            <Title name={name} alignment={T(role)} type={type} />

            <section>
                {qlty.length? <heading>Star quality</heading> :undefined} 
                {qlty.map((v, i) => (<Trait key={i} object={v} full />))}
                {sfx.length? <heading>Special effects</heading> : undefined}
                {sfx.map((v, i) => (<Trait key={i} object={v} full />))}
                {notes && (<heading>Notes</heading>)}
                <p>{notes}</p>
            </section>
            </div>
        </div></div>
    }

    renderGadget(card){
        let { name, play, weapon, cost, description,__custom } = this.props.character
        
        let strike = (weapon.length)?weapon[0].strike:''
        let range = (weapon.length)?weapon[0].range:''

        let __tint = __custom? __custom.tint : 0

        let stars = cost ? Array(cost).fill("").map((v, i) => { return <i key={i} className="icon-star_icon"></i> }) : "Free"

        let stats = zip(Object.entries({play, cost:stars, range, strike}).filter((i)=>{ 
            let [key,value] = i; 
            return String(value!==undefined? value:"").length
        }))

        return <div className="cellophan"><div className={"card "+card+" back"}>
            <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
            <div className="foreground">
            <Title name={name}  />
            <section className="content">
                <StatBlock stats={{ ...stats }} />
                <Description text={description}/>
            </section>
            </div>
        </div></div>
    }
}



export class Card extends React.Component {
    render() {
        let id = this.props.character.id;
        let r = /_(large|small)$/gi.exec(this.props.character.__card);
        let cardsize = r? r[1]:'standard'
        return (<div 
            className={["viewport",((id == this.props.currentCharacter)?"selected":null),cardsize].join(" ")}
            onClick={e =>  {e.stopPropagation(); this.props.dispatch({ type: 'CHARACTER_SELECT', payload: { id } })}}
         >
            <div  id={id}  >
            <CardFront character={this.props.character} />
            <CardBack character={this.props.character} />
            </div>
            <div className="ui paper" style={{position:"absolute", right:0}}>

            <DropdownButton bsSize="xsmall" title="" bsStyle="warning" id={"ddb-"+id} >
            <MenuItem eventKey="1" onClick={e => {this.props.dispatch({ type: 'CHARACTER_REMOVE', payload: { id } })}}>Remove</MenuItem>
            <MenuItem eventKey="2" onClick={e => { downloadSingleCharacter(this.props.character)}}>Download</MenuItem>
            <MenuItem eventKey="3" onClick={e => { sendAsImage(id, "7TV_cast-"+slug(this.props.character.name||this.props.character.id)+".png",{scale:2})}}>Download as Single Image</MenuItem>
            <MenuItem eventKey="4" onClick={e => { sendAsImage(id, "7TV_cast-"+slug(this.props.character.name||this.props.character.id)+"_{n}.png",{scale:2, selector:'.cellophan'})}}>Download as Separate Images</MenuItem>
            </DropdownButton></div></div>)
    }
}

Card = connect((state)=>{
    return { currentCharacter: state.currentCharacter}
})(Card);