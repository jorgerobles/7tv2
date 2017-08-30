/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Card } from './Card'
import { Toolbar } from './Ui'
import { CharacterEditor } from './CharacterEditor'
import chunk from 'chunk';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="sidebar ui ">
          <Toolbar/>
          <CharacterEditor 
            characterId={this.props.currentCharacter} 
            cast={this.props.cast}
            onChange={this.props.updateCharacter}
          />
        </div>
        <div className="canvas">{
          chunk(this.props.cast,4).map((ch,i)=>{
            return <div className="paged">{ch.map((character,j)=>{return <Card character={character} key={i+"-"+j}/>})}</div>
          })
        }</div>
      </div>
    );
  }
}

export default App = connect(
  (state)=>{
    return state
  },
  (dispatch)=>{
    return {
      updateCharacter: (data)=>{
        dispatch({type:"CHARACTER_UPDATE",payload: data.formData})
      }
    }
  })(App);
