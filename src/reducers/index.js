
import uuid from 'uuid/v4';

const INITIALSTATE = {
    __version: "0.0.1",
    cast: []
}

const reducer = (state = INITIALSTATE, action) => {
    state = Object.assign( {}, state)
   
    switch(action.type){
        case "CHARACTER_LOAD":
            state.cast = [...state.cast, Object.assign(action.payload,{ id:uuid() })];
        break;
        case "CHARACTER_REMOVE":
            state.cast = state.cast.slice().filter((item)=>{ return item.id!==action.payload.id;})
        break;
    }
    
    return state;

}

export default reducer;