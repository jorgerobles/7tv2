
const INITIALSTATE = {
    __version: "0.0.1",
    cast:[]
}

const reducer = (state = INITIALSTATE, action) =>
{
    state = Object.assign( {},state)
    if (action.type === "CHARACTER_LOAD")
        state.cast = [...state.cast,action.payload];
    return state;
    
}

export default reducer;