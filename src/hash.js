const focus = require('./tv.js');
module.exports = function(){

	function hash(id) {
	    $$('[hash]').map(x=>x.hidden=true);
		$$(`[hash*="${id}"]`).map(x=>x.hidden=false);
		$$(`[hash*="${id}"]`).map(x=>focus.focus(x));
    }

	window.addEventListener('hashchange',()=>{
		hash( window.location.hash.slice(1) || '' );
	}); hash( window.location.hash.slice(1) || '' );

}