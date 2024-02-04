	output = new Object();

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
	output.$ = function( ...args ){
		return ( args.length > 1 ) ? 
			args[0].querySelector(args[1]):
			document.querySelector(args[0]);
	};

	output.$$ = function( ...args ){
		return ( args.length > 1 ) ? 
			Array.from(args[0].querySelectorAll(args[1])):
			Array.from(document.querySelectorAll(args[0]));
	};

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	const _ev_ = new Array(); function eventID(){
        const item = 'abcdefghijklmn0123456789'.split('');
        const result = new Array(); for( let i=64; i--; ){
            const index = Math.floor( Math.random()*item.length );
            result.push( item[index] );
        }   return result.join('');
    }

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
	output.XML = new Object();
	output.XML.stringify = function( _object ){ return new XMLSerializer().serializeToString( _object ); }
	output.XML.parse = function( _string, mime="text/xml" ){ return new DOMParser().parseFromString( _string,mime ); }
	
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
	output.removeEvent = function( ID ){ 
		for( let i in  _ev_ ){
			const x =  _ev_[i]; if( x[3] == ID ){
				x[0].removeEventListener( x[1],x[2],true ); 
				 _ev_.splice(i,1);				
				return 0; 
			}
		}
	}

	output.addEvent = function( ...args ){ 
		args[0].addEventListener( args[1],args[2],true ); 
		const data = [...args,eventID()];
		 _ev_.push( data) ;
		return data[3]; 
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
		
		Object.keys(reg).map( x=>{
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
	
	window.addEventListener( 'load',()=>{
		new MutationObserver( ()=>{ output.render(); });
		(()=>{ output.hash(); output.render(); })();
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
