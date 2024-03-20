import pkg from '../../package.json';
import {v4 as uuid4} from 'uuid';
import Yaml from 'js-yaml';
import cleanDeep from 'clean-deep';
import { uniqueNamesGenerator, adjectives, names } from 'unique-names-generator';
import {actionTypes} from 'redux-localstorage'
import Ajv from 'ajv';
const ajv = new Ajv();

const randomName=()=>{
    return uniqueNamesGenerator({dictionaries: [adjectives,names], separator: " "})
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

export const saveYamlFile=(docs,asSingleFile=false, options={skipInvalid:true})=>{
    if (asSingleFile && Array.isArray(docs)){
        return docs.map((doc)=>{
            try {
                return Yaml.safeDump(cleanDeep(doc,{emptyArrays:false, emptyObjects:false, emptyStrings:false, nullValues:false}), options)
            } catch(e) {
                console.error(doc)
            }
            return null;
        }).join("\n---\n")
        
    } else {
        return Yaml.safeDump(docs, options);
    }
}

const INITIALSTATE = {
    currentCharacter:null,
    cast: []
}

const getTemplateCharacterNew=(payload, templatename='model')=>{
    if (payload && payload.__card)
        templatename=payload.__card;
    return require('../data/'+templatename.toLowerCase()+'-blank.json')
}

const reducer = (state = INITIALSTATE, action) => {
    state = Object.assign({}, state)
    const TEMPLATE_CHARACTER_NEW = getTemplateCharacterNew(action.payload)
    switch (action.type) {
        case actionTypes.INIT:
            state = validateState(state);
            break;
        case "CHARACTER_NEW":
            let uid=uuid4();
            state.cast = [...state.cast, Object.assign({},TEMPLATE_CHARACTER_NEW, { id: uid, name: randomName(), __version: pkg.version }, action.payload || {})];
            state.currentCharacter=uid
            break;
        case "CHARACTER_LOAD":
            state.cast = [...state.cast, Object.assign({},TEMPLATE_CHARACTER_NEW,action.payload, { id: uuid4() })];
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
    return state;
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