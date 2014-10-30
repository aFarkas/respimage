/*! Respimg - Responsive Images that work today.
 *  Author: Alexander Farkas, 2014
 *  Author: Scott Jehl, Filament Group, 2012 ( new proposal implemented by Shawn Jansepar )
 *  License: MIT
 *  Spec: http://picture.responsiveimages.org/
 */
(function( window, document, undefined ) {
	// Enable strict mode
	"use strict";
	if ( typeof RIDEBUG == "undefined" ) {
		window.RIDEBUG = true;
	}

	// HTML shim|v it for old IE (IE9 will still need the HTML video tag workaround)
	document.createElement( "picture" );

	var currentSrcSupported, curSrcProp;
	// local object for method references and testing exposure
	var ri = {};
	var noop = function() {};
	var image = document.createElement( "img" );
	var getImgAttr = image.getAttribute;
	var setImgAttr = image.setAttribute;
	var removeImgAttr = image.removeAttribute;
	var docElem = document.documentElement;
	var types = {};
	var cfg = {

		//resource selection:
		xQuant: 1,
		tLow: 0.1,
		tHigh: 0.5,
		tLazy: 0.1,
		greed: 0.32
	};
	var srcAttr = "data-risrc";
	var srcsetAttr = srcAttr + "set";
	var supportAbort = (/rident/).test(navigator.userAgent);
	// namespace
	ri.ns = ("ri" + new Date().getTime()).substr(0, 9);

	curSrcProp = "currentSrc";

	if( !(currentSrcSupported = curSrcProp in image) ){
		curSrcProp = "src";
	}

	// srcset support test
	ri.supSrcset = "srcset" in image;
	ri.supSizes = "sizes" in image;

	// using ri.qsa instead of dom traversing does scale much better,
	// especially on sites mixing responsive and non-responsive images
	ri.selShort = "picture>img,img[srcset]";
	ri.sel = ri.selShort;
	ri.cfg = cfg;

	if ( ri.supSrcset ) {
		ri.sel += ",img[" + srcsetAttr + "]";
	}

	var anchor = document.createElement( "a" );
	/**
	 * Gets a string and returns the absolute URL
	 * @param src
	 * @returns {String} absolute URL
	 */
	ri.makeUrl = function(src) {
		anchor.href = src;
		return anchor.href;
	};

	/**
	 * Gets a DOM element or document and a selctor and returns the found matches
	 * Can be extended with jQuery/Sizzle for IE7 support
	 * @param context
	 * @param sel
	 * @returns {NodeList}
	 */
	ri.qsa = function(context, sel) {
		return context.querySelectorAll(sel);
	};

	/**
	 * a trim workaroung mainly for IE8
	 * @param str
	 * @returns {string}
	 */
	function trim( str ) {
		return str.trim ? str.trim() : str.replace( /^\s+|\s+$/g, "" );
	}

	/**
	 * outputs a warning for the developer
	 * @param {message}
	 * @type {Function}
	 */
	var warn = ( window.console && console.warn ) ?
			function( message ) {
				console.warn( message );
			} :
			noop
		;

	var on = function(obj, evt, fn, capture) {
		if ( obj.addEventListener ) {
			obj.addEventListener(evt, fn, capture || false);
		} else if ( obj.attachEvent ) {
			obj.attachEvent( "on"+ evt, fn);
		}
	};
	var off = function(obj, evt, fn, capture) {
		if ( obj.removeEventListener ) {
			obj.removeEventListener(evt, fn, capture || false);
		} else if ( obj.detachEvent ) {
			obj.detachEvent( "on"+ evt, fn);
		}
	};

	/**
	 * Shortcut property for https://w3c.github.io/webappsec/specs/mixedcontent/#restricts-mixed-content ( for easy overriding in tests )
	 */
	var isSSL = location.protocol == "https:";

	/**
	 * Shortcut method for matchMedia ( for easy overriding in tests )
	 * wether native or ri.mMQ is used will be decided lazy on first call
	 * @returns {boolean}
	 */
	ri.matchesMedia = function() {
		if ( window.matchMedia && (matchMedia( "(min-width: 0.1em)" ) || {}).matches ) {
			ri.matchesMedia = function( media ) {
				return !media || ( matchMedia( media ).matches );
			};
		} else {
			ri.matchesMedia = ri.mMQ;
		}

		return ri.matchesMedia.apply( this, arguments );
	};

	/**
	 * Shortcut property for `devicePixelRatio` ( for easy overriding in tests )
	 */
	ri.DPR = ( window.devicePixelRatio || 1 );

	var dprM, tLow, greed, tLazy, tHigh, tMemory, isWinComplete;
	var isVwDirty = true;
	var cssCache = {};
	var sizeLengthCache = {};
	var units = {
		px: 1
	};
	ri.u = units;
	/**
	 * updates the internal vW property with the current viewport width in px
	 */
	function updateMetrics() {
		if(isVwDirty){
			isVwDirty = false;
			cssCache = {};
			sizeLengthCache = {};

			if(!cfg.uT){
				ri.DPR = Math.min( window.devicePixelRatio || 1, 3 );
				if(ri.DPR > 2.5){
					ri.DPR /= 1.12;
				}
			}

			dprM = ri.DPR * cfg.xQuant;
			tLow = cfg.tLow * dprM;
			tLazy = cfg.tLazy * dprM;
			greed = cfg.greed * dprM;
			tHigh = cfg.tHigh;
			tMemory = 1 + dprM + tLazy;

			units.width = window.innerWidth || Math.max(docElem.offsetWidth || 0, docElem.clientWidth || 0);
			units.height = window.innerHeight || Math.max(docElem.offsetHeight || 0, docElem.clientHeight || 0);

			units.vw = units.width / 100;
			units.vh = units.height / 100;
			units.em = ri.getEmValue();
			units.rem = units.em;


		}
	}

	/**
	 * A simplified matchMedia implementation for IE8 and IE9
	 * handles only min-width/max-width with px or em values
	 * @param media
	 * @returns {boolean}
	 */
	ri.mMQ = function( media ) {
		return media ? evalCSS(media) : true;
	};

	/**
	 * gets a mediaquery and returns a boolean or gets a css length and returns a number
	 * @param css mediaqueries or css length
	 * @returns {boolean|number}
	 *
	 * based on: https://gist.github.com/jonathantneal/db4f77009b155f083738
	 */
	var evalCSS = (function(){

		var cache = {};
		var regLength = /^([\d\.]+)(em|vw|px)$/;
		var replace = function() {
			var args = arguments, index = 0, string = args[0];
			while (++index in args) {
				string = string.replace(args[index], args[++index]);
			}
			return string;
		};

		var buidlStr = function(css) {
			if (!cache[css]) {
				cache[css] = "return " + replace((css || "").toLowerCase(),
					// interpret `and`
					/\band\b/g, "&&",

					// interpret `,`
					/,/g, "||",

					// interpret `min-` as >=
					/min-([a-z-\s]+):/g, "e.$1>=",

					// interpret `min-` as <=
					/max-([a-z-\s]+):/g, "e.$1<=",

					//calc value
					/calc([^)]+)/g, "($1)",

					// interpret css values
					/(\d+[\.]*[\d]*)([a-z]+)/g, "($1 * e.$2)",
					//make eval less evil
					/^(?!(e.[a-z]|[0-9\.&=|><\+\-\*\(\)\/])).*/ig, ""
				) + ";";
			}

			return cache[css];
		};


		return function(css, length) {
			var parsedLength;
			if (!(css in cssCache)) {
				cssCache[css] = false;
				if(length && (parsedLength = css.match( regLength ))){
					cssCache[css] = parsedLength[ 1 ] * units[parsedLength[ 2 ]];
				} else {
					/*jshint evil:true */
					try{
						cssCache[css] = new Function("e", buidlStr(css))(units);
					} catch(e){}
					/*jshint evil:false */
				}
			}
			return cssCache[css];
		};
	})();


	/**
	 * Returns the calculated length in css pixel from the given sourceSizeValue
	 * http://dev.w3.org/csswg/css-values-3/#length-value
	 * intended Spec mismatches:
	 * * Does not check for invalid use of CSS functions
	 * * Does handle a computed length of 0 the same as a negative and therefore invalid value
	 * @param sourceSizeValue
	 * @returns {Number}
	 */

	ri.calcLength = function( sourceSizeValue ) {

		var value = evalCSS(sourceSizeValue, true) || false;
		if(value < 0){
			value = false;
		}

		if ( RIDEBUG && (value === false || value < 0) ) {
			warn( "invalid source size: " + sourceSizeValue );
		}
		return value;
	};

	// container of supported mime types that one might need to qualify before using
	ri.types =  types;

	// Add support for standard mime types.
	types["image/jpeg"] = true;
	types["image/gif"] = true;
	types["image/png"] = true;

	// test svg support
	types[ "image/svg+xml" ] = document.implementation.hasFeature( "http://wwwindow.w3.org/TR/SVG11/feature#Image", "1.1" );

	/**
	 * Takes a type string and checks if its supported
	 */

	ri.supportsType = function( type ) {
		return ( type ) ? types[ type ] : true;
	};

	var regSize = /(\([^)]+\))?\s*(.+)/;
	var memSize = {};
	/**
	 * Parses a sourceSize into mediaCondition (media) and sourceSizeValue (length)
	 * @param sourceSizeStr
	 * @returns {*}
	 */
	ri.parseSize = function( sourceSizeStr ) {
		var match;

		if ( !memSize[ sourceSizeStr ] ) {
			match = ( sourceSizeStr || "" ).match(regSize);
			memSize[ sourceSizeStr ] = {
				media: match && match[1],
				length: match && match[2]
			};
		}

		return memSize[ sourceSizeStr ];
	};

	ri.parseSet = function( set ) {
		/*
		 * A lot of this was pulled from Boris Smus’ parser for the now-defunct WHATWG `srcset`
		 * https://github.com/borismus/srcset-polyfill/blob/master/js/srcset-info.js
		 *
		 * 1. Let input (`srcset`) be the value passed to this algorithm.
		 * 2. Let position be a pointer into input, initially pointing at the start of the string.
		 * 3. Let raw candidates be an initially empty ordered list of URLs with associated
		 * unparsed descriptors. The order of entries in the list is the order in which entries
		 * are added to the list.
		 */

		if ( !set.cands ) {

			var pos, url, descriptor, last, descpos, firstDescriptorType;
			var srcset = set.srcset;

			set.cands = [];

			while ( srcset ) {
				srcset = srcset.replace(/^\s+/g,"");
				// 5. Collect a sequence of characters that are not space characters, and let that be url.
				pos = srcset.search(/\s/g);
				descriptor = null;
				if ( pos != -1 ) {
					url = srcset.slice( 0, pos );
					last = url.charAt( url.length - 1 );
					// 6. If url ends with a U+002C COMMA character (,), remove that character from url
					// and let descriptors be the empty string. Otherwise, follow these substeps
					// 6.1. If url is empty, then jump to the step labeled descriptor parser.
					if ( last == "," || !url ) {
						url = url.replace(/,+$/, "");
						descriptor = "";
					}
					srcset = srcset.slice( pos + 1 );
					// 6.2. Collect a sequence of characters that are not U+002C COMMA characters (,), and
					// let that be descriptors.
					if ( descriptor == null ) {
						descpos = srcset.indexOf( "," );
						if ( descpos != -1 ) {
							descriptor = srcset.slice( 0, descpos );
							srcset = srcset.slice( descpos + 1 );
						} else {
							descriptor = srcset;
							srcset = "";
						}
					}
				} else {
					url = srcset;
					srcset = "";
				}

				// 7. Add url to raw candidates, associated with descriptors.
				if ( url && (descriptor = parseDescriptor( descriptor )) ) {

					if ( RIDEBUG ) {
						if ( !firstDescriptorType ) {
							firstDescriptorType = set.sizes ? "w" : descriptor.type;
						}
						if ( firstDescriptorType != descriptor.type ) {
							warn("mixing x with a w descriptor/sizes attribute in one srcset doesn't make sense and is invalid.");
						}
					}
					set.cands.push({
						url: url.replace(/^,+/, ""),
						desc: descriptor,
						set: set
					});
				}
			}
		}

		return set.cands;
	};

	var memDescriptor = {};
	var regDescriptor =  /^([\+eE\d\.]+)(w|x)$/; // currently no h
	var regHDesc = /\s*\d+h\s*/;
	function parseDescriptor( descriptor ) {

		if ( !(descriptor in memDescriptor) ) {
			var descriptorObj = {
				val: 1,
				type: "x"
			};
			var parsedDescriptor = trim( descriptor || "" );

			if ( parsedDescriptor ) {
				parsedDescriptor = parsedDescriptor.replace(regHDesc, "");
				if ( ( parsedDescriptor ).match( regDescriptor ) ) {
					descriptorObj.val =  RegExp.$1 * 1;
					descriptorObj.type = RegExp.$2;

					if ( RIDEBUG && (
						descriptorObj.val < 0 ||
						isNaN( descriptorObj.val ) ||
						(descriptor.type == "w" && /\./.test(descriptorObj.val))
						) ) {
						warn( "bad descriptor: " + descriptor );
					}
				} else {
					descriptorObj = false;

					if ( RIDEBUG ) {
						warn( "unknown descriptor: " + descriptor );
					}
				}
			}

			memDescriptor[ descriptor ] = descriptorObj;
		}

		return memDescriptor[ descriptor ];
	}

	var eminpx;
	// baseStyle also used by getEmValue (i.e.: width: 1em is important)
	var baseStyle = "position:absolute;left:0;visibility:hidden;display:block;padding:0;border:none;font-size:1em;width:1em;overflow:hidden;clip:rect(0px, 0px, 0px, 0px)";
	var fsCss = "font-size:100%!important;";
	/**
	 * returns 1em in css px for html/body default size
	 * function taken from respondjs
	 * @returns {*|number}
	 */
	ri.getEmValue = function() {
		var body;
		if ( !eminpx && (body = document.body) ) {
			var div = document.createElement( "div" ),
				originalHTMLCSS = docElem.style.cssText,
				originalBodyCSS = body.style.cssText;

			div.style.cssText = baseStyle;

			// 1em in a media query is the value of the default font size of the browser
			// reset docElem and body to ensure the correct value is returned
			docElem.style.cssText = fsCss;
			body.style.cssText = fsCss;

			body.appendChild( div );
			eminpx = div.offsetWidth;
			body.removeChild( div );

			//also update eminpx before returning
			eminpx = parseFloat( eminpx, 10 );

			// restore the original values
			docElem.style.cssText = originalHTMLCSS;
			body.style.cssText = originalBodyCSS;

		}
		return eminpx || 16;
	};


	/**
	 * Takes a string of sizes and returns the width in pixels as a number
	 */
	ri.calcListLength = function( sourceSizeListStr ) {
		// Split up source size list, ie ( max-width: 30em ) 100%, ( max-width: 50em ) 50%, 33%
		//
		//                           or (min-width:30em) calc(30% - 15px)
		if ( !(sourceSizeListStr in sizeLengthCache) || cfg.uT ) {
			var sourceSize, parsedSize, length, media, i, len;
			var sourceSizeList = trim( sourceSizeListStr ).split( /\s*,\s*/ );
			var winningLength = false;
			for ( i = 0, len = sourceSizeList.length; i < len; i++ ) {
				// Match <media-condition>? length, ie ( min-width: 50em ) 100%
				sourceSize = sourceSizeList[ i ];
				// Split "( min-width: 50em ) 100%" into separate strings
				parsedSize = ri.parseSize( sourceSize );
				length = parsedSize.length;
				media = parsedSize.media;

				if ( !length ) {
					continue;
				}
				// if there is no media query or it matches, choose this as our winning length
				// and end algorithm
				if ( ri.matchesMedia( media ) && (winningLength = ri.calcLength( length )) !== false ) {
					break;
				}
			}
			// pass the length to a method that can properly determine length
			// in pixels based on these formats: http://dev.w3.org/csswg/css-values-3/#length-value
			sizeLengthCache[ sourceSizeListStr ] = !winningLength ? units.width : winningLength;
		}

		return sizeLengthCache[ sourceSizeListStr ];
	};

	/**
	 * Takes a candidate object with a srcset property in the form of url/
	 * ex. "images/pic-medium.png 1x, images/pic-medium-2x.png 2x" or
	 *     "images/pic-medium.png 400w, images/pic-medium-2x.png 800w" or
	 *     "images/pic-small.png"
	 * Get an array of image candidates in the form of
	 *      {url: "/foo/bar.png", resolution: 1}
	 * where resolution is http://dev.w3.org/csswg/css-values-3/#resolution-value
	 * If sizes is specified, res is calculated
	 */
	ri.setRes = function( set ) {
		var candidates, candidate;
		if ( set ) {

			candidates = ri.parseSet( set );

			for ( var i = 0, len = candidates.length; i < len; i++ ) {
				candidate = candidates[ i ];

				if ( !candidate.descriptor ) {
					setResolution( candidate, set.sizes );
				}
			}
		}
		return candidates;
	};


	ri.applySetCandidate = function( candidates, img ) {
		if ( !candidates.length ) {return;}
		var candidate,
			dpr,
			i,
			j,
			diff,
			length,
			bestCandidate,
			curSrc,
			curCan,
			isSameSet,
			candidateSrc;

		var imageData = img[ ri.ns ];
		var evaled = true;

		curSrc = imageData.curSrc || img[curSrcProp];

		curCan = imageData.curCan || setSrcToCur(img, curSrc, candidates[0].set);

		dpr = ri.getX(candidates, curCan);

		//if we have a current source, we might either become lazy or give this source some advantage
		if ( curSrc ) {
			//add some lazy padding to the src
			if ( curCan ) {
				curCan.res += tLazy;
			}

			isSameSet = !imageData.pic || (curCan && curCan.set == candidates[ 0 ].set);

			if ( curCan && isSameSet && curCan.res >= dpr && tMemory > curCan.res - dpr ) {
				bestCandidate = curCan;

				// if image isn't loaded (!complete + src), test for LQIP or abort technique
			} else if ( !supportAbort && !img.complete && getImgAttr.call( img, "src" ) && !img.lazyload ) {

				//if there is no art direction or if the img isn't visible, we can use LQIP pattern
				if ( isSameSet || !inView( img ) ) {

					bestCandidate = curCan;
					candidateSrc = curSrc;
					evaled = "L";
					if ( isWinComplete ) {
						reevaluateAfterLoad( img );
					}
				}
			}
		}

		if ( !bestCandidate ) {

			candidates.sort( ascendingSort );

			length = candidates.length;
			bestCandidate = candidates[ length - 1 ];

			for ( i = 0; i < length; i++ ) {
				candidate = candidates[ i ];
				if ( candidate.res >= dpr ) {
					j = i - 1;

					// we have found the perfect candidate,
					// but let's improve this a little bit with some assumptions ;-)
					if (candidates[ j ] &&
						(diff = (candidate.res - dpr)) &&
						curSrc != ri.makeUrl( candidate.url ) &&
						chooseLowRes(candidates[ j ].res, diff, dpr)) {
						bestCandidate = candidates[ j ];


					} else {
						bestCandidate = candidate;
					}
					break;
				}
			}
		}

		if ( curSrc && curCan) {
			curCan.res -= tLazy;
		}

		if ( bestCandidate ) {

			candidateSrc = ri.makeUrl( bestCandidate.url );
			// currentSrc attribute and property to match
			// http://picture.responsiveimages.org/#the-img-element
			if ( !currentSrcSupported ) {
				img.currentSrc = candidateSrc;
			}

			imageData.curSrc = candidateSrc;
			imageData.curCan = bestCandidate;

			if ( candidateSrc != curSrc ) {
				ri.setSrc( img, bestCandidate );
				if ( RIDEBUG ) {
					testImgDimensions(img, bestCandidate);
					if(isSSL && !bestCandidate.url.indexOf( "http:" )){
						warn( "insecure: " + candidateSrc );
					}
				}
			} else {
				ri.setSize( img );
			}
		}

		return evaled;
	};
	if ( RIDEBUG ) {
		var testImgDimensions = function (img, candidate) {
			var onload = function () {
				var dif, xtreshhold;
				var imgWidth = img.offsetWidth;
				var naturalWidth = img.naturalWidth;
				var canWidth = candidate.cWidth;
				var res = ri.DPR * cfg.xQuant;
				var hTresh =  0.84;
				var lTresh = res > 1 ? 0.5 : 0.75;


				if(!canWidth && naturalWidth && candidate.desc.type == 'x'){
					canWidth = naturalWidth / res;
				}

				if (imgWidth && canWidth) {
					if (imgWidth > canWidth) {
						dif = canWidth / imgWidth;
						xtreshhold = lTresh;
					} else {
						dif = imgWidth / canWidth;
						xtreshhold = hTresh;
					}

					if(Math.abs(imgWidth - canWidth) > 50){
						if (candidate.desc.type == 'w' && dif < 0.86) {
							warn("Check your sizes attribute: " + candidate.set.sizes + " was calculated to: " + canWidth + "px. But your image is shown with a size of " + imgWidth + "px. img: "+ candidate.url);
						} else if(candidate.desc.type == 'x' && dif < xtreshhold){
							warn("Image too much resized. Image was shown with "+ imgWidth +" but has a normalized width of "+ canWidth +". Maybe you should use a w descriptor instead of an x descriptor. img: "+ candidate.url);
						}
					}
				}


				if(naturalWidth && candidate.desc.type == 'w' && candidate.desc.val && ri.makeUrl(candidate.desc.url) == img.src){
					if (naturalWidth > candidate.desc.val) {
						dif = candidate.desc.val / naturalWidth;
					} else {
						dif = naturalWidth / candidate.desc.val;
					}
					if (dif < 0.9 && Math.abs(candidate.desc.val - naturalWidth) > 30) {
						warn("Check your w descriptor: " + candidate.desc.val + "w but width of your image was: " +naturalWidth + " image.src: " + candidate.url);
					}
				}
				off(img, "load", onload);
			};

			on(img, "load", onload);
		};
	}
	ri.getX = function(){
		return ri.DPR * cfg.xQuant;
	};

	function chooseLowRes( lowRes, diff, dpr ) {
		if( lowRes / dpr > 0.2 ) {
			lowRes += (diff * greed);
			if ( diff > tHigh ) {
				lowRes += tLow;
			}
		}
		return lowRes > dpr;
	}

	function inView(el) {
		if(!el.getBoundingClientRect){return true;}
		var rect = el.getBoundingClientRect();
		var bottom, right, left, top;

		return !!(
		(bottom = rect.bottom) >= -9 &&
		(top = rect.top) <= units.height + 9 &&
		(right = rect.right) >= -9 &&
		(left = rect.left) <= units.height + 9 &&
		(bottom || right || left || top)
		);
	}

	ri.setSrc = function( img, bestCandidate ) {
		var origWidth;
		img.src = bestCandidate.url;

		// although this is a specific Safari issue, we don't want to take too much different code paths
		if ( bestCandidate.set.type == "image/svg+xml" ) {
			origWidth = img.style.width;
			img.style.width = (img.offsetWidth + 1) + "px";

			// next line only should trigger a repaint
			// if... is only done to trick dead code removal
			if ( img.offsetWidth + 1 ) {
				img.style.width = origWidth;
			}
		}
		ri.setSize(img);
	};

	ri.setSize = noop;

	function applyBestCandidate( img ) {
		var srcSetCandidates;
		var matchingSet = ri.getSet( img );
		var evaluated = false;
		if ( matchingSet != "pending" ) {
			evaluated = true;
			if ( matchingSet ) {
				srcSetCandidates = ri.setRes( matchingSet );
				evaluated = ri.applySetCandidate( srcSetCandidates, img );
			}

		}
		img[ ri.ns ].evaled = evaluated;
	}

	function ascendingSort( a, b ) {
		return a.res - b.res;
	}

	ri.getSet = function( img ) {
		var i, set, supportsType;
		var match = false;
		var sets = img [ ri.ns ].sets;

		for ( i = 0; i < sets.length && !match; i++ ) {
			set = sets[i];

			if ( !set.srcset || !ri.matchesMedia( set.media ) || !(supportsType = ri.supportsType( set.type )) ) {
				continue;
			}

			if ( supportsType == "pending" ) {
				set = supportsType;
			}

			match = set;
			break;
		}

		return match;
	};

	function setSrcToCur( img, src, set ) {
		var candidate;
		if ( !set && src ) {
			set = img[ ri.ns ].sets;
			set = set && set[set.length - 1];
		}

		candidate = getCandidateForSrc(src, set);

		if ( candidate ) {
			src = ri.makeUrl(src);
			img[ ri.ns ].curSrc = src;
			img[ ri.ns ].curCan = candidate;
			if ( !currentSrcSupported ) {
				img.currentSrc = src;
			}
			if ( !candidate.res ) {
				setResolution( candidate, candidate.set.sizes );
			}
		}
		return candidate;
	}

	function getCandidateForSrc( src, set ) {
		var i, candidate, candidates;
		if ( src && set ) {
			candidates = ri.parseSet( set );
			src = ri.makeUrl(src);
			for ( i = 0; i < candidates.length; i++ ) {
				if ( src == ri.makeUrl(candidates[ i ].url) ) {
					candidate = candidates[ i ];
					break;
				}
			}
		}
		return candidate;
	}

	function hasOneX(set){
		var i, ret, candidates, desc;
		if( set ) {
			candidates = ri.parseSet(set);
			for ( i = 0; i < candidates.length; i++ ) {
				desc = candidates[i].desc;
				if ( desc.type == "x" && desc.val == 1 ) {
					ret = true;
					break;
				}
			}
		}
		return ret;
	}

	var alwaysCheckWDescriptor = ri.supSrcset && !ri.supSizes;
	ri.parseSets = function( element, parent ) {

		var srcsetAttribute, fallbackCandidate, isWDescripor, srcsetParsed;

		var hasPicture = parent.nodeName.toUpperCase() == "PICTURE";
		var imageData = element[ ri.ns ];
		if ( imageData.src === undefined ) {
			imageData.src = getImgAttr.call( element, "src" );
			if ( imageData.src ) {
				setImgAttr.call( element, srcAttr, imageData.src );
			} else {
				removeImgAttr.call( element, srcAttr );
			}
		}

		if ( imageData.srcset === undefined ) {
			srcsetAttribute = getImgAttr.call( element, "srcset" );
			imageData.srcset = srcsetAttribute;
			srcsetParsed = true;
		}

		if ( imageData.dims === undefined ) {
			imageData.dims = getImgAttr.call( element, "height" ) && getImgAttr.call( element, "width" );
		}

		imageData.sets = [];

		if ( hasPicture ) {
			imageData.pic = true;
			getAllSourceElements( parent, imageData.sets );
		}

		if ( imageData.srcset ) {
			fallbackCandidate = {
				srcset: imageData.srcset,
				sizes: getImgAttr.call( element, "sizes" )
			};

			imageData.sets.push( fallbackCandidate );

			isWDescripor = (alwaysCheckWDescriptor || imageData.src) ?
				hasWDescripor( fallbackCandidate ) :
				false;

			// add normal src as candidate, if source has no w descriptor
			if ( !isWDescripor && imageData.src && !getCandidateForSrc(imageData.src, fallbackCandidate) && !hasOneX(fallbackCandidate) ) {
				fallbackCandidate.srcset += ", " + imageData.src;
				fallbackCandidate.cands = false;
			}

			if ( RIDEBUG && !hasPicture && isWDescripor && imageData.src && fallbackCandidate.srcset.indexOf(element[ ri.ns ].src) == -1 ) {
				warn("The fallback candidate (`src`) isn't described inside the srcset attribute. Normally you want to describe all available candidates.");
			}

		} else if ( imageData.src ) {
			imageData.sets.push( {
				srcset: imageData.src,
				sizes: null
			} );
		}

		imageData.curCan = null;

		// if img has picture or the srcset was removed or has a srcset and does not support srcset at all
		// or has a w descriptor (and does not support sizes) set support to false to evaluate
		imageData.supported = !( hasPicture || ( fallbackCandidate && !ri.supSrcset ) || isWDescripor );

		if ( srcsetParsed && ri.supSrcset && !imageData.supported ) {
			if ( srcsetAttribute ) {
				setImgAttr.call( element, srcsetAttr, srcsetAttribute );
				element.srcset = "";
			} else {
				removeImgAttr.call( element, srcsetAttr );
			}
		}
		if ( RIDEBUG ) {
			testMediaOrder(imageData.sets, 'source');
		}
		imageData.parsed = true;
	};

	function hasWDescripor( set ) {
		if ( !set ) {
			return false;
		}
		var candidates = ri.parseSet( set );

		return candidates[ 0 ] && candidates[ 0 ].desc.type == "w";
	}

	function getAllSourceElements( picture, candidates ) {
		var i, len, source, srcset;

		// SPEC mismatch intended for size and perf:
		// actually only source elements preceding the img should be used
		// also note: don't use qsa here, because IE8 sometimes doesn't like source as the key part in a selector
		var sources = picture.getElementsByTagName( "source" );

		for ( i = 0, len = sources.length; i < len; i++ ) {
			source = sources[ i ];
			source[ ri.ns ] = true;
			srcset = source.getAttribute( "srcset" );

			if ( RIDEBUG && document.documentMode != 9 && source.parentNode != picture ) {
				warn( "all source elements have to be a child of the picture element. For IE9 support wrap them in an audio/video element, BUT with conditional comments" );
			}
			// if source does not have a srcset attribute, skip
			if ( srcset ) {
				candidates.push( {
					srcset: srcset,
					media: source.getAttribute( "media" ),
					type: source.getAttribute( "type" ),
					sizes: source.getAttribute( "sizes" )
				} );
			}
			if ( RIDEBUG && source.getAttribute( "src" ) ) {
				warn( "`src` on `source` invalid, use `srcset`." );
			}
		}

		if ( RIDEBUG ) {
			var srcTest = ri.qsa( picture, "source, img");
			if ( srcTest[ srcTest.length - 1].nodeName.toUpperCase() == "SOURCE" ) {
				warn( "all sources inside picture have to precede the img element" );
			}
		}
	}

	function setResolution( candidate, sizesattr ) {
		var descriptor = candidate.desc;

		if ( descriptor.type == "w" ) { // h = means height: || descriptor.type == 'h' do not handle yet...
			candidate.cWidth = ri.calcListLength( sizesattr || "100vw" );
			candidate.res = descriptor.val / candidate.cWidth ;
		} else {
			candidate.res = descriptor.val;
		}
		return candidate;
	}

	if(RIDEBUG){
		var testMediaOrder = (function(){
			var regex = {
				minw: /^\s*\(\s*min\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)\s*$/,
				maxw: /^\s*\(\s*max\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)\s*$/
			};

			var checkSetOrder = function(set, sets, index, type){
				var i, curSet;
				for(i = 0; i < index && i < sets.length; i++){
					curSet = sets[i];
					if((set._min && curSet._min && set._min >= curSet._min) || (set._max && curSet._max && set._max <= curSet._max)){
						if(type == 'source'){
							warn("Order of your source elements matters. Defining "+ set.media + " after "+ curSet.media +" doesn't make sense.");
						} else {
							warn("Order inside your sizes attribute does matter. Defining "+ set.media + " after "+ curSet.media +" doesn't make sense.");
						}
					}
				}
			};
			var mediaTest = function(sets, type){
				var i, len, set, lastSet;

				lastSet = sets[sets.length - 1];
				if(lastSet && (lastSet.media || lastSet.type)){
					if(type == 'source'){
						warn("The last src/srcset shouldn't have any type or media conditions. Use img[src] or img[srcset].");
					} else {
						warn("Last sizes attribute shouldn't have any condition otherwise 100vw is used.");
					}
				}
				for(i = 0, len = sets.length; i < len; i++){
					set = sets[i];
					if(!set.media){
						if(!set.type && i != len - 1){
							if(type == 'source'){
								warn("A source element without [media] and [type] doesn't make any sense. Last srcset can be used at the img element. Order is important!");
							} else {
								warn("The order of your sizes attribute does matter! The sizes length without a media condition has to be defined as last entry.");
							}
						}
						continue;
					}
					set._min = set.media.match( regex.minw ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" );
					set._max = set.media.match( regex.maxw ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" );


					if ( set._min ) {
						set._min = parseFloat( set._min, 10 ) * (set._min.indexOf( "em" ) > 0 ? ri.getEmValue() : 1);
					}

					if ( set._max ) {
						set._max = parseFloat( set._max, 10 ) * (set._max.indexOf( "em" ) > 0 ? ri.getEmValue() : 1);
					}
					if(set._min || set._max){
						checkSetOrder(set, sets, i, type);
					}
				}
			};

			return function(sets){
				var i, len, sizes, j, sizesSet;

				mediaTest(sets, 'source');

				for(i = 0, len = sets.length; i < len; i++){
					sizes = trim(sets[i].sizes || '');
					if(sizes){
						sizesSet = [];
						sizes = sizes.split( /\s*,\s*/ );
						for(j = 0; j < sizes.length; j++){
							if(sizes[j]){
								sizesSet.push(ri.parseSize( sizes[j] ));
							}
						}

						if(sizesSet.length){
							mediaTest(sizesSet, 'sizes');
						}
					}
				}
			};
		})();
	}
	/**
	 * adds an onload event to an image and reevaluates it, after onload
	 */
	var reevaluateAfterLoad = (function(){
		var onload = function(){
			off( this, "load", onload );
			off( this, "error", onload );
			ri.fillImgs( {elements: [this]} );
		};
		return function( img ){
			off( img, "load", onload );
			off( img, "error", onload );
			on( img, "error", onload );
			on( img, "load", onload );
		};
	})();


	ri.fillImg = function(element, options) {
		var parent, imageData;
		var extreme = options.reparse || options.reevaluate;

		// expando for caching data on the img
		if ( !element[ ri.ns ] ) {
			element[ ri.ns ] = {};
		}

		imageData = element[ ri.ns ];

		if ( imageData.evaled == "L" && element.complete ) {
			imageData.evaled = false;
		}

		// if the element has already been evaluated, skip it
		// unless `options.reevaluate` is set to true ( this, for example,
		// is set to true when running `respimage` on `resize` ).
		if ( !extreme && imageData.evaled ) {
			return;
		}

		if ( !imageData.parsed || options.reparse ) {
			parent = element.parentNode;
			if ( !parent ) {
				return;
			}
			ri.parseSets( element, parent, options );
		}

		if ( !imageData.supported ) {
			applyBestCandidate( element );
		} else {
			imageData.evaled = true;
		}
	};

	var resizeThrottle;

	ri.setupRun = function( options ) {
		if ( !alreadyRun || options.reevaluate || isVwDirty ) {
			updateMetrics();

			// if all images are reevaluated clear the resizetimer
			if ( !options.elements && !options.context ) {
				clearTimeout( resizeThrottle );
			}
		}
	};

	ri.teardownRun = noop;

	/**
	 * alreadyRun flag used for setOptions. is it true setOptions will reevaluate
	 * @type {boolean}
	 */
	var alreadyRun = false;

	/**
	 *
	 * @param opt
	 */
	var respimage = function( opt ) {
		var elements, i, plen;

		var options = opt || {};

		if ( options.elements && options.elements.nodeType == 1 ) {
			if ( options.elements.nodeName.toUpperCase() == "IMG" ) {
				options.elements =  [ options.elements ];
			} else {
				options.context = options.elements;
				options.elements =  null;
			}
		}

		elements = options.elements || ri.qsa( (options.context || document), ( options.reevaluate || options.reparse ) ? ri.sel : ri.selShort );

		if ( (plen = elements.length) ) {

			ri.setupRun( options );
			alreadyRun = true;

			// Loop through all elements
			for ( i = 0; i < plen; i++ ) {
				ri.fillImg(elements[ i ], options);
			}

			ri.teardownRun( options );
		}
	};

	//use this internally for easy monkey patching/performance testing
	ri.fillImgs = respimage;

	// If picture is supported, well, that's awesome.
	if ( window.HTMLPictureElement ) {
		respimage = noop;
		ri.fillImg = noop;
	} else {
		/**
		 * Sets up picture polyfill by polling the document
		 * Also attaches respimage on resize and readystatechange
		 */
		(function() {

			var run = function() {
				var readyState = document.readyState || "";
				clearTimeout( timerId );

				timerId = setTimeout(run, readyState == "loading" ? 300 : 3000);
				if ( document.body ) {
					if ( /d$|^c/.test( readyState ) ) {
						isWinComplete = true;
						clearTimeout( timerId );

						off( document, "readystatechange", run );
					}
					ri.fillImgs();
				}
			};

			var resizeEval = function() {
				ri.fillImgs({ reevaluate: true });
			};

			var onResize = function() {
				clearTimeout( resizeThrottle );
				isVwDirty = true;
				resizeThrottle = setTimeout( resizeEval, 99 );
			};

			var timerId = setTimeout(run, document.body ? 9 : 99);

			on( window, "resize", onResize );
			on(document, "readystatechange", run);
		})();
	}

	/* expose methods for testing */
	respimage._ = ri;

	respimage.config = function(name, value, value2) {
		if ( name == "addType" ) {
			types[value] = value2;
			if ( value2 == "pending" ) {return;}
		} else {
			cfg[ name ] = value;
		}
		if ( alreadyRun ) {
			ri.fillImgs( { reevaluate: true } );
		}
	};

	/* expose respimage */
	window.respimage = respimage;

	if ( RIDEBUG ) {
		warn( "Responsive image debugger active. Do not use in production, because it slows things down! extremly" );

		if(!document.querySelector){
			warn("querySelector is needed. IE8 needs to be in strict and edge mode: http://bit.ly/1yGgYU0");
		}
		if( (document.getElementsByTagName("picture")[0] ||{} ).outerHTML == "<PICTURE>" ){
			warn("IE8 needs to picture shived. Either include respimage.js in <head> or use html5shiv.");
		}
	}
} )( window, document );
