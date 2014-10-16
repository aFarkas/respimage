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

	var ri = respimage._;
	var oldConfig = respimage.config;
	var cfg = ri.cfg;
	var extraCfgs = {
		lowbandwidth: {
			greed: 2,
			tHigh: 0.6,
			tLow: 1.1,
			xQuant: ri.DPR > 1 ? 0.8 : 0.93,
			tLazy: 2
		}
	};
	var change = function(val, config){
		var prop;
		for ( prop in config ) {
			if ( val ) {
				cfg[prop] *= config[prop];
			} else {
				cfg[prop] /= config[prop];
			}
		}
	};

	if(cfg.lowbandwidth){
		change(true, extraCfgs.lowbandwidth);
	}

	respimage.config = function(name, value){
		if (extraCfgs[name]) {
			value = !!value;
			if( value != cfg[name] ) {
				change(value, extraCfgs[name]);
			}
		}

		return oldConfig.apply(this, arguments);
	};

	if ( ri.DPR > 1.2 ) {
		(function(){

			var regSTypes = /gif|png|svg/;
			var regSext = /\.gif|\.png|\.svg/;
			var isSharpType = function(set){
				return regSTypes.test(set.type || '') || regSext.test(set.srcset || set.src || '');
			};
			extraCfgs.constrainDPI =  {
				tHigh: 0.9,
				xQuant: 0.95,
				greed: 1.5
			};


			ri.getX = function(candidates){
				var set = candidates[0].set;
				var ret = ri.DPR * cfg.xQuant;
				if (cfg.constrainDPI && !isSharpType(set)) {
					ret *= 0.85;
					if ( ret > 1.5 ) {
						ret = 1.5;
					}
				}
				return ret;
			};

			cfg.constrainDPI = true;
			change(true, extraCfgs.constrainDPI);
		})();
	}

}));
