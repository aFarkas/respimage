(function( factory ) {
	"use strict";
	var interValId;
	var intervalIndex = 0;
	var run = function(){
		if ( window.respimage ) {
			factory( window.respimage );
		}
		if(window.respimage || intervalIndex > 9999){
			clearInterval(interValId);
		}
		intervalIndex++;
	};
	interValId = setInterval(run, 8);

	run();

}( function( respimage ) {
	"use strict";
	if(!window.addEventListener){return;}
	var oldMatches, oldXQant, oldDPR;
	var printMedia = window.matchMedia && matchMedia('print') || {matches: false};
	var ri = respimage._;
	var resetMedia = function(media){
		if(!media){return true;}
		if(media.indexOf('print') != -1){return true;}
		if(oldMatches){return oldMatches.apply(this, arguments);}
	};
	var beforeprint = function(){
		if(!printMedia.matches && !oldMatches){
			oldMatches = ri.matchesMedia;
			ri.matchesMedia = resetMedia;
		}

		if(!oldXQant && !oldDPR && ri.DPR < 1.5 && ri.cfg.xQuant < 1.5){
			oldXQant = ri.cfg.xQuant;
			oldDPR = ri.DPR;
			ri.DPR = 1.5;
			ri.cfg.xQuant = 1.5;
		}
		respimage({reevaluate: true});
	};
	var afterprint = function(){
		if(oldMatches){
			ri.matchesMedia = oldMatches;
			oldMatches = false;
		}
		if(oldXQant){
			ri.cfg.xQuant = oldXQant;
			oldXQant = false;
		}
		if(oldDPR){
			ri.DPR = oldDPR;
			oldDPR = false;
		}
		respimage({reselect: true});
	};



	if('onbeforeprint' in window){
		addEventListener('beforeprint', beforeprint, false);
		addEventListener('afterprint', afterprint, false);
	}
}));
