import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import logger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux'
import reducer from './reducers/index'
import App from './App';
import './index.css';
import './assets/fonts/icons/style.css'


export const store = createStore(reducer, applyMiddleware(logger));

ReactDOM.render(
  <Provider store={store}>
  <App />
  </Provider>,
  document.getElementById('root')
);
