/* eslint-disable */
import React from 'react'
import {connect} from 'react-redux'
import {DropdownButton, MenuItem} from 'react-bootstrap';
import slug from 'slug';
import '../assets/fonts/din-cond/style.css';
import '../assets/fonts/veneer3/style.css';
import '../assets/card.scss'
import {sendAsImage} from '../lib/helpers'
import Yaml from "js-yaml"

import {T, zip} from '../index'


import {downloadSingleCharacter, Marked} from './Ui'

const stripUndefinedKeys = (obj)=>{
    if (typeof obj !== 'object') return obj;

    obj = Object.entries(obj).reduce((acc, [key, value]) => {
        if (typeof value!=='undefined') return Object.assign({}, acc, { [key]: value });
        return acc;
    },{})
    return obj;
}

const stats = { fight: 10, shoot: 10, defence: 10, mind: 10, body: 10, spirit: 10 };



const StatBlock = ({ stats, className="", zero='0', ...rest }) => {
    return <div className={"stats " + className}>
        {Object.entries(stats).map((entry, i) => {
            let [key, value] = entry;
            return <div key={i} className={key}><div>{key}</div><div><var>{(value)?value:zero}</var></div></div>
        })}
    </div>
}

const Pic = ({ photo, className, ...rest }) => {
    let style=photo? {backgroundImage: "url("+photo+")"}:{};
    return <div className={['pic',className].join(" ")} style={style}><img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" style={{filter:`hue-rotate(${rest.tint}deg)`}}/></div>
}



const Weapons = ({ items }) => {

    let colspan=(items.length && typeof items[0].effects =='object')? Object.keys(items[0].effects).length : 1





    return <table className="weapons">
        <thead><tr><td rowSpan="2" className="attack">Attack</td><td  className="range" rowSpan="2">Range</td><td rowSpan="2" className="strike">Strike</td><td className="effects" colSpan={colspan}>Effects</td></tr>
                { (items.length && typeof items[0].effects =='object') ? (<tr>{ Object.keys(items[0].effects).map((key,i)=>{ return <td key={i} className={key}>{key}</td>})}</tr>) : undefined }
            </thead>
        <tbody>
            {items.map((item, i) => {

                item  = {effects: '', attack:'', ...stripUndefinedKeys(item)}

                let effects=typeof item.effects == 'string' ? {effects: item.effects} : item.effects;

                return <tr className={slug(item.type||"").toLowerCase()} key={i}>
                    <td className="attack" dangerouslySetInnerHTML={item.attack.length? {__html:item.attack}:{__html:"&nbsp;"}}></td><td className="range">{item.range}</td><td className="strike">+{item.strike}</td>
                    { Object.entries(effects).map((entry,i)=>{
                        let [key,value] = entry;
                        return <Marked key={i} Component='td' className={key} md={value} Options={{inline:true}}/>

                    }) }

                </tr>
            })}
        </tbody>
    </table>
}

class ModsTable extends React.Component {

    constructor(props){
        super(props);
        this.state={mods:{}}
    }
    componentDidMount()
    {
        fetch(require('../data/mods.yaml')).then((response)=>{
            response.text().then(function(txt){
                this.setState({mods: Yaml.safeLoad(txt)||{}});
            }.bind(this))
        })
    }

    classify(){
        let list = {}

        if (typeof this.props.character.type=='object' ){
            let [name,ratings] =  Object.entries(this.props.character.type)[0]
            list['vehicle']=[{ratings, name}];
        }
        this.props.character.mods.forEach((item)=>{
            if (list[item.location]==undefined)
                list[item.location]=[];
            list[item.location].push(item);
        })
        return list
    }

