const state = require('./state.js');
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
	
output.isMobile = ()=>{
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

output.isDesktop = ()=>{
	return [
		!output.isTV(),
		!output.isMobile(),
	].every( x=>x );
}

output.isTV = ()=>{
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
	
output.getBrowser = ()=>{
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
	
output.getOS = ()=>{
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

output.state = new state({
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

output.get  = function(item)   { return output.state.get(item); }
output.on   = function(...args){ return output.state.on(...args); }
output.off  = function(...args){ return output.state.off(...args); }
output.once = function(...args){ return output.state.once(...args); }

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

module.exports = output;