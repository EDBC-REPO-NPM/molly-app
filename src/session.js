const state = require('./state.js')
const output = new Object();

function getState(){
    const state = new Object();
    const storage = window.sessionStorage;
    for( var i=storage.length; i--; ){
        const key = storage.key(i);
        const data = storage.getItem(key);
        state[key] = data;
    }   return state;
}

output.state = new state( getState() );

output.set = function(obj){ var state;
    try { state = obj(output.state.state); } 
    catch(e) { state = obj } output.state.set(obj);
    for( var i in state ) window.sessionStorage.setItem(i,state[i]);
}

output.clear = function(){ 
    output.state.state = new Object();
    return window.sessionStorage.clear();
}

output.get  = function(item)   { return output.state.get(item); }
output.on   = function(...args){ return output.state.on(...args); }
output.off  = function(...args){ return output.state.off(...args); }
output.once = function(...args){ return output.state.once(...args); }

module.exports = output;