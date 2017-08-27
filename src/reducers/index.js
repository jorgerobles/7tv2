
import uuid from 'uuid';
import Yaml from 'js-yaml';
import randomName from 'random-name'

export const loadYamlFile = (file) => {
    return () => {
        return new Promise((accept, reject) => {
            let reader = new FileReader();
            reader.onload = (data) => {
                try {
                    let objs = [];
                    Yaml.safeLoadAll(reader.result, (obj) => { objs.push(obj) });
                    accept(objs)
                } catch (e) {
                    console.error(e)
                    reject(e)
                }
            }
            reader.readAsText(file);
        })
    }
}

const INITIALSTATE = {
    __version: "0.0.1",
    cast: []
}

const TEMPLATE_CHARACTER_NEW = require('../data/blank.json')

const reducer = (state = INITIALSTATE, action) => {
    state = Object.assign( {}, state)
    
    switch (action.type) {
        case "CHARACTER_NEW":
            state.cast = [...state.cast, Object.assign({},TEMPLATE_CHARACTER_NEW, { id: uuid.v4(), name: randomName() })];
            break;
        case "CHARACTER_LOAD":
            state.cast = [...state.cast, Object.assign({},action.payload, { id: uuid.v4() })];
            break;
        case "CHARACTER_REMOVE":
            state.cast = state.cast.slice().filter((item) => { return item.id !== action.payload.id; })
            break;
        case "CHARACTER_SELECT":
            state.currentCharacter=action.payload.id;
            break;
        default:
            return state;
    }
    return state;
}

export default reducer;