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

}( function( respimage, undefined ) {
	"use strict";

	var ri = respimage._;
	var knownWidths = {};
	var cfg = ri.cfg;
	var curSrcProp = "currentSrc";
	var setSize = function(width, img, data){
		var curCandidate = data.curCan;
		console.log(width +' '+ curCandidate.url)
		if ( width ) {
			if ( curCandidate.desc.type == "x" ) {
				img.setAttribute( "width", parseInt( (width / curCandidate.res) / cfg.xQuant, 10) );
			} else if ( curCandidate.desc.type == "w" ) {
				img.setAttribute( "width", parseInt( curCandidate.cWidth * (width / curCandidate.desc.val), 10) );
			}
		}
	};
	var loadBg = function(url, img, data){
		var bgImg;
		if(knownWidths[url]){
			setSize(knownWidths[url], img, data);
		} else {
			bgImg = document.createElement('img');
			bgImg.onload = function(){
				knownWidths[url] = bgImg.naturalWidth || bgImg.width;
				if(url == img[curSrcProp]){
					setSize(knownWidths[url], img, data);
				}
				bgImg.onload = null;
				bgImg.onerror = null;
				img = null;
				bgImg = null;
			};
			bgImg.onerror = function(){
				img = null;
				bgImg.onload = null;
				bgImg.onerror = null;
				bgImg = null;
			};
			bgImg.src = url;

			if(bgImg && bgImg.complete){
				bgImg.onload();
			}
		}

	};

	if( !(curSrcProp in document.createElement("img")) ){
		curSrcProp = "src";
	}

	cfg.addSize = true;

	ri.setSize = function( img ) {
		var url;
		var data = img[ ri.ns ];
		var curCandidate = data.curCan;

		if ( data.dims === undefined ) {
			data.dims = img.getAttribute( "height" ) && img.getAttribute( "width" );
		}

		if ( !cfg.addSize || !curCandidate || data.dims ) {return;}
		url = ri.makeUrl(curCandidate.url);
		if(url == img[curSrcProp]){
			loadBg(url, img, data);
		}
	};

}));
