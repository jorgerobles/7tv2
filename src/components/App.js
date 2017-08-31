/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Card } from './Card'
import { Toolbar } from './Ui'
import { CharacterEditor } from './CharacterEditor'
import chunk from 'chunk';
import SplitPane from 'react-split-pane'
import '../assets/resizer.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <SplitPane split="vertical" minSize={200} defaultSize={300}>
          <div className="sidebar ui " >
            <Toolbar/>
            <CharacterEditor 
              characterId={this.props.currentCharacter} 
              cast={this.props.cast}
              onChange={this.props.updateCharacter}
            />
          </div>
          <div className="canvas" onClick={e=>this.props.deselectCharacter(e)}>{
            chunk(this.props.cast,4).map((ch,i)=>{
              return <div className="paged" key={i}>{ch.map((character,j)=>{return <Card character={character} key={j}/>})}</div>
            })
          }</div>
        </SplitPane>
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
      deselectCharacter:()=>{
        dispatch({type:"CHARACTER_SELECT",payload: {id:null}})
      },
      updateCharacter: (data)=>{
        dispatch({type:"CHARACTER_UPDATE",payload: data.formData})
      }
    }
  })(App);
