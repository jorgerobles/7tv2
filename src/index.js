import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'
import logger from 'redux-logger';
import { compose, createStore, applyMiddleware } from 'redux'
import reducer from './reducers/index'
import App from './components/App';
import './assets/index.css';
import './assets/icons/css/7tv2-core.css'
import './assets/icons/css/7tv2-fantasy.css'

import persistState from 'redux-localstorage';
import mergePersistedState from 'redux-localstorage/lib/mergePersistedState'
import adapter from 'redux-localstorage/lib/adapters/localStorage';
import filter from 'redux-localstorage-filter';

import Locale from './lib/simple-locale'

export const LOCALSTORAGE_KEY = 'Studios7TV'
export const locale = new Locale({ gb_EN: 'gb_EN'});

locale.load(locale.gb_EN, require('./i18n/gb_EN.json'));
locale.set(locale.gb_EN)


export const T=(str="",params={})=>{
  return locale.get(str,params);
}

export const zip=function(arr){
  return arr.reduce(function(obj, [k, v]){return { ...obj, [k]: v }}, {});
}

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

export const store = createStore(storeReducer, enhancer);

//export const store = createStore(reducer);

const container = document.getElementById('root');
const root = createRoot(container)

root.render(
  <Provider store={store}>
  <App />
  </Provider>
);
