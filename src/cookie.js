const state  = require('./state.js');
const output = new Object();

function getState(){
    const state = new Object();
    const cookie = document.cookie.split(';');
    if( document.cookie == '' ) return state;
    for( var i in cookie ){
        const data = cookie[i].split('=');
              state[data[0]] = data[1];
    }   return state;
}

output.state = new state( getState() );

output.set = function(obj){ 
    const result = new Array(); var state;
    try { state  = obj(output.state.state); } 
    catch(e) { state = obj } output.state.set(obj);
    for( var i in obj )
        result.push(`${i}=${obj[i]}`); 
        document.cookie = result.join(';');
}

output.get  = function(item)   { return output.state.get(item); }
output.on   = function(...args){ return output.state.on(...args); }
output.off  = function(...args){ return output.state.off(...args); }
output.once = function(...args){ return output.state.once(...args); }

module.exports = output;