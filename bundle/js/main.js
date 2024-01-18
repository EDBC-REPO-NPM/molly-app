// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
	window.$ = function( ...args ){
		return ( args.length > 1 ) ? 
			args[0].querySelector(args[1]):
			document.querySelector(args[0]);
	};

	window._$ = function( ...args ){
		return ( args.length > 1 ) ? 
			Array.from(args[0].querySelectorAll(args[1])):
			Array.from(document.querySelectorAll(args[0]));
	};

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	window.$$ = window._$;

	window._events = new Array(); 
    function eventID(){
        const item = 'abcdefghijklmn0123456789'.split('');
        const result = new Array(); for( let i=64; i--; ){
            const index = Math.floor( Math.random()*item.length );
            result.push( item[index] );
        }   return result.join('');
    }

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
	window.XML = new Object();
	window.XML.stringify = function( _object ){ return new XMLSerializer().serializeToString( _object ); }
	window.XML.parse = function( _string, mime="text/xml" ){ return new DOMParser().parseFromString( _string,mime ); }
	
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
	window.removeEvent = function( ID ){ 
		for( let i in window._events ){
			const x = window._events[i]; if( x[3] == ID ){
				x[0].removeEventListener( x[1],x[2],true ); 
				window._events.splice(i,1);				
				return 0; 
			}
		}
	}

	window.addEvent = function( ...args ){ 
		args[0].addEventListener( args[1],args[2],true ); 
		const data = [...args,eventID()];
		window._events.push( data) ;
		return data[3]; 
	}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	window.replaceElement= function(...args){ args[1].parentElement.replaceChild( args[0],args[1] ); }
	window.removeElement = function(...args){ args[0].parentElement.removeChild( args[0] ); }
	window.createElement = function(...args){ return document.createElement(args); }
	window.appendElement = function(...args){ return args[0].appendChild(args[1]); }

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	window.slugify = function( text ){
		
		const reg = {
			a:'á|à|ã|â|ä',e:'é|è|ê|ë',
			o:'ó|ò|ô|õ|ö',i:'í|ì|î|ï',  
			c:'ç',n:'ñ',  u:'ú|ù|û|ü', 
			'':'\\W+|\\t+|\\n+| +',
		};
		
		Object.keys(reg).map( x=>{
			const key = new RegExp(reg[x],'gi');
			text = text.replace(key,x);
		});	return text.toLowerCase();

	}
	
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	window.molly = new Object();

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	window.molly.url          = require('./url');
	window.molly.state        = require('./state');
	window.molly.focus        = require('./focus');
	
	window.molly.clipboard    = require('./clipboard');
	window.molly.session      = require('./session');
	window.molly.storage      = require('./storage');
	window.molly.base64toBlob = require('./base64');
	window.molly.sensors      = require('./sensor');
	window.molly.cookie       = require('./cookie');
	window.molly.query        = require('./query');
	window.molly.media        = require('./media');
	window.molly.fetch        = require('./fetch');
	window.molly.info         = require('./info');
	window.molly.hash         = require('./hash');

	window.molly.render       = require('./render'); 

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
	window.addEventListener( 'load',()=>{
		new MutationObserver( ()=>{ window.molly.render(); });
		(()=>{ window.molly.hash(); window.molly.render(); })();
	});

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

module.exports = {
	$: window.$,
	$$: window._$,
	_$: window._$,
	XML: window.XML,
	molly: window.molly,
	event: {
		addEvent: window.addEvent,
		removeEvent: window.removeEvent,
	},
	element: {
		createElement: window.createElement,
		removeElement: window.removeElement,
		appendElement: window.appendElement,
		replaceElement: window.replaceElement,
	},
	slugify: window.slugify,
};