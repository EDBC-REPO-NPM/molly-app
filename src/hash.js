const focus = require('./tv.js');
module.exports = function(){

	function hash(id) {
	    $$('[hash]').map(function(x){x.hidden=true});
		$$(`[hash*="${id}"]`).map(function(x){x.hidden=false});
		$$(`[hash*="${id}"]`).map(function(x){focus.focus(x)});
    }

	window.addEventListener('hashchange',function(){
		hash( window.location.hash.slice(1) || '' );
	}); hash( window.location.hash.slice(1) || '' );

}