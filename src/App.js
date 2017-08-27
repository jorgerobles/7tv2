import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Card } from './Card'
import { Toolbar } from './Ui'
import { CharacterEditor } from './CharacterEditor'
import { SideNav, SideNavItem, Button } from 'react-materialize';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="ui sidebar"><CharacterEditor characterId={this.props.currentCharacter} cast={this.props.cast}/></div>
        <div className="canvas">
        {this.props.cast.map((character,i)=>{
         return <Card character={character} key={i}/>
        })}
        </div>
        <Toolbar/>
        
      </div>
    );
  }
}

export default App = connect((state)=>{
  return state
})(App);
