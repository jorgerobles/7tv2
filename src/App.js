import React, { Component } from 'react';
import { CardFront, CardBack } from './Card.js'


class App extends Component {
  render() {
    return (
      <div className="App">
        
        <div className="viewport">
        <CardFront/>
        <CardBack/>
        </div>

        <div className="viewport portrait">
        <CardFront/>
        <CardBack/>
        </div>

      </div>
    );
  }
}

export default App;
