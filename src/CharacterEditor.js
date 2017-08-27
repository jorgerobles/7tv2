import React from 'react'
import { connect } from 'react-redux'
import { Button, Dropdown, NavItem, Icon } from 'react-materialize'

const getCharacterById=(id, cast)=>{
    return cast.find(item=>{return item.id == id})
}

export class CharacterEditor extends React.Component {
    render(){
        return <div><pre>{JSON.stringify(getCharacterById(this.props.characterId, this.props.cast))}</pre></div>
    }
}
