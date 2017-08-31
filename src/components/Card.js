/* eslint-disable */
import React from 'react'
import { connect } from 'react-redux'
import { DropdownButton, MenuItem} from 'react-bootstrap';
import slug from 'slug';
import '../assets/fonts/din-cond/style.css';
import '../assets/card.css'
import { sendAsFile } from '../lib/helpers'

import { downloadSingleCharacter } from './Ui'

const stats = { fight: 10, shoot: 10, defence: 10, mind: 10, body: 10, spirit: 10 };

const StatBlock = ({ stats, className, ...rest }) => {
    return <div className={"stats " + className}>
        {Object.entries(stats).map((entry, i) => {
            let [key, value] = entry;
            return <div key={i} className={key}><div>{key}</div><div>{value}</div></div>
        })}
    </div>
}

const Pic = ({ photo, ...rest }) => {
    return <div className="pic" style={{backgroundImage: "url("+photo+")"}} />
}



const Weapons = ({ items }) => {
    return <table className="weapons">
        <thead><tr><td>Attack</td><td>Range</td><td>Strike</td><td>Effects</td></tr></thead>
        <tbody>
            {items.map((item, i) => {
                return <tr className={slug(item.type||"").toLowerCase()} key={i}>
                    <td className="attack">{item.attack}</td><td className="range">{item.range}</td><td className="strike">{item.strike}</td><td className="effects">{item.effects}</td>
                </tr>
            })}
        </tbody>
    </table>
}

const Ratings = ({ value }) => {
    return <div className="ratings"><strong><val>{value}</val> RATINGS</strong></div>
}


const Health = ({ value }) => {
    let health = Array(Number(value)).fill("").map((v, i) => { return <div key={i}></div> })
    return <div className="health">{health}</div>
}

const Trait = ({ object, full }) => {
    let { cost, name, level, description } = object
    let stars = cost ? Array(cost).fill("").map((v, i) => { return <i key={i} className="icon-star_icon"></i> }) : undefined
    if (full) {
        return <div>
            <p><strong>{name}{level ? ` (${level})` : ''}{stars ? " " : ""}{stars}</strong><br />{description}</p>
        </div>
    }
    return <span>{name}{level ? ` (${level})` : ''}{stars ? " " : ""}{stars}</span>
}

const Title = ({ name, alignment, type }) => {
    return <div className="title"><strong>{name}</strong> <i className={type.toLowerCase()} /> <span>{alignment} {type}</span></div>
}

const Tags = ({ values }) => {
    return <div className="tags">{values.map((v, i) => { 
        return <i key={i} className={"icon-" + slug(v||"").toLowerCase()}></i> 
    })}</div>
}

export class CardFront extends React.Component {
    render() {

        let { fight = 0, shoot = 0, defence = 0, mind = 0, body = 0, spirit = 0 } = this.props.character.stats;
        let { health, ratings, weapons, name, role, type, photo } = this.props.character

        let qlty = this.props.character.star_quality
        let sfx = this.props.character.special_effects;
        let tags = this.props.character.genres


        return <div className="cellophan"><div className="card front">
            <Title name={name} alignment={role} type={type} />
            <Pic photo={photo}/>
            <StatBlock className="left" stats={{ fight, shoot, defence }} />
            <StatBlock className="right" stats={{ mind, body, spirit }} />
            <div className="sfxribbon">
                <dl><dt>Star quality</dt><dd>{qlty.map((s, i) => (<Trait key={i} object={s} />))}</dd></dl>
                <dl><dt>Special effects</dt><dd>{sfx.map((s, i) => (<Trait key={i} object={s} />))}</dd></dl>
            </div>
            <Weapons items={weapons} />
            <Ratings value={ratings} />
            <Health value={health} />
            <Tags values={tags} />
        </div></div>

    }
}

export class CardBack extends React.Component {

    render() {

        let qlty = this.props.character.star_quality
        let sfx = this.props.character.special_effects;

        let { health, ratings, weapons, name, role, type, notes } = this.props.character

        return <div className="cellophan"><div className="card back">
            <Title name={name} alignment={role} type={type} />

            <section>
                {qlty.length? <heading>Star quality</heading> :undefined} 
                {qlty.map((v, i) => (<Trait key={i} object={v} full />))}
                {sfx.length? <heading>Special effects</heading> : undefined}
                {sfx.map((v, i) => (<Trait key={i} object={v} full />))}
                {notes.length? <heading>Notes</heading> : undefined}
                {notes.length? notes : undefined}
            </section>

        </div></div>

    }
}



export class Card extends React.Component {
    render() {
        let id = this.props.character.id;
        return (<div 
            className={"viewport "+((id == this.props.currentCharacter)?"selected":"")} data-id={id} 
            onClick={e =>  {e.preventDefault(); this.props.dispatch({ type: 'CHARACTER_SELECT', payload: { id } })}}
         >
            <CardFront character={this.props.character} />
            <CardBack character={this.props.character} />
            <div className="ui paper" style={{position:"absolute", right:0}}>

            <DropdownButton bsSize="xsmall" title="" bsStyle="warning" id={"ddb-"+id} >
            <MenuItem eventKey="1" onClick={e => {this.props.dispatch({ type: 'CHARACTER_REMOVE', payload: { id } })}}>Remove</MenuItem>
            <MenuItem eventKey="2" onClick={e => { downloadSingleCharacter(this.props.character)}}>Download</MenuItem>
            </DropdownButton></div></div>)
    }
}

Card = connect((state)=>{
    return { currentCharacter: state.currentCharacter}
})(Card);