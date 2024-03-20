/* eslint-disable */
import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Card } from './Card'
import { Toolbar, Help, Rescue } from './Ui'
import { CharacterEditor } from './CharacterEditor'
import SplitPane from '@andrewray/react-split-pane'
import '../assets/resizer.css'
import { isChrome } from 'react-device-detect'

const ChromeNag=function(){
  if (!isChrome)
    return <div className="chromeNag">Please use Chrome browser for a better experience</div>
  return null
}

class App extends Component {
  render() {
    return (
      <div className="App">
        
        <SplitPane split="vertical" minSize={300} 
              defaultSize={ parseInt(localStorage.getItem('splitPos')||300, 10) }
              onChange={ size => localStorage.setItem('splitPos', size) }>
          
          <div className="sidebar ui " >
            <Toolbar/>
            <Help/>
            <CharacterEditor 
              characterId={this.props.currentCharacter} 
              cast={this.props.cast}
              onChange={this.props.updateCharacter}
            />
            <Rescue/>
          </div>
          <div className="canvas" onClick={e=>this.props.deselectCharacter(e)}>
          <ChromeNag/>
          {
            this.props.cast.map((character,j)=>{return <Card character={character} key={j}/>})
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