    render(){
        return <div className="mods">{Object.entries(this.classify()).map((entry,i)=>{
            return <table key={i}><thead><tr><th>{entry[0]}<CheckRibbon className={entry[0].toLowerCase()}   stat={this.props.character.stats[entry[0].toLowerCase()]}/></th><td>Ratings</td></tr></thead><tbody>
            {entry[1].map((mod,j)=>{
                let indent=(/^([ ]+)/gi.exec(mod.name))
                return <tr key={j} className={mod.mounted?"mounted":""}><td className={["name",indent?"indent":""].join(" ")}>{mod.name.replace(/^[ ]*/gi,'')}</td><td className="ratings">{mod.ratings}</td></tr>
            })}
            </tbody></table>
        })}</div>
    }
}



const Ratings = ({ value }) => {
    let rx = /([0-9]+)\s\(([^)]*)\)/.exec(value);
    if (rx!=null){
        return <div className="ratings"><var data-extra={rx[2]}>{rx[1]}</var> <span> RATINGS</span></div>
    }
    return <div className="ratings"><var>{value}</var> <span> RATINGS</span></div>
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
    let _type = typeof type == 'object'? Object.keys(type)[0] : type;
    return <div className="title"><strong>{name}</strong> <i className={_type.toLowerCase()} /> <span>{alignment} {_type}</span></div>
}

const Tags = ({ values, additional=[] }) => {

    return <div className="tags">{values.filter(i=>i).map((v, i) => {
        if (typeof (v) == 'string')
            return <i key={i} className={"icon-genre-core-" + slug(v||"").toLowerCase()}></i>
        return <i key={i} className={`font-7tv2-${v.category}`}>{v.chr}</i>
    })}
    {(additional || []).filter(i=>i).map((v, i) => { return <img key={i +values.length} src={v.src} alt="" /> })}
    </div>
}

const CheckRibbon = ({stat, className})=>{
    let slots = Array(Number(stat||0)).fill("").map((v, i) => { return <div key={i}></div> })
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
            case "gadget_small":
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

        return <div className="cellophan"><div className={[theme,"card",card,"front"].join(' ')}>
        <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
        <div className="foreground">
            <Title name={name} type={type} />
            <Pic photo={photo} tint={__tint}/>
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
        let { health=0,  name,   photo, description="",weapons=[], __custom,ratings, type } = this.props.character
        let __tint = __custom? __custom.tint : 0
        let __genres= __custom ? __custom.genres: null
        let tags = this.props.character.genres||[]
        let sfx = this.props.character.special_effects || [];
        let { move=0, defence=0, armour=0, capacity=0, hood=0, body=0, engine=0, trunk=0, chassis=0 } = this.props.character.stats;
        let vehicle=Object.keys(type)[0].toLowerCase();

        return <div className="cellophan"><div className={[theme,"card",card,"front"].join(' ')}>
        <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
        <div className="foreground">
            <Title name={name}/>
            <Pic className={vehicle} photo={photo}/>
            <div className="contentblock">
            <StatBlock stats={{move, armour, defence, capacity }} zero="-" />
            {weapons.length? <Weapons items={weapons} />:<Description text={description}/>}
            <StatBlock className="gear" stats={{parked:"parked",slow:"slow",fast:"fast",reverse:"reverse"}} />
            </div>
             <CheckRibbon className="health"   stat={health}/>
            <Ratings value={ratings} />
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

        return <div className="cellophan"><div className={[theme,"card",card,"front",role.toLowerCase(), type.toLowerCase()].join(' ')}>
             <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
            <div className="foreground" >
            <Title name={name} alignment={T(role)} type={type} />
            <Pic photo={photo} tint={__tint}/>
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

    renderGadget(card, theme){
        let qlty = this.props.character.star_quality
        let sfx = this.props.character.special_effects;
        let { health, ratings, weapons, name, role, type, notes='',__custom } = this.props.character
        let __tint = __custom? __custom.tint : 0
        return <div className="cellophan"><div className={["card",card,"front",theme].join(' ')}>
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
            case "gadget_small":
                return this.renderGadget(card,theme)
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
                {weapons.length && description? (<header>Description</header>):undefined}
                {weapons.length && description? (<Description text={description}/>):undefined}
                {sfx.length? (<header>Special effects</header>):undefined}
                {sfx.map((v, i) => (<Trait key={i} object={v} full />))}
                {notes? (<header>Notes</header>):undefined}
                <p>{notes}</p>
            </section>

        </div>
        </div></div>
    }

    renderVehicleLarge(card,theme){
        let sfx = this.props.character.special_effects||[];
        let {
            name, type="",notes="",weapons=[], description="", __custom, ratings, photo,
            hood, trunk, body, chassis, engine
            } = this.props.character
        let __tint = __custom? __custom.tint : 0
        let vehicle=Object.keys(type)[0].toLowerCase();

        return <div className="cellophan"><div className={[theme,"card",card,"back",].join(' ')}>
        <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
        <div className="foreground">
            <Title name={name}  />
            <Pic className={vehicle} photo={photo} tint={__tint}/>
            <section>
                {weapons.length && description? (<header>Description</header>):undefined}
                {weapons.length && description? (<Description text={description}/>):undefined}
                {sfx.length? (<header>Special effects</header>):undefined}
                {sfx.map((v, i) => (<Trait key={i} object={v} full />))}
                {notes? (<header>Notes</header>):undefined}
                <p>{notes}</p>
            </section>
            <ModsTable character={this.props.character}/>

            <div className="totalratings">{T('Total Vehicle Ratings')} <Ratings value={ratings} /></div>
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
                <Pic photo={photo} tint={__tint}/>
            </div>
            </div>
        </div></div>
    }

    renderModel(card,theme) {
        let qlty = this.props.character.star_quality
        let sfx = this.props.character.special_effects;
        let { health, ratings, weapons, name, role, type, notes='',__custom } = this.props.character
        let __tint = __custom? __custom.tint : 0


        return <div className="cellophan"><div className={[theme,"card",card,"back",role.toLowerCase(), type.toLowerCase()].join(' ')}>
            <div className="background" style={{filter:`hue-rotate(${__tint}deg)`}}></div>
            <div className="foreground">
            <Title name={name} alignment={T(role)} type={type} />

            <section>
                {qlty.length? <header>Star quality</header> :undefined}
                {qlty.map((v, i) => (<Trait key={i} object={v} full />))}
                {sfx.length? <header>Special effects</header> : undefined}
                {sfx.map((v, i) => (<Trait key={i} object={v} full />))}
                {notes && (<header>Notes</header>)}
                <p>{notes}</p>
            </section>
            </div>
        </div></div>
    }

    renderGadget(card,theme){
        let { name, play, weapon, cost, description,__custom } = this.props.character

        let strike = (weapon.length)?weapon[0].strike:''
        let range = (weapon.length)?weapon[0].range:''

        let __tint = __custom? __custom.tint : 0

        let stars = cost ? Array(cost).fill("").map((v, i) => { return <i key={i} className="icon-star_icon"></i> }) : "Free"

        let stats = zip(Object.entries({play, cost:stars, range, strike}).filter((i)=>{
            let [key,value] = i;
            return String(value!==undefined? value:"").length
        }))

        return <div className="cellophan"><div className={["card",card,"back",theme].join(' ')}>
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
            <MenuItem eventKey="3" onClick={e => { sendAsImage(id, "7TV_cast-"+slug(this.props.character.name||this.props.character.id)+".png")}}>Download as Single Image</MenuItem>
            <MenuItem eventKey="4" onClick={e => { sendAsImage(id, "7TV_cast-"+slug(this.props.character.name||this.props.character.id)+"_{n}.png",{selector:'.cellophan'})}}>Download as Separate Images</MenuItem>
            </DropdownButton></div></div>)
    }
}

Card = connect((state)=>{
    return { currentCharacter: state.currentCharacter}
})(Card);