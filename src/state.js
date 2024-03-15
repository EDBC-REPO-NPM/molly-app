const Event = require("events");

class Output {

    state = new Object();
    obsrv = new Event();

    /*---------------------------------------------------------*/

    constructor( state ){
        for( var i in state ) this.state[i] = state[i];
    }

    /*---------------------------------------------------------*/

    set( state ){ var newState;
        
        const oldState = new Object();
        const keys = Object.keys(this.state);
        keys.map(function(x){ oldState[x]=this.state[x] });

        if( typeof state == 'function' ){
            newState = state( this.state ); const validator = [
                [!newState,'input is empty, please set a returnable state'],
                [typeof newState != 'object','input is not an object, please return a valid Object'],
            ];  if( validator.some(function(x){ if(x[0]) console.error(x[1]); return x[0] }) ) return 0;
        } else if( !state || typeof state != 'object' ) { 
            return console.error('input is not an object, please return a valid Object') 
        } else { newState = state; } 

        for( var i in newState ){ this.state[i] = newState[i];
            this.obsrv.emit( i, oldState[i], newState[i] );
        }

    }

    /*---------------------------------------------------------*/

    once( ...args ){ return this.obsrv.once( ...args ); }

    off( ...args ){ return this.obsrv.off( ...args ); }

    on( ...args ){ return this.obsrv.on( ...args ); }

    get( item ){ return this.state[item]; }

    /*---------------------------------------------------------*/

}

module.exports = Output;