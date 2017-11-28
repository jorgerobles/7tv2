import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import logger from 'redux-logger';
import { compose, createStore, applyMiddleware } from 'redux'
import reducer from './reducers/index'
import App from './components/App';
import './assets/index.css';
import './assets/fonts/icons/style.css'

import persistState from 'redux-localstorage';
import mergePersistedState from 'redux-localstorage/lib/mergePersistedState'
import adapter from 'redux-localstorage/lib/adapters/localStorage';
import filter from 'redux-localstorage-filter';

export const LOCALSTORAGE_KEY = 'Studios7TV'


const storeReducer = compose(
  mergePersistedState()
)(reducer);

const storage = compose(
  filter('cast','currentCharacter')
)(adapter(window.localStorage));

const enhancer = compose(
  applyMiddleware(logger),
  persistState(storage, LOCALSTORAGE_KEY)
);

export const store = createStore(storeReducer , enhancer);

//export const store = createStore(reducer);

ReactDOM.render(
  <Provider store={store}>
  <App />
  </Provider>,
  document.getElementById('root')
);
