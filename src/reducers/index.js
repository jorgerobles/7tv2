
import uuid from 'uuid';
import Yaml from 'js-yaml';
import { first, middle, last} from 'random-name'
import {actionTypes} from 'redux-localstorage'
import Ajv from 'ajv';
const ajv = new Ajv();
      ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

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

const getTemplateCharacterNew=(payload, templatename='model')=>{
    if (payload && payload.__card)
        templatename=payload.__card;
    return require('../data/'+templatename.toLowerCase()+'-blank.json')
}

const reducer = (state = INITIALSTATE, action) => {
    state = Object.assign( {}, state)
    const TEMPLATE_CHARACTER_NEW = getTemplateCharacterNew(action.payload)
    switch (action.type) {
        case actionTypes.INIT:
            return validateState(state);
            break;
        case "CHARACTER_NEW":
            let uid=uuid.v4();
            state.cast = [...state.cast, Object.assign({},TEMPLATE_CHARACTER_NEW, { id: uid, name: randomName() }, action.payload || {})];
            state.currentCharacter=uid
            break;
        case "CHARACTER_LOAD":
            state.cast = [...state.cast, Object.assign({},TEMPLATE_CHARACTER_NEW,action.payload, { id: uuid.v4() })];
            break;
        case "CHARACTER_REMOVE":
            state.cast = state.cast.slice().filter((item) => { return item.id !== action.payload.id; })
            break;
        case "CHARACTER_SELECT":
            state.currentCharacter=action.payload.id;
            break;
        case "CHARACTER_UPDATE":
            state.cast = state.cast.slice().map((item)=>{
                if (item.id!==action.payload.id)
                    return item;
                return action.payload;
            })
            break;
        case "CHARACTER_APPEND_TRAIT":
            if (!action.payload.value) return;
            state.cast = state.cast.slice().map((item)=>{
                if (item.id!==action.payload.id)
                    return item;
                let char=Object.assign({},item)
                    char[action.payload.key].push(action.payload.value)

                return char;
            })
            break;
           
        case "CAST_CLEAR":
            state.cast=[]
        break;
        default:
            return state;
    }
    return state;
}

export default reducer;


const validateState=(state)=>{
    
    state.cast= state.cast.slice().map((item)=>{
        const schema = require('../data/'+item.__card.toLowerCase()+'-schema.json');
        let validate = ajv.compile(schema);
        if (validate(item)){
            return item
        } else {
            alert(validate.errors)
            return item;
            
        };
    })
    return state;
}