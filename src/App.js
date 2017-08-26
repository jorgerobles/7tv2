import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Card } from './Card'
import { Toolbar } from './Ui'
import { SideNav, SideNavItem, Button } from 'react-materialize';

class App extends Component {
  render() {

    console.log(this.props)
    return (
      <div className="App">
        {this.props.cast.map((character,i)=>{
         return <Card character={character} key={i}/>
        })}
        <Toolbar/>
        
      </div>
    );
  }
}

export default App = connect((state)=>{return state})(App);
