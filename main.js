(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = function( b64Data, contentType='text/plain', sliceSize=512 ) {
  
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for(let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});

}
},{}],2:[function(require,module,exports){
const output = new Object();

output.copy = ( _value )=>{ navigator.clipboard.writeText( _value ); }
output.paste = async()=>{ return navigator.clipboard.readText(); }

module.exports = output;
},{}],3:[function(require,module,exports){
const output = new Object();

function getState(){
    const state = new Object();
    const cookie = document.cookie.split(';');
    if( document.cookie == '' ) return state;
    for( let i in cookie ){
        const data = cookie[i].split('=');
              state[data[0]] = data[1];
    }   return state;
}

output.state = new window.molly.state( getState() );

output.set = function(obj){ 
    const result = new Array(); let state;
    try { state = obj(output.state.state); } 
    catch(e) { state = obj } output.state.set(obj);
    for( let i in obj )
        result.push(`${i}=${obj[i]}`); 
        document.cookie = result.join(';');
}

output.get = function(item){ return output.state.get(item) }
output.observeField = function(...args){ return output.state.observeField(...args) }
output.unObserveField = function(...args){ return output.state.unObserveField(...args) }

module.exports = output;
},{}],4:[function(require,module,exports){
(function (process){(function (){
const headers = {
    "sec-ch-ua": "\"Google Chrome\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
    'connection': 'keep-alive', 'Sec-Fetch-Site': 'cross-site',
    'sec-ch-ua-mobile': '?0', 'Sec-Fetch-User': '?1',
    'Accept-Encoding': 'gzip, deflate, br',
    "sec-ch-ua-platform": "\"Chrome OS\"",
    "accept-language": "es-419,es;q=0.9",
    'sec-fetch-mode': 'navigate',
    'Sec-Fetch-Dest': 'empty',
    "sec-fetch-mode": "cors",
    "accept": "*/*",
};

function parseProxy( _args ){

    let _url = _args[0]?.url || _args[0] || window.location.href;
        _url = _url.replace(/\.\//gi,window.location.href);
    let opt = new URL( _url ); 
        
    opt.port = typeof opt?.port == 'string' ? +opt.port : (/^https/i).test( _args[0]?.url || _args[0] ) ? 443 : 80;
    opt.protocol = (/^https/i).test(_url) ? 'https' : 'http';
    opt.currentUrl = _url; opt.referer = _url;
    opt.mode = 'cors';

    return { opt };
}

function parseURL( _args ){ 
    
    const { opt } = parseProxy( _args );

    opt.headers  = new Object();
    opt.body     = _args[1]?.body || _args[0]?.body || null; 
    opt.method   = _args[1]?.method || _args[0]?.method || 'GET';
    opt.redirect = _args[1]?.redirect || _args[0]?.redirect || false; 
    opt.timeout  = _args[1]?.timeout || _args[0]?.timeout || 100 * 60 * 1000 ;
    opt.response = _args[1]?.responseType || _args[0]?.responseType || 'json';
    const tmp_headers  = _args[1]?.headers || _args[0]?.headers || new Object();

    opt.cache = 'default'; opt.creadentials = 'omit'; 
    opt.redirect = opt.redirect ? 'follow' : 'manual';
    opt.referrerPolicy = "strict-origin-when-cross-origin";
    process.chunkSize = _args[1]?.chunkSize || _args[0]?.chunkSize || Math.pow(10,6) * 3;

    for( let i in headers ){ 
        const key = i.match(/\w+/gi).map(x=>{
            const st = x.match(/^\w/gi).join('');
            return x.replace(st,st.toLowerCase());
        }).join('-'); opt.headers[key] = headers[i]
    }

    for( let i in tmp_headers ){ 
        const key = i.match(/\w+/gi).map(x=>{
            const st = x.match(/^\w/gi).join('');
            return x.replace(st,st.toLowerCase());
        }).join('-'); opt.headers[key] = tmp_headers[i]
    }

    return { opt };
}

function parseBody( opt ){
    if( typeof opt.body == 'object' ){ 
        opt.body = JSON.stringify(opt.body);
        opt.headers['Content-Type'] = 'application/json';
    } else if( (/^\?/i).test(opt.body) ){ 
        opt.body = opt.body.replace(/^\?/i,'');
        opt.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if( !opt.headers['Content-Type'] ) { 
        opt.headers['Content-Type'] = 'text/plain'; 
    }   
    opt.headers['Content-Length'] = (new TextEncoder().encode(opt.body)).length; 
    return opt;
}

function parseRange( range ){
    const size = process.chunkSize;
    const interval = range.match(/\d+/gi);
    const chunk = Number(interval[0])+size;
    return interval[1] ? range : range+chunk;
}

function HTTPrequest( ..._args ){
    return new Promise((response,reject)=>{
 
        let { opt } = parseURL( _args ); delete opt.headers.host;

        if( opt.headers.range && !opt.headers.nochunked ) opt.headers.range = parseRange(opt.headers.range);
            opt.headers.referer = opt.currentUrl; opt.headers.origin = opt.currentUrl;
        if( opt.body ){ opt = parseBody( opt ); }   

        const req = fetch( opt.currentUrl, opt ).then( async function(res){
            try{

                const schema = {
                    request: req, response: res, config: opt,
                    status: res.status, headers: res.headers,
                }; 
                
                if( opt.response == 'stream' ) schema.data = res;

                else if( opt.response == 'arraybuffer' ) schema.data = await res.arrayBuffer();
                else if( opt.response == 'blob' ) schema.data = await res.blob();
                else if( opt.response == 'text' ) schema.data = await res.text();
                else if( opt.response == 'json' )  try{ 
                    schema.data = await res.text();
                    schema.data = JSON.parse(schema.data);
                } catch(e) { }
                
                if( res.status >= 400 )
                     return reject( schema );
                else return response( schema );
                
            } catch(e) { reject(e); }
        }).catch(e=>{ reject(e); })
    
    });    
}


module.exports = HTTPrequest;
}).call(this)}).call(this,require('_process'))
},{"_process":17}],5:[function(require,module,exports){
const output = new Object();

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

output.state = new molly.state({
    parent: null, target: null,
    button:'', ok:0, key:'',
    event:'', topology:null,
});

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

output.set = function(obj){ output.state.set(obj) }
output.get = function(item){ return output.state.get(item) }
output.observeField = function(...args){ return output.state.observeField(...args) }
output.unObserveField = function(...args){ return output.state.unObserveField(...args) }

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

output.state.observeField('target',(a,b)=>{
    a?.setAttribute('focused',false);
    b?.setAttribute('focused',true);
    a?.removeAttribute('focused');
});

const options = {
    size: 1,     // int -> horizontal bondary
    loop: false, // bool-> loop Interval
    keep: false, // bool -> persistence 
};

function setFocus( element ){
    output.set({ target: element });
    return element;
}

function parseOpt( element ){
    const attr = element.getAttribute('focus')
                        .replace(/\t|\n| /gi,'')
                        .split(';');
    const obj = new Object();
    for( let i in options ) obj[i] = options[i];
    for( let i in attr ){
        const data = attr[i].split(':');
        if(!data[1]) continue; 
        obj[data[0]]= data[1];
    }   return obj;
}

function parseFocus( element ){
    const node = new Object();
          node.opt = parseOpt( element );
          node.pos = [0,0];

    if( node.opt.size == 'horizontal' )
        node.opt.size = element.querySelectorAll('[focus-item]').length;

    if( node.opt.keep ) 
        node.pos = element.hasAttribute('pos') ? 
                   element.getAttribute('pos').split(' ').map(x=>+x) : [0,0];

    else if( node.opt.size == 'vertical' ) node.opt.size = 0;
    
    else node.opt.size = +node.opt.size;

    return node;
}

output.focus = function( element ){
    
    if( !element.hasAttribute('focus') ){
        let parent = element.parentElement;
        do {
            try{parent.scrollTo({ 
                    left: element.offsetLeft-(element.clientWidth/2),
                    top: element.offsetTop-(element.clientHeight/2),
                    behavior: 'smooth',
                }); parent = parent.parentElement;
            } catch(e) { break; }
        } while ( parent != $('html') );   
          return setFocus(element);
    }   
    
    output.state.set({
        parent: element,
        topology: parseFocus( element )
    }); return setFocus( element.querySelector('[focus-item]') );

} 

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

function setTarget( X,Y ){
    try{

        output.state.state.topology.pos = [ 
            output.state.state.topology.pos[0] + X, 
            output.state.state.topology.pos[1] + Y 
        ];

        Array.from(document.querySelectorAll('[focus-item]'))
                           .map(x=>x?.setAttribute('focused',false));    

        const items = output.state.state.parent.querySelectorAll('[focus-item]');
        const YSize = Math.ceil(items.length / output.state.state.topology.opt.size);
        const XSize = Math.ceil(output.state.state.topology.opt.size);
        const pos = output.state.state.topology.pos;

        if( pos[0] < 0 ){
            if( output.state.state.topology.opt.loop )
                 output.state.state.topology.pos[0] = XSize-1;
            else output.state.state.topology.pos[0] = 0;
            output.set({ event: 'left' });
            return setTarget( 0,0 );
        }
        else if( pos[0] >= XSize ){
            if( output.state.state.topology.opt.loop )
                 output.state.state.topology.pos[0] = 0;
            else output.state.state.topology.pos[0] = XSize-1;
            output.set({ event: 'right' });
            return setTarget( 0,0 );
        }

        if( pos[1] < 0 ){
            if( output.state.state.topology.opt.loop )
                 output.state.state.topology.pos[1] = YSize-1;
            else output.state.state.topology.pos[1] = 0;
            output.set({ event: 'top' });
            return setTarget( 0,0 );
        }
        else if( pos[1] >= YSize ){
            if( output.state.state.topology.opt.loop )
                 output.state.state.topology.pos[1] = 0;
            else output.state.state.topology.pos[1] = YSize-1;
            output.set({ event: 'bottom' });
            return setTarget( 0,0 );
        } 

        try{
            output.focus( items[pos[0]+pos[1]*XSize] );
        } catch(e) { return setTarget( -1,0 ); }

        if( output.state.state.topology.opt.keep )
            output.state.state.parent.setAttribute('pos',pos.join(' '));

    } catch(e) { }
}

output.state.observeField('button',(a,b)=>{

         if( b == 'up' )   setTarget( 0,-1);
    else if( b == 'down' ) setTarget( 0, 1);
    else if( b == 'left' ) setTarget(-1, 0);
    else if( b == 'right') setTarget( 1, 0);
    else if( b == 'back' )  
        output.set({ event: 'back' });
    else if( b == 'ok' ){ try {
        output.set({ event: 'ok' });
        output.state.get('target').click();
    } catch(e) {} } 

});

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

window.addEventListener('keydown',({key})=>{ output.state.set({ key: key });
    if( (/enter/i).test(key) )      return output.state.set({ button: 'ok' });
    if( (/arrowup/i).test(key))     return output.state.set({ button: 'up' });
    if( (/escape/i).test(key) )     return output.state.set({ button: 'menu' });
    if( (/arrowdown/i).test(key) )  return output.state.set({ button: 'down' });
    if( (/arrowleft/i).test(key) )  return output.state.set({ button: 'left' });
    if( (/backspace/i).test(key) )  return output.state.set({ button: 'back' });
    if( (/arrowright/i).test(key))  return output.state.set({ button: 'right' });
});

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

window.focus = output.focus;
module.exports = output;
},{}],6:[function(require,module,exports){
module.exports = function(){

	function hash(id) {
	    _$('[hash]').map(x=>x.hidden=true);
		_$(`[hash*="${id}"]`).map(x=>x.hidden=false);
		_$(`[hash*="${id}"]`).map(x=>molly.focus.focus(x));
    }

	window.addEventListener('hashchange',()=>{
		hash( window.location.hash.slice(1) || '' );
	}); hash( window.location.hash.slice(1) || '' );

}
},{}],7:[function(require,module,exports){
const output = new Object();

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

function slugify( text ){
		
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
	
output.isMobile = (req,res)=>{
	const match = [ 
		/Windows Phone/i, /BlackBerry/i, /webOS/i, 
		/iPad/i,          /iPod/i,       /Android/i, 
		/iPhone/i,        /Mobile/i 
	];
	return match.some( (item) => {
		const data = navigator.userAgent;
	    return item.test(slugify(data));
	});
}

output.isDesktop = (req,res)=>{
	return [
		!output.isTV(req,res),
		!output.isMobile(req,res),
	].every( x=>x );
}

output.isTV = (req,res)=>{
	const match = [ 
		/SmartTV/i,   /Espial/i,    /Opera TV/i, 
		/inetTV/i,    /HbbTV/i,     /LG Browser/i, 
		/Viera/i,     /PhilipsTV/i, /POV_TV/i, 
		/Roku/i,      /AppleTV/i,   /GoogleTV/i, 
		/technisat/i, /TV/i,
	];
	return match.some( (item) => {
		const data = navigator.userAgent;
	    return item.test(slugify(data));
	});
}
	
output.getBrowser = (req,res)=>{
	const data = navigator.userAgent;
	const match = [ 
		/Chrome/i, /Chromium/i, /Safari/i, 
		/Opera/i,  /Mozilla/i, 
	];

	for( let i in match ){		
		if( match[i].test(slugify(data)) )
			return match[i].source;
	}	return 'generic';
}
	
output.getOS = (req,res)=>{
	const match = [ 
		/Windows Phone/i, /BlackBerry/i, /Android/i,
		/iPhone/i,        /webOS/i,      /iPad/i, 
		/iPod/i,          /Linux/i,      /MacOS/i,
		/LG/i,            /SmartTV/i,    /Roku/i,
		/windows/i,       /ChromeOS/i,   /Philips/i,       
		/Apple/i
	];
		
	for( let i in match ){
		const data = navigator.userAgent;
		if( match[i].test(slugify(data)) )
			return match[i].source;
	}	return 'generic';
}
	
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
	
output.getSize = function( _bool ){
	const size = [ 
		[0,'small'], [600,'medium'],
		[900,'large'], [1100,'xlarge'],
	];
		
	for( let i=size.length; i--; ){
		if( window.innerWidth > size[i][0] )	
			return !_bool ? size[i][1] : i;
	}
}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

output.state = new molly.state({
	height: window.innerHeight,
    width: window.innerWidth,
	size: output.getSize(),
	connection: 'online',
});

window.addEventListener('online',function(){
    output.state.set({ connection: 'online' });
});

window.addEventListener('offline',function(){
    output.state.set({ connection: 'offline' });
});

window.addEventListener('resize',function(){
    output.state.set({
		height: window.innerHeight,
		width: window.innerWidth,
		size: output.getSize()
	});
});

output.set = function(obj){ output.state.set(obj) }
output.get = function(item){ return output.state.get(item) }
output.observeField = function(...args){ return output.state.observeField(...args) }
output.unObserveField = function(...args){ return output.state.unObserveField(...args) }

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

module.exports = output;
},{}],8:[function(require,module,exports){
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
},{"./base64":1,"./clipboard":2,"./cookie":3,"./fetch":4,"./focus":5,"./hash":6,"./info":7,"./media":9,"./query":10,"./render":11,"./sensor":12,"./session":13,"./state":14,"./storage":15,"./url":16}],9:[function(require,module,exports){
const output = new Object();

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

output.getScreen = function( _obj ){
    if( !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) )
        return console.error('screen recorder is not suported');

    if( typeof( _obj ) !== 'object' ){ 
        _obj = new Object();	
        _obj.video = true; 
        _obj.audio = true;
    }	
    
    return navigator.mediaDevices.getDisplayMedia( _obj );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
    
output.getCamera = function( _obj ){
    if( !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) )
        return console.error('camera is not suported');

    if( typeof( _obj ) !== 'object' ){ 
        _obj = new Object();	
        _obj.video = true; 
        _obj.audio = true;
    }	
    
    return navigator.mediaDevices.getUserMedia( _obj );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
    
output.getMicrophone = function( _obj ){
    if( !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) )
        return console.error('microphone is not suported');

    if( typeof( _obj ) !== 'object' ){ 
        _obj = new Object();	
        _obj.video = false;
        _obj.audio = true;
    }	
    
    return navigator.mediaDevices.getUserMedia( _obj );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

output.getShot = function( _stream, _width=1024, _height=720, _type="image/webp" ){
    const video = createElement("video"); video.srcObject = _stream;
          video.width = _width; video.height = _height;

    const canvas = createElement("canvas"), ctx = canvas.getContext("2d");
    ctx.drawImage( video, 0,0, _width, _height ); 
    return canvas.toDataURL( _type );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

output.stopMediaStream = function( _stream ){ _stream.getTracks().forEach(item=>item.stop()) }
	
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

output.stopRecording = function( _recorder ){ _recorder.mediaRecorder.stop(); }
output.startRecording = function( _recorder ){
    const mediaRecorder = new MediaRecorder( _recorder );
         _recorder.mediaRecorder = mediaRecorder;
    const data = new Array();

    _recorder.mediaRecorder.ondataavailable = (event)=>{
        data.push( event.data );
    };	_recorder.mediaRecorder.start();
    
    const promise = new Promise( (res,rej)=>{
        _recorder.mediaRecorder.onerror = (err)=> rej(err);
        _recorder.mediaRecorder.onstop = ()=>res(data);
    });	return promise;
}

output.saveRecord = function( _blobs,_name ){ 	
    const _blob = new Blob( _blobs, {'type':_blobs[0].type});	
    const url = URL.createObjectURL( _blob );
    const a = createElement('a');
    $('body').appendChild(a);
        a.setAttribute('download',_name);
        a.setAttribute('href',url);
        a.style = "display: none";
        a.click();
    URL.revokeObjectURL(url);
    $('body').removeChild(a);
}

module.exports = output;
},{}],10:[function(require,module,exports){
const output = new Object();

output.state = new window.molly.state( 
    window.molly.url.parse(window.location.href) 
);

window.addEventListener('hashchange',function(){
    output.state.set({ hash: window.location.hash });
});

output.set = function(obj){ output.state.set(obj) }
output.get = function(item){ return output.state.get(item) }
output.observeField = function(...args){ return output.state.observeField(...args) }
output.unObserveField = function(...args){ return output.state.unObserveField(...args) }

module.exports = output;
},{}],11:[function(require,module,exports){

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	let observer = undefined; try{
		observer = new IntersectionObserver( (entries, observer)=>{
			entries.map( entry=>{
	
				const object = entry.target;
				const placeholder = object.src;
	
				if( entry.isIntersecting ){
					object.src = object.getAttribute('lazy');
					observer.unobserve( object );
					object.removeAttribute('lazy');
					object.addEventListener('error',(el)=>{
						try{const clss = object.getAttribute('class');
							const newElement = createElement( object.tagName );
								  newElement.setAttribute('src',placeholder);
								  newElement.setAttribute('class',clss);
							replaceElement( newElement,object );
						} catch(e) {/* console.log(e) */}});
				}
				
			});
		},{ rootMargin:'250px 0px' });
	} catch(e) { }
	
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	const _loadBases_ = function( bases ){
		try{
			bases.map( (base,index)=>{
				
				const mimeType = base.getAttribute('type') || 'image/png';

				const data = base.getAttribute('b64');
				const file = base64toBlob( data, mimeType );
				const url = URL.createObjectURL( file );

				if( base.getAttribute('lazy') )
					 base.setAttribute('data-src',url);
				else base.setAttribute('src',url);

				base.removeAttribute('type');
				base.removeAttribute('b64');
								
			})
		} catch(e) {/* console.log(e) */}
	}
	
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	const _loadCode_ = function( body ){ 
		return new Promise(async(response,reject)=>{
			try{ 

				let data = body.innerHTML;
					data = data.replace(/\&gt\;/gi,'>');
					data = data.replace(/\&lt\;/gi,'<');
				const fragmt = data.match(/\<\°[^°]+\°\>/gi);
				const script = data.match(/\/\°[^°]+\°\//gi);

				for( var i in script ){ const x = script[i];
					try{const code = x.replace(/\/\°|\°\//gi,'');
						data = data.replace( x,eval(code) );
					} catch(e) { console.error(e);
						data = `/* ${e?.message} */`;
					}
				}

				for( var i in fragmt ){ const x = fragmt[i];
					try{ 
						const code = x.replace(/\<\°|\°\>| /gi,'');
						const res = await fetch(code);
						const text = await res.text();
						data = data.replace( x,text );
					} catch(e) { console.error(e);
						data = `/* ${e?.message} */`;
					}
				}

				body.innerHTML = data;
				if( script || fragmt ) response( _loadCode_(body) );
			} catch(e) {/* console.log(e) */} response();
		})
	}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	const _loadLazys_ = function( lazys ){
		try{ 
			lazys.map( lazy=>{ 
				observer.observe( lazy );
			});
		} catch(e) {/* console.log(e); */} 
	}
	
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	async function _loadDOM_(body){
		return new Promise(async(response,reject)=>{
			try{ 

				const el = _$(body,'load[src]');
				for( var i in el ){ const x = el[i];
					try{ 
						const res = await fetch(x.getAttribute('src'));
						const text = await res.text();
						x.removeAttribute('src');
						x.innerHTML = text;
					} catch(e) { console.error(e);
						data = `/* ${e?.message} */`;
					}
				}

				if( el.length ) response( _loadDOM_(body) );
			} catch(e) {/* console.log(e) */} response();
		});
	}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	const _loadScripts_ = async function(body){
		const scripts = _$(body,'script[type=module],script:not([type]),script[type~=javascript]');
		for(var i in scripts){ 

			const content = scripts[i].innerHTML;
			const file = new Blob([content],{type:'text/javascript'});
			const source = scripts[i].getAttribute('src');
				  scripts[i].remove();

			const element = createElement('script');
			const url = URL.createObjectURL(file);
				  element.src = source || url;

			$('head').appendChild(element);
		}
	}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	const _loadStyles_ = async function(body){
		const links = _$(body,'style');
		for(var i in links){ 

			const content = links[i].innerHTML;
			const file = new Blob([content],{type:'text/css'});
			const source = links[i].getAttribute('src');
				  links[i].remove();

			const element = createElement('link');
			const url = URL.createObjectURL(file);
				element.href = source || url;
				element.rel = 'stylesheet';

			$('head').appendChild(element);
		}
	}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	const _loadToggle_ = async function(element){

		function toggle(id) {
			_$(id).map( x=> x.hidden = x.hidden ? false : true );
		}

		for( var i in element ){ 
			const id = element[i].getAttribute('toggle');
			element[i].removeAttribute('toggle');
			element[i].addEventListener('click',()=>{
				toggle( id );
			});
		}

	}

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

	const _loadComponents_ = async function(){ 
		try{

			if( window['_changing_'] ) return undefined;
				window['_changing_'] = true;
			
			await _loadBases_(_$('*[b64]'));
			await _loadLazys_(_$('*[lazy]'));
			await _loadToggle_(_$('*[toggle]'));

			_$($('body'),'script').map((x)=>x.remove());

			const data = $('body').innerHTML;
			const element = createElement('body');
				  element.innerHTML = data;
			
			//	  await _loadDOM_(element);
				  await _loadCode_(element);
				  await _loadStyles_(element);
				  await _loadScripts_(element);
			
			const out = element.innerHTML;

			if( data != out ) $('body').innerHTML = out;

			window['_changing_'] = false;
		} catch(e) {/* console.error(e) */}
	}

module.exports = _loadComponents_;

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //
},{}],12:[function(require,module,exports){
const output = new Object();

output.gamepad = function( callback ){
    if( !window.Gamepad )
        return console.error(' gamepad is not supported ');
    addEvent( window,'gamepadconnected', (event)=>callback(event) );
}

output.battery = function( callback ){
    return new Promise( async (response,reject)=>{
        if( !window.BatteryManager ) 
            return console.error(' battery is not supported ');
               callback( await navigator.getBattery() );
        return response();
    });
}

output.gyroscope = function( callback ){ 
    if( !window.DeviceOrientationEvent ) 
        return console.error(' gyroscope is not supported ');
    addEvent( window,'deviceorientation', (event)=>callback(event) );
}

output.accelerometer = function( callback ){ 
    if( !window.DeviceMotionEvent )
        return console.error(' Accelerometer is not supported ');
    addEvent( window,'devicemotion', (event)=>callback(event) ); 
}

output.geolocation = async function( callback, _obj ){
    if( !window.navigator.geolocation )
        return console.error(' geolocation is not supported ');
        
    if( typeof( _obj ) !== 'object' ){ 
        _obj = new Object();
        _obj.timeout = 5000;
        _obj.maximumAge = 0;
        _obj.enableHighAccuracy = true;
    }	

    const promise = new Promise( function(res,rej){
        navigator.geolocation.getCurrentPosition( res,rej,_obj );
    });	callback( await promise );
}

module.exports = output;
},{}],13:[function(require,module,exports){
const output = new Object();

function getState(){
    const state = new Object();
    const storage = window.sessionStorage;
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
    for( let i in state ) window.sessionStorage.setItem(i,state[i]);
}

output.clear = function(){ 
    output.state.state = new Object();
    return window.sessionStorage.clear();
}

output.get = function(item){ return output.state.get(item) }
output.observeField = function(...args){ return output.state.observeField(...args) }
output.unObserveField = function(...args){ return output.state.unObserveField(...args) }

module.exports = output;
},{}],14:[function(require,module,exports){
class State {

    state = new Object(); 
    events = new Array();
    update = new Array();
    active = true;

    constructor( state ){
        for( let i in state ){
            this.state[i] = state[i];
        }
    }

    set( state ){ let newState;
        
        const oldState = new Object();
        const keys = Object.keys(this.state);
        keys.map(x=>{ oldState[x]=this.state[x] });

        if( typeof state == 'function' ){
            newState = state( this.state ); const validator = [
                [!newState,'state is empty, please set a return state'],
                [typeof newState != 'object','state is not an object, please return a valid Object'],
            ];  if( validator.some(x=>{ if(x[0]) console.error(x[1]); return x[0] }) ) return 0;
        } else if( !state || typeof state != 'object' ) { 
            return console.error('state is not an object, please return a valid Object') 
        } else { newState = state; } 

        this.active = this.shouldUpdate(null,[this.state,newState]); 
        for( let i in newState ){ this.state[i] = newState[i];
            this.callback( i, oldState[i], newState[i] );
        }

    }

    get( item ){ return this.state[item] }

    shouldUpdate( callback,attr ){
        if( callback && typeof callback == 'function' )
            return this.update.push(callback);
        else if( callback && callback != 'function' )
            return console.error('callback should be a function');
        if( this.update.length == 0 ) return true;
        return this.update.some( x=>x(...attr) );
    }

    forceUpdate( item ){
        for( let i in this.events ){
            const field = this.events[i][0];
            if( this.events[i][0] == item )
                this.events[i][1](
                    this.state[field],
                    this.state[field]
                );
        }
    }

    callback( item, prev, act ){
        if( !this.active ) return 0; 
        for( let i in this.events ){
            if( this.events[i][0] == item )
                this.events[i][1]( prev,act );
        }
    }

    observeField( field,callback ){
        const id = this.eventID();
        const event = [field,callback,id];
        this.events.push(event); return id;
    }

    unObserveField( eventID ){
        for( let i in this.events ){
            if( this.events[i][2] == eventID ){
                this.events.splice(i,1);
                return true;
            }
        }   return false;
    }

    eventID(){
        const item = 'abcdefghijklmn0123456789'.split('');
        const result = new Array(); for( let i=64; i--; ){
            const index = Math.floor( Math.random()*item.length );
            result.push( item[index] );
        }   return result.join('');
    }

}

module.exports = State;
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
const output = new Object();

function formatQuery( search ){
    const result = new Array();
    if( search.length == 0 ) return '';
    for( let i in search ){
        result.push(`${i}=${search[i]}`);
    }   return `?${ result.join('&') }`;
}

function parseQuery( search ){ const obj = new Object();
    const query = search.replace(/\?/i,'').split(/\&/gi);
    if( search == '' ) return new Object();
    for( let i=query.length; i--; ){
        const params = query[i].split(/\=/i);
              obj[params[0]] = params[1];
    }   return obj;
}

output.format = function( URLObject ){
    try {
        const url = new URL(URLObject.host);
              url.hash = URLObject.hash||'';
              url.pathname = URLObject.path||'/';
              url.password = URLObject.password||'';
              url.search = formatQuery( URLObject.query||{} );
        return url.toString();
    } catch(e) {
        console.error('somethig went wrong while formating URL');
    }
}

output.parse = function( URLString ){
    try {
        const url = new Object();
        const obj = new URL(URLString);
              url.hash = obj.hash||'';
              url.path = obj.pathname||'/';
              url.password = obj.password||'';
              url.query = parseQuery( obj.search );
              url.host = obj.origin||window.location.href;
        return url;
    } catch(e) {
        console.error('something went wrong while parsing URL');
    }
}

module.exports = output;
},{}],17:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[8]);
