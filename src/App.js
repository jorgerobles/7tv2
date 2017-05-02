import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Card } from './Card'
import { Toolbar } from './Ui'

class App extends Component {
  render() {

    console.log(this.props)
    return (
      <div className="App">
        {this.props.cast.map((character,i)=>{
         return <Card character={character}/>
        })}
        <Toolbar/>
      </div>
    );
  }
}

export default App = connect((state)=>{return state})(App);
