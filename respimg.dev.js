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

	// local object for method references and testing exposure
	var lengthElInstered, lengthEl, currentSrcSupported, curSrcProp;
	var ri = {};
	var noop = function() {};
	var image = document.createElement( "img" );
	var getImgAttr = image.getAttribute;
	var setImgAttr = image.setAttribute;
	var removeImgAttr = image.removeAttribute;
	var docElem = document.documentElement;
	var types = {};

	/*
	do not take these examples to serious
	var unknownBandwidth = {
		xQuant: 1,
		tLow: 0.1,
		tHigh: 0.6,
		tLazy: 0.25,
	 	greed: 0.2
	};
	var highBandwidth = {
		xQuant: 1,
		tLow: 0,
		tHigh: 3,
		tLazy: 0.1,
	 	greed: 0.1
	};
	var lowBandwidth = {
		xQuant: 0.8,
		tLow: 0.2,
		tHigh: 0.4,
		tLazy: 0.5,
	 	greed: 0.3
	};
	*/
	var cfg = {
		addSize: false,
		//resource selection:
		xQuant: 1,
		tLow: 0.1,
		tHigh: 0.5,
		tLazy: 0.3,
		greed: 0.2
		//useGD: if set to true: always prefer gracefully degradation over polyfill
		//,useGD: false
	};
	var srcAttr = "data-risrc";
	var srcsetAttr = srcAttr + "set";
	// namespace
	ri.ns = ("ri" + new Date().getTime()).substr(0, 9);

	currentSrcSupported = "currentSrc" in image;

	curSrcProp = currentSrcSupported ? "currentSrc" : "src";
	ri.isReady = false;

	// srcset support test
	ri.supSrcset = "srcset" in image;
	ri.supSizes = "sizes" in image;

	// using ri.qsa instead of dom traversing does scale much better,
	// especially on sites mixing responsive and non-responsive images
	ri.selShort = "picture > img, img[srcset]";
	ri.sel = ri.selShort;
	ri.cfg = cfg;

	if ( ri.supSrcset ) {
		ri.sel += ", img[" + srcsetAttr + "]";
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
	var warn = ( window.console && typeof console.warn == "function" ) ?
		function( message ) {
			console.warn( message );
		} :
		noop
	;

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
		if ( window.matchMedia && matchMedia( "(min-width: 0.1em)" ).matches ) {
			ri.matchesMedia = function( media ) {
				return !media || ( matchMedia( media ).matches );
			};
		} else {
			ri.matchesMedia = ri.mMQ;
		}

		return ri.matchesMedia.apply( this, arguments );
	};

	ri.vW = 0;
	var isVwDirty = true;
	/**
	 * updates the internal vW property with the current viewport width in px
	 */
	function updateView() {
		isVwDirty = false;
		ri.vW = window.innerWidth || docElem.clientWidth;
	}

	var regex = {
		minw: /\(\s*min\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/,
		maxw: /\(\s*max\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/
	};
	var mediaCache = {};
	/**
	 * A simplified matchMedia implementation for IE8 and IE9
	 * handles only min-width/max-width with px or em values
	 * @param media
	 * @returns {boolean}
	 */
	ri.mMQ = function( media ) {
		var min, max;
		var ret = false;
		if ( !media ) { return true; }
		if ( !mediaCache[ media ] ) {

			min = media.match( regex.minw ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" );
			max = media.match( regex.maxw ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" );

			if ( min ) {
				min = parseFloat( min, 10 ) * (min.indexOf( "em" ) > 0 ? ri.getEmValue() : 1);
			}

			if ( max ) {
				max = parseFloat( max, 10 ) * (max.indexOf( "em" ) > 0 ? ri.getEmValue() : 1);
			}

			mediaCache[ media ] = {
				min: min,
				max: max
			};
		}
		min = mediaCache[ media ].min;
		max = mediaCache[ media ].max;

		if ( (min && ri.vW >= min) || (max && ri.vW <= max) ) {
			ret = true;
		}

		return ret;
	};

	/**
	 * Shortcut property for `devicePixelRatio` ( for easy overriding in tests )
	 */
	ri.DPR = ( window.devicePixelRatio || 1 );

	var lengthCache = {};
	var regLength = /^([\d\.]+)(em|vw|px)$/;
	// baseStyle also used by getEmValue (i.e.: width: 1em is important)
	var baseStyle = "position: absolute;left:0;visibility:hidden;display:block;padding:0;margin:0;border:none;font-size:1em;width:1em;";
	/**
	 * Returns the calculated length in css pixel from the given sourceSizeValue
	 * http://dev.w3.org/csswg/css-values-3/#length-value
	 * intended Spec mismatches:
	 * * Does not check for invalid use of %
	 * * Does not check for invalid use of CSS functions
	 * * Does handle a computed length of 0 the same as a negative and therefore invalid value
	 * @param sourceSizeValue
	 * @returns {Number}
	 */
	ri.calcLength = function( sourceSizeValue ) {
		var failed, parsedLength;
		var orirgValue = sourceSizeValue;
		var value = false;

		if ( !(orirgValue in lengthCache) ) {

			parsedLength = sourceSizeValue.match( regLength );

			if ( parsedLength ) {

				parsedLength[ 1 ] = parseFloat( parsedLength[ 1 ], 10 );

				if ( !parsedLength[ 1 ] ) {
					value = false;
				} else if ( parsedLength[ 2 ] == "vw" ) {
					value = ri.vW * parsedLength[ 1 ] / 100;
				} else if ( parsedLength[ 2 ] == "em" ) {
					value = ri.getEmValue() * parsedLength[ 1 ];
				} else {
					value = parsedLength[ 1 ];
				}

			} else if ( sourceSizeValue.indexOf("calc") > -1 || parseInt( sourceSizeValue, 10 ) ) {

				if( RIDEBUG && /%$/.test(sourceSizeValue) ) {
					warn( "invalid source size. no % length allowed: " + orirgValue );
				}
				/*
				 * If length is specified in  `vw` units, use `%` instead since the div we’re measuring
				 * is injected at the top of the document.
				 *
				 * TODO: maybe we should put this behind a feature test for `vw`?
				 */
				sourceSizeValue = sourceSizeValue.replace( "vw", "%" );

				// Create a cached element for getting length value widths
				if ( !lengthEl ) {
					lengthEl = document.createElement( "div" );
					// Positioning styles help prevent padding/margin/width on `html` from throwing calculations off.
					lengthEl.style.cssText = baseStyle;
				}

				if ( !lengthElInstered ) {
					lengthElInstered = true;
					docElem.insertBefore( lengthEl, docElem.firstChild );
				}

				// set width to 0px, so we can detect, wether style is invalid/unsupported
				lengthEl.style.width = "0px";
				try {
					lengthEl.style.width = sourceSizeValue;
				} catch(e){
					failed = true;
				}

				value = lengthEl.offsetWidth;

				if ( failed ) {
					// Something has gone wrong. `calc()` is in use and unsupported, most likely.
					value = false;
				}
			}

			if ( value <= 0 ) {
				value = false;
			}

			lengthCache[ orirgValue ] = value;

			if ( RIDEBUG && value === false ) {
				warn( "invalid source size: " + orirgValue );
			}
		}

		return lengthCache[ orirgValue ];
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
							firstDescriptorType = descriptor.type;
						} else if ( firstDescriptorType != descriptor.type ) {
							warn("mixing x with a w descriptor in one srcset doesn't make sense and is invalid.");
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

	function parseDescriptor( descriptor ) {

		if ( !(descriptor in memDescriptor) ) {
			var descriptorObj = {
				val: 1,
				type: "x"
			};
			var parsedDescriptor = trim( descriptor || "" );

			if ( parsedDescriptor ) {
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
	var fsCss = "font-size:100% !important;";
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

	var sizeLengthCache = {};
	/**
	 * Takes a string of sizes and returns the width in pixels as a number
	 */
	ri.calcListLength = function( sourceSizeListStr ) {
		// Split up source size list, ie ( max-width: 30em ) 100%, ( max-width: 50em ) 50%, 33%
		//
		//                           or (min-width:30em) calc(30% - 15px)

		if ( !(sourceSizeListStr in sizeLengthCache) || cfg.noCache ) {
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
			sizeLengthCache[ sourceSizeListStr ] = !winningLength ? ri.vW : winningLength;
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
	var dprM, tLow, greed, tLazy;
	ri.applySetCandidate = function( candidates, img ) {
		if ( !candidates.length ) {return;}
		var candidate,
			i,
			j,
			diff,
			length,
			bestCandidate,
			curSrc,
			curCan,
			candidateSrc;

		var dpr = ri.DPR * cfg.xQuant;

		curSrc = img[ ri.ns ].curSrc || img[curSrcProp];

		curCan = img[ ri.ns ].curCan || setSrcToCur(img, curSrc, candidates[0].set);

		//if current candidate is coming from the same set and also fit + some "lazy advantage", do not change
		if ( curCan && curCan.set == candidates[ 0 ].set && (curCan.res + tLazy) >= dpr ) {
			bestCandidate = curCan;
			candidateSrc = curSrc;
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
						curSrc != (candidateSrc = ri.makeUrl( candidate.url )) &&
						chooseLowRes(candidates[ j ].res, diff, dpr)) {
						bestCandidate = candidates[ j ];
					} else {
						bestCandidate = candidate;
					}
					break;
				}
			}
		}

		if ( bestCandidate ) {

			if ( !candidateSrc ) {
				candidateSrc = ri.makeUrl( bestCandidate.url );
			}
			// currentSrc attribute and property to match
			// http://picture.responsiveimages.org/#the-img-element
			if ( !currentSrcSupported ) {
				img.currentSrc = candidateSrc;
			}

			img[ ri.ns ].curSrc = candidateSrc;
			img[ ri.ns ].curCan = bestCandidate;

			if ( candidateSrc != curSrc ) {
				if ( RIDEBUG && isSSL && !bestCandidate.url.indexOf( "http:" ) ) {
					warn( "insecure: " + candidateSrc );
				}
				ri.loadImg( img, bestCandidate );
			} else {
				ri.setSize( img );
			}
		}
	};

	function chooseLowRes(lowRes, diff, dpr){
		if( lowRes / dpr > 0.4 ) {
			lowRes += (diff * greed);
			if ( diff > cfg.tHigh ) {
				lowRes += tLow;
			}
		}
		return lowRes > dpr;
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
	};

	ri.loadImg = function( img, bestCandidate ) {

		var cleanUp = img[ ri.ns ].loadGC;

		var directSrcChange = ( !img.complete || !getImgAttr.call( img, "src" ) );

		var srcWasSet = false;
		var setSrc = function() {
			if ( !srcWasSet ) {
				srcWasSet = true;
				ri.setSrc( img, bestCandidate );
			}
		};

		if ( cleanUp ) {
			cleanUp();
		}

		if ( !directSrcChange || img.naturalWidth > 9 ) {
			loadInBackground( img, bestCandidate.url, setSrc );
		} else {
			setSrc();
		}

	};

	function loadInBackground( img, url, successCB ) {
		var bImg = document.createElement( "img" );

		img[ ri.ns ].loadGC = function() {
			if ( img ) {
				img[ ri.ns ].loadGC = null;
				img = null;
				bImg.onload = null;
				bImg.onerror = null;
				bImg = null;
			}
		};

		bImg.onload = function() {
			if ( img ) {
				if ( !img[ ri.ns].nws ) {
					img[ ri.ns].nws = {};
				}

				if ( successCB ) {
					successCB(this);
				}
				img[ ri.ns ].loadGC();
			}
		};

		bImg.onerror = img[ ri.ns ].loadGC;

		bImg.src = url;
	}

	var intrinsicSizeHandler = function(){
		this.removeEventListener("load", intrinsicSizeHandler, false);
		ri.setSize(this);
	};
	ri.setSize = function( img ) {
		var width;
		var curCandidate = img[ ri.ns ].curCan;

		if ( !cfg.addSize || !curCandidate || img[ ri.ns].dims ) {return;}

		if ( !img.complete ) {
			img.removeEventListener("load", intrinsicSizeHandler, false);
			img.addEventListener("load", intrinsicSizeHandler, false);
		}
		width = img.naturalWidth;

		if ( width ) {
			if ( curCandidate.desc.type == "x" ) {
				setImgAttr.call( img, "width", parseInt( (width / curCandidate.res) / cfg.xQuant, 10) );
			} else if ( curCandidate.desc.type == "w" ) {
				setImgAttr.call( img, "width", parseInt( curCandidate.cWidth * (width / curCandidate.desc.val), 10) );
			}
		}
	};

	if ( !document.addEventListener || !("naturalWidth" in image) || !("complete" in image) ) {
		ri.setSize = noop;
	}

	function applyBestCandidate( img ) {
		var srcSetCandidates;
		var matchingSet = ri.getSet( img );
		var evaluated = false;
		if ( matchingSet != "pending" ) {
			if ( matchingSet ) {
				srcSetCandidates = ri.setRes( matchingSet );
				ri.applySetCandidate( srcSetCandidates, img );
			}
			evaluated = true;
		}
		img[ ri.ns].evaled = evaluated;
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

	var alwaysCheckWDescriptor = ri.supSrcset && !ri.supSizes;
	ri.parseSets = function( element, parent ) {

		var srcsetAttribute, fallbackCandidate, isWDescripor, srcsetParsed;

		var hasPicture = parent.nodeName.toUpperCase() == "PICTURE";

		if ( element[ ri.ns].src === undefined ) {
			element[ ri.ns ].src = getImgAttr.call( element, "src" );
			if ( element[ ri.ns ].src ) {
				setImgAttr.call( element, srcAttr, element[ ri.ns ].src );
			} else {
				removeImgAttr.call( element, srcAttr );
			}
		}

		if ( element[ ri.ns].src && ( (cfg.useGD && element.getAttribute("data-ri") == null) || element.getAttribute("data-no-ri") != null ) ) {
			element[ ri.ns ].supported = true;
			element[ ri.ns ].parsed = true;
			return;
		}

		if ( element[ ri.ns].srcset === undefined ) {
			srcsetAttribute = getImgAttr.call( element, "srcset" );
			element[ ri.ns ].srcset = srcsetAttribute;
			srcsetParsed = true;
		}

		if ( element[ ri.ns].dims === undefined ) {
			element[ ri.ns ].dims = getImgAttr.call( element, "height" ) && getImgAttr.call( element, "width" );
		}

		element[ ri.ns ].sets = [];

		if ( hasPicture ) {
			element[ ri.ns].pic = true;
			getAllSourceElements( parent, element[ ri.ns ].sets );
		}

		if ( element[ ri.ns ].srcset ) {
			fallbackCandidate = {
				srcset: element[ ri.ns ].srcset,
				sizes: getImgAttr.call( element, "sizes" )
			};

			element[ ri.ns ].sets.push( fallbackCandidate );

			isWDescripor = (alwaysCheckWDescriptor || element[ ri.ns ].src) ?
				hasWDescripor( fallbackCandidate ) :
				false;

			// add normal src as candidate, if source has no w descriptor, we do not test for 1x descriptor,
			// because this doesn't change computation. i.e.: we might have one candidate more, but this candidate
			// should never be chosen
			if ( !isWDescripor && element[ ri.ns ].src && !getCandidateForSrc(element[ ri.ns ].src, fallbackCandidate) ) {
				fallbackCandidate.srcset += ", " + element[ ri.ns ].src;
				fallbackCandidate.cands = false;
			}

			if ( RIDEBUG && !hasPicture && isWDescripor && element[ ri.ns ].src && fallbackCandidate.srcset.indexOf(element[ ri.ns ].src) == -1 ) {
				warn("The fallback candidate (`src`) isn't described inside the srcset attribute. Normally you want to describe all available candidates.");
			}

		} else if ( element[ ri.ns ].src ) {
			element[ ri.ns ].sets.push( {
				srcset: element[ ri.ns ].src,
				sizes: null
			} );
		}

		// if img has picture or the srcset was removed or has a srcset and does not support srcset at all
		// or has a w descriptor (and does not support sizes) set support to false to evaluate
		element[ ri.ns ].supported = !( hasPicture || ( fallbackCandidate && !ri.supSrcset ) || isWDescripor );

		if ( srcsetParsed && ri.supSrcset && hasPicture && !isWDescripor ) {
			if ( srcsetAttribute ) {
				setImgAttr.call( element, srcsetAttr, srcsetAttribute );
				element.srcset = "";
			} else {
				removeImgAttr.call( element, srcsetAttr );
			}
		}

		element[ ri.ns ].parsed = true;
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
			} else if ( RIDEBUG && source.getAttribute( "src" ) ) {
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

	var isWinComplete;

	function skipImg( img ) {
		return ( !isWinComplete && img[ ri.ns ].src && !img.error && img.lazyload != 1 && (!img[ ri.ns ].pic) /* && !isInView( img )*/ );
	}


	ri.fillImg = function(element, options) {
		var parent;
		var extreme = options.reparse || options.reevaluate;
		// expando for caching data on the img
		if ( !element[ ri.ns ] ) {
			element[ ri.ns ] = {};
		}

		if (isWinComplete && element[ ri.ns ].evaled == "lazy" ) {
			element[ ri.ns ].evaled = false;
		}

		// if the element has already been evaluated, skip it
		// unless `options.reevaluate` is set to true ( this, for example,
		// is set to true when running `respimg` on `resize` ).
		if ( !extreme && element[ ri.ns].evaled ) {
			return;
		}

		if ( !element[ ri.ns ].parsed || options.reparse ) {
			parent = element.parentNode;
			if ( !parent ) {
				return;
			}
			ri.parseSets( element, parent, options );
		}

		if ( !element[ ri.ns ].supported ) {
			if( options.reparse || !skipImg( element ) ) {
				applyBestCandidate( element );
			} else if( cfg.addSize && !element[ ri.ns ].dims ) {
				setSrcToCur( element, element[curSrcProp] );
				ri.setSize( element );
				element[ ri.ns].evaled = "lazy";
			}
		} else {
			element[ ri.ns].evaled = true;
		}
	};

	var resizeThrottle;

	ri.setupRun = function( options ) {
		if ( isVwDirty || !alreadyRun || options.reevaluate ) {
			dprM = Math.min(Math.max(ri.DPR * cfg.xQuant, 1), 1.8);
			tLow = cfg.tLow * dprM;
			tLazy = cfg.tLazy * dprM;
			greed = cfg.greed * dprM;
		}
		//invalidate length cache
		if ( isVwDirty ) {
			lengthCache = {};
			sizeLengthCache = {};
			updateView();

			// if all images are reevaluated clear the resizetimer
			if ( !options.elements && !options.context ) {
				clearTimeout( resizeThrottle );
			}
		}
	};

	ri.teardownRun = function( /*options*/ ) {
		var parent;
		if ( lengthElInstered ) {
			lengthElInstered = false;
			parent = lengthEl.parentNode;
			if ( parent ) {
				parent.removeChild( lengthEl );
			}
		}
	};

	/**
	 * alreadyRun flag used for setOptions. is it true setOptions will reevaluate
	 * @type {boolean}
	 */
	var alreadyRun = false;

	/**
	 *
	 * @param opt
	 */
	var respimg = function( opt ) {
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
	ri.fillImgs = respimg;

	// If picture is supported, well, that's awesome.
	if ( window.HTMLPictureElement ) {
		respimg = noop;
		ri.fillImg = noop;
	} else {
		/**
		 * Sets up picture polyfill by polling the document and running
		 * Also attaches respimg on resize
		 */
		(function() {
			var regWinComplete = /^loade|^c/;

			var run = function() {
				clearTimeout( timerId );
				timerId = setTimeout(run, 2000);
				if ( document.body ) {
					if ( regWinComplete.test( document.readyState || "" ) ) {
						isWinComplete = true;
						ri.isReady = true;
						clearTimeout( timerId );
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

			if ( window.addEventListener  ) {
				addEventListener( "resize", onResize, false );
				document.addEventListener( "readystatechange", run, false );
			} else if ( window.attachEvent ) {
				window.attachEvent( "onresize", onResize );
				document.attachEvent( "onreadystatechange",  run );
			}

		})();
	}

	/* expose methods for testing */
	respimg._ = ri;

	respimg.config = function(name, value) {
		if ( cfg[ name ] != value ) {
			cfg[ name ] = value;
			if ( alreadyRun ) {
				ri.fillImgs( { reevaluate: true } );
			}
		}
	};

	/* expose respimg */
	window.respimg = respimg;

	if ( typeof module == "object" && typeof module.exports == "object" ) {
		// CommonJS, just export
		module.exports = respimg;
	} else if ( typeof define == "function" && define.amd ){
		// if AMD is used we still ad respimg to the global namespace,
		// because too many people fail to use it

		// AMD support
		define( function() { return respimg; } );
	}
	if ( RIDEBUG ) {
		warn( "Responsive image debugger active. Do not use in production, because it slows things down!" );
	}
} )( window, document );
