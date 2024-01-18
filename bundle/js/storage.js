const output = new Object();

function getState(){
    const state = new Object();
    const storage = window.localStorage;
    for( let i=storage.length; i--; ){
        const key = storage.key(i);
        const data = storage.getItem(key);
        state[key] = data;
    }   return state;
}

output.state = new window.molly.state( getState() );

output.set = function(obj){ let state;
    try { state = obj(output.state.state); } 
    catch(e) { state = obj } output.state.set(obj);
    for( let i in state ) window.localStorage.setItem(i,state[i]);
}

output.clear = function(){ 
    output.state.state = new Object();
    return window.localStorage.clear();
}

output.get = function(item){ return output.state.get(item) }
output.observeField = function(...args){ return output.state.observeField(...args) }
output.unObserveField = function(...args){ return output.state.unObserveField(...args) }

module.exports = output;