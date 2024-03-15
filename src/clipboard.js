const output = new Object();

output.copy  =       function( _value ){ navigator.clipboard.writeText( _value ); }
output.paste = async function(){ return navigator.clipboard.readText(); }

module.exports = output;