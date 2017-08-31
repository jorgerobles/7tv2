
import uuid from 'uuid';
import Yaml from 'js-yaml';
import { first, middle, last} from 'random-name'

const randomName=()=>{
    return (Math.round(Math.random())?first():middle())+" "+last();
}

export const loadYamlFile = (file,asSingleFile=false) => {
    return () => {
        return new Promise((accept, reject) => {
            let reader = new FileReader();
            reader.onload = (data) => {
                try {
                    if (asSingleFile){
                        accept(Yaml.safeLoad(reader.result))
                    } else {
                        let objs = [];
                        Yaml.safeLoadAll(reader.result, (obj) => { objs.push(obj) });
                        accept(objs)
                    }
                } catch (e) {
                    console.error(e)
                    reject(e)
                }
            }
            reader.readAsText(file);
        })
    }
}

export const saveYamlFile=(docs,asSingleFile=false, options={})=>{
    if (asSingleFile && Array.isArray(docs)){
        return docs.map((doc)=>Yaml.safeDump(doc, options)).join("\n---\n")
    } else {
        return Yaml.safeDump(docs, options);
    }
}

const INITIALSTATE = {
    __version: "0.0.1",
    currentCharacter:null,
    cast: []
}

const TEMPLATE_CHARACTER_NEW = require('../data/blank.json')

const reducer = (state = INITIALSTATE, action) => {
    state = Object.assign( {}, state)
    
    switch (action.type) {
        case "CHARACTER_NEW":
            let uid=uuid.v4();
            state.cast = [...state.cast, Object.assign({},TEMPLATE_CHARACTER_NEW, { id: uid, name: randomName() })];
            state.currentCharacter=uid
            break;
        case "CHARACTER_LOAD":
            state.cast = [...state.cast, Object.assign({},action.payload, { id: uuid.v4() })];
            break;
        case "CHARACTER_REMOVE":
            state.cast = state.cast.slice().filter((item) => { return item.id !== action.payload.id; })
            break;
        case "CHARACTER_SELECT":
            if (state.currentCharacter === action.payload.id){
                state.currentCharacter=null
            } else {
                state.currentCharacter=action.payload.id;
            }
            break;
        case "CHARACTER_UPDATE":
            state.cast = state.cast.slice().map((item)=>{
                if (item.id!==action.payload.id)
                    return item;
                return action.payload;
            })
            break;
        default:
            return state;
    }
    return state;
}

export default reducer;