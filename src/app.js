	output = new Object();

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
	output.$ = function( ...args ){
		return ( args.length > 1 ) ? 
			args[0] .querySelector(args[1]):
			document.querySelector(args[0]);
	};

	output.$$ = function( ...args ){
		return ( args.length > 1 ) ? 
			Array.from(args[0] .querySelectorAll(args[1])):
			Array.from(document.querySelectorAll(args[0]));
	};

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
	output.XML = new Object();
	output.XML.stringify = function( _object ){ return new XMLSerializer().serializeToString( _object ); }
	output.XML.parse     = function( _string, mime="text/xml" ){ return new DOMParser().parseFromString( _string,mime ); }
	
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
	output.removeEvent = function( ...args ){ 
		args[0].removeEventListener( args[1], args[2], true ); 
	}

	output.addEvent = function( ...args ){ 
		args[0].addEventListener( args[1], args[2], true ); 
	}

	output.onLoad = function( cb ){
		output.addEvent( window, 'load', cb );
	}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	output.replaceElement= function(...args){ args[1].parentElement.replaceChild( args[0],args[1] ); }
	output.removeElement = function(...args){ args[0].parentElement.removeChild( args[0] ); }
	output.createElement = function(...args){ return document.createElement(args); }
	output.appendElement = function(...args){ return args[0].appendChild(args[1]); }

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	output.slugify = function( text ){
		
		const reg = {
			a:'á|à|ã|â|ä',e:'é|è|ê|ë',
			o:'ó|ò|ô|õ|ö',i:'í|ì|î|ï',  
			c:'ç',n:'ñ',  u:'ú|ù|û|ü', 
			'':'\\W+|\\t+|\\n+| +',
		};
		
		Object.keys(reg).map( function(x){
			const key = new RegExp(reg[x],'gi');
			text = text.replace(key,x);
		});	return text.toLowerCase();

	}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	output.url          = require ('url');
	output.tv           = require ('./tv');
	output.event        = require ('events');
	output.buffer       = require ('buffer');
	output.state        = require ('./state');
	
	output.clipboard    = require ('./clipboard');
	output.session      = require ('./session');
	output.storage      = require ('./storage');
	output.base64toBlob = require ('./base64');
	output.sensors      = require ('./sensor');
	output.cookie       = require ('./cookie');
	output.query        = require ('./query');
	output.media        = require ('./media');
	output.fetch        = require ('./fetch');
	output.info         = require ('./info');
	output.hash         = require ('./hash');

	output.render       = require ('./render'); 

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
	output.onLoad( function(){
		new MutationObserver( function(){ output.render(); });
		(function(){ output.hash(); output.render(); })();
	});

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

module.exports = {
	app:     output,
	$:       output.$,
	$$:      output.$$,
	slugify: output.slugify,
	event: {
		addEvent:       output.addEvent,
		removeEvent:    output.removeEvent,
	},
	element: {
		createElement:  output.createElement,
		removeElement:  output.removeElement,
		appendElement:  output.appendElement,
		replaceElement: output.replaceElement,
	}
};

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

window.app     = output;
window.$       = output.$;
window.$$      = output.$$;
window.XML     = output.XML;
window.slugify = output.slugify;

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
