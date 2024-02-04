const state  = require('./state.js');
const url    = require('url');
const output = new Object();

output.state = new state( 
    url.parse(window.location.href) 
);

window.addEventListener('hashchange',function(){
    output.state.set({ hash: window.location.hash });
});

output.get  = function(item)   { return output.state.get(item); }
output.on   = function(...args){ return output.state.on(...args); }
output.off  = function(...args){ return output.state.off(...args); }
output.once = function(...args){ return output.state.once(...args); }

module.exports = output;