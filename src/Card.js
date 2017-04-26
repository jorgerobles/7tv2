import React from 'react'

import './assets/fonts/din-cond/style.css';
import './assets/card.css'

const stats = { fight: 10, shoot: 10, defence: 10, mind: 10, body: 10, spirit: 10 };

const StatBlock = ({ stats, className, ...rest }) => {
    return <div className={"stats " + className}>
        {Object.entries(stats).map((entry, i) => {
            let [key, value] = entry;
            return <div key={i} className={key}><div>{key}</div><div>{value}</div></div>
        })}
    </div>
}

const Pic = ({ ...rest }) => {
    return <div className="pic" />
}



const Weapons = ({ items }) => {
    return <table className="weapons">
        <thead><tr><td>Attack</td><td>Range</td><td>Strike</td><td>Effects</td></tr></thead>
        <tbody>
            {items.map((item, i) => {
                return <tr className={item.type} key={i}>
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
    let health = Array(value).fill("").map((v, i) => { return <div key={i}></div> })
    return <div className="health">{health}</div>
}

const Trait = ({ object, full }) => {
    let { cost, name, level, description } = object
    let stars = cost ? Array(cost).fill("").map((v, i) => { return <i key={i} className="icon-star_icon"></i> }) : undefined
    if (full){
        return <div>
            <h4>{name}{level ? ` (${level})` : ''}{stars ? " " : ""}{stars}</h4>
            <p>{description}</p>
        </div>
    } 
    return <span>{name}{level ? ` (${level})` : ''}{stars ? " " : ""}{stars}</span>
}

const Title = ({ name, alignment, type }) => {
    return <div className="title"><strong>{name}</strong> <i className={type}/> <span>{alignment} {type}</span></div>
}

const Tags = ({ values }) => {
    return <div className="tags">{values.map((v, i) => { return <i key={i} className={"icon-"+v}></i> })}</div>
}

export class CardFront extends React.Component {
    render() {



        let { fight = 0, shoot = 0, defence = 0, mind = 0, body = 0, spirit = 0 } = stats;

        let qlty = [
            { name: "Burst of action", cost: 2, description: `Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do.` }
        ]
        let sfx = [
            { name: "Special", level: 1, description: `The path of the righteous man is beset on all sides by the iniquities of the selfish and the tyranny of evil men. ` },
            { name: "Special", description:`Blessed is he who, in the name of charity and good will, shepherds the weak through the valley of darkness, for he is truly his brother's keeper and the finder of lost children. ` },
            { name: "Repair", description:`And I will strike down upon thee with great vengeance and furious anger those who would attempt to poison and destroy My brothers.` },
            { name: "Unit Leader", level: 2,description:`And you will know My name is the Lord when I lay My vengeance upon thee.` },
            { name: "Cucumber" }
        ];
        let weapons = [
            { type: "melee", attack: "Punch", range: "0", strike: "+5", "effects": "0 Health + Weakened" },
            { type: "range", attack: "Laser Pistol", range: "12", strike: "+5", "effects": "2 Shots, Deadly; Lorem ipsum dolor sit amet " },
        ]

        let name = "Brolin"
        let alignment = "heroic"
        let type = "co-star"

        let tags = ["military", "civilian", "secret"]

        return <div className="cellophan"><div className="card front">
            <Title name={name} alignment={alignment} type={type} />
            <Pic />
            <StatBlock className="left" stats={{ fight, shoot, defence }} />
            <StatBlock className="right" stats={{ mind, body, spirit }} />
            <div className="sfxribbon">
                <dl><dt>Star quality</dt><dd>{qlty.map((s, i) => (<Trait key={i} object={s} />))}</dd></dl>
                <dl><dt>Special effects</dt><dd>{sfx.map((s, i) => (<Trait key={i} object={s} />))}</dd></dl>

            </div>
            <Weapons items={weapons} />
            <Ratings value={30} />
            <Health value={3} />
            <Tags values={tags} />
        </div></div>

    }
}

export class CardBack extends React.Component {

    render() {

        let qlty = [
            { name: "Burst of action", cost: 2, description: `Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do.` }
        ]

        let sfx = [
            { name: "Special", level: 1, description: `The path of the righteous man is beset on all sides by the iniquities of the selfish and the tyranny of evil men. ` },
            { name: "Special", description:`Blessed is he who, in the name of charity and good will, shepherds the weak through the valley of darkness, for he is truly his brother's keeper and the finder of lost children. ` },
            { name: "Repair", description:`And I will strike down upon thee with great vengeance and furious anger those who would attempt to poison and destroy My brothers.` },
            { name: "Unit Leader", level: 2,description:`And you will know My name is the Lord when I lay My vengeance upon thee.` },
            { name: "Cucumber" }
        ];

        let name = "Brolin"
        let alignment = "heroic"
        let type = "co-star"

        return <div className="cellophan"><div className="card back">
            <Title name={name} alignment={alignment} type={type} />

            <section>
                <heading>Star quality</heading>
                {qlty.map((v,i)=>(<Trait key={i} object={v} full/>))}
                <heading>Special effects</heading>
                {sfx.map((v,i)=>(<Trait key={i} object={v} full/>))}
            </section>

        </div></div>

    }
}