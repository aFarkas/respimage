/*! respimg - v0.9.0-beta - 2014-10-04
 Licensed MIT */
!function(window, document, undefined) {
    "use strict";
    function trim(str) {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
    }
    function updateView() {
        isVwDirty = !1, ri.vW = window.innerWidth || docElem.clientWidth;
    }
    function parseDescriptor(descriptor) {
        if (!(descriptor in memDescriptor)) {
            var descriptorObj = {
                val: 1,
                type: "x"
            }, parsedDescriptor = trim(descriptor || "");
            parsedDescriptor && (parsedDescriptor.match(regDescriptor) ? (descriptorObj.val = 1 * RegExp.$1, 
            descriptorObj.type = RegExp.$2) : descriptorObj = !1), memDescriptor[descriptor] = descriptorObj;
        }
        return memDescriptor[descriptor];
    }
    function chooseLowRes(lowRes, diff, dpr) {
        return lowRes / dpr > .4 && (lowRes += diff * greed, diff > cfg.tHigh && (lowRes += tLow)), 
        lowRes > dpr;
    }
    function applyBestCandidate(img) {
        var srcSetCandidates, matchingSet = ri.getSet(img), evaluated = !1;
        "pending" != matchingSet && (matchingSet && (srcSetCandidates = ri.setRes(matchingSet), 
        ri.applySetCandidate(srcSetCandidates, img)), evaluated = !0), img[ri.ns].evaled = evaluated;
    }
    function ascendingSort(a, b) {
        return a.res - b.res;
    }
    function setSrcToCur(img, src, set) {
        var candidate;
        return !set && src && (set = img[ri.ns].sets, set = set && set[set.length - 1]), 
        candidate = getCandidateForSrc(src, set), candidate && (src = ri.makeUrl(src), img[ri.ns].curSrc = src, 
        img[ri.ns].curCan = candidate, currentSrcSupported || (img.currentSrc = src), candidate.res || setResolution(candidate, candidate.set.sizes)), 
        candidate;
    }
    function getCandidateForSrc(src, set) {
        var i, candidate, candidates;
        if (src && set) for (candidates = ri.parseSet(set), src = ri.makeUrl(src), i = 0; i < candidates.length; i++) if (src == ri.makeUrl(candidates[i].url)) {
            candidate = candidates[i];
            break;
        }
        return candidate;
    }
    function hasWDescripor(set) {
        if (!set) return !1;
        var candidates = ri.parseSet(set);
        return candidates[0] && "w" == candidates[0].desc.type;
    }
    function getAllSourceElements(picture, candidates) {
        var i, len, source, srcset, sources = picture.getElementsByTagName("source");
        for (i = 0, len = sources.length; len > i; i++) source = sources[i], source[ri.ns] = !0, 
        srcset = source.getAttribute("srcset"), srcset && candidates.push({
            srcset: srcset,
            media: source.getAttribute("media"),
            type: source.getAttribute("type"),
            sizes: source.getAttribute("sizes")
        });
    }
    function setResolution(candidate, sizesattr) {
        var descriptor = candidate.desc;
        return "w" == descriptor.type ? (candidate.cWidth = ri.calcListLength(sizesattr || "100vw"), 
        candidate.res = descriptor.val / candidate.cWidth) : candidate.res = descriptor.val, 
        candidate;
    }
    function skipImg(img) {
        var ret = img[ri.ns].src && !img[ri.ns].pic && !img.error && !img.complete && 1 != img.lazyload;
        return ret && isWinComplete && (img[ri.ns].evaled ? ret = !1 : reevaluateAfterLoad(img)), 
        ret;
    }
    document.createElement("picture");
    var lengthElInstered, lengthEl, currentSrcSupported, curSrcProp, ri = {}, noop = function() {}, image = document.createElement("img"), getImgAttr = image.getAttribute, setImgAttr = image.setAttribute, removeImgAttr = image.removeAttribute, docElem = document.documentElement, types = {}, cfg = {
        addSize: !1,
        xQuant: 1,
        tLow: .1,
        tHigh: .5,
        tLazy: .25,
        greed: .2
    }, srcAttr = "data-risrc", srcsetAttr = srcAttr + "set";
    ri.ns = ("ri" + new Date().getTime()).substr(0, 9), currentSrcSupported = "currentSrc" in image, 
    curSrcProp = currentSrcSupported ? "currentSrc" : "src", ri.supSrcset = "srcset" in image, 
    ri.supSizes = "sizes" in image, ri.selShort = "picture > img, img[srcset]", ri.sel = ri.selShort, 
    ri.cfg = cfg, ri.supSrcset && (ri.sel += ", img[" + srcsetAttr + "]");
    var anchor = document.createElement("a");
    ri.makeUrl = function(src) {
        return anchor.href = src, anchor.href;
    }, ri.qsa = function(context, sel) {
        return context.querySelectorAll(sel);
    };
    {
        var on = (window.console && "function" == typeof console.warn ? function(message) {
            console.warn(message);
        } : noop, function(obj, evt, fn, capture) {
            obj.addEventListener ? obj.addEventListener(evt, fn, capture || !1) : obj.attachEvent && obj.attachEvent("on" + evt, fn);
        }), off = function(obj, evt, fn, capture) {
            obj.removeEventListener ? obj.removeEventListener(evt, fn, capture || !1) : obj.detachEvent && obj.detachEvent("on" + evt, fn);
        };
        "https:" == location.protocol;
    }
    ri.matchesMedia = function() {
        return ri.matchesMedia = window.matchMedia && matchMedia("(min-width: 0.1em)").matches ? function(media) {
            return !media || matchMedia(media).matches;
        } : ri.mMQ, ri.matchesMedia.apply(this, arguments);
    }, ri.vW = 0;
    var isVwDirty = !0, regex = {
        minw: /\(\s*min\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/,
        maxw: /\(\s*max\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/
    }, mediaCache = {};
    ri.mMQ = function(media) {
        var min, max, ret = !1;
        return media ? (mediaCache[media] || (min = media.match(regex.minw) && parseFloat(RegExp.$1) + (RegExp.$2 || ""), 
        max = media.match(regex.maxw) && parseFloat(RegExp.$1) + (RegExp.$2 || ""), min && (min = parseFloat(min, 10) * (min.indexOf("em") > 0 ? ri.getEmValue() : 1)), 
        max && (max = parseFloat(max, 10) * (max.indexOf("em") > 0 ? ri.getEmValue() : 1)), 
        mediaCache[media] = {
            min: min,
            max: max
        }), min = mediaCache[media].min, max = mediaCache[media].max, (min && ri.vW >= min || max && ri.vW <= max) && (ret = !0), 
        ret) : !0;
    }, ri.DPR = window.devicePixelRatio || 1;
    var lengthCache = {}, regLength = /^([\d\.]+)(em|vw|px)$/, baseStyle = "position: absolute;left:0;visibility:hidden;display:block;padding:0;border:none;font-size:1em;width:1em;";
    ri.calcLength = function(sourceSizeValue) {
        var failed, parsedLength, orirgValue = sourceSizeValue, value = !1;
        if (!(orirgValue in lengthCache)) {
            if (parsedLength = sourceSizeValue.match(regLength)) parsedLength[1] = parseFloat(parsedLength[1], 10), 
            value = parsedLength[1] ? "vw" == parsedLength[2] ? ri.vW * parsedLength[1] / 100 : "em" == parsedLength[2] ? ri.getEmValue() * parsedLength[1] : parsedLength[1] : !1; else if (sourceSizeValue.indexOf("calc") > -1 || parseInt(sourceSizeValue, 10)) {
                sourceSizeValue = sourceSizeValue.replace("vw", "%"), lengthEl || (lengthEl = document.createElement("div"), 
                lengthEl.style.cssText = baseStyle), lengthElInstered || (lengthElInstered = !0, 
                docElem.insertBefore(lengthEl, docElem.firstChild)), lengthEl.style.width = "0px";
                try {
                    lengthEl.style.width = sourceSizeValue;
                } catch (e) {
                    failed = !0;
                }
                value = lengthEl.offsetWidth, failed && (value = !1);
            }
            0 >= value && (value = !1), lengthCache[orirgValue] = value;
        }
        return lengthCache[orirgValue];
    }, ri.types = types, types["image/jpeg"] = !0, types["image/gif"] = !0, types["image/png"] = !0, 
    types["image/svg+xml"] = document.implementation.hasFeature("http://wwwindow.w3.org/TR/SVG11/feature#Image", "1.1"), 
    ri.supportsType = function(type) {
        return type ? types[type] : !0;
    };
    var regSize = /(\([^)]+\))?\s*(.+)/, memSize = {};
    ri.parseSize = function(sourceSizeStr) {
        var match;
        return memSize[sourceSizeStr] || (match = (sourceSizeStr || "").match(regSize), 
        memSize[sourceSizeStr] = {
            media: match && match[1],
            length: match && match[2]
        }), memSize[sourceSizeStr];
    }, ri.parseSet = function(set) {
        if (!set.cands) {
            var pos, url, descriptor, last, descpos, srcset = set.srcset;
            for (set.cands = []; srcset; ) srcset = srcset.replace(/^\s+/g, ""), pos = srcset.search(/\s/g), 
            descriptor = null, -1 != pos ? (url = srcset.slice(0, pos), last = url.charAt(url.length - 1), 
            "," != last && url || (url = url.replace(/,+$/, ""), descriptor = ""), srcset = srcset.slice(pos + 1), 
            null == descriptor && (descpos = srcset.indexOf(","), -1 != descpos ? (descriptor = srcset.slice(0, descpos), 
            srcset = srcset.slice(descpos + 1)) : (descriptor = srcset, srcset = ""))) : (url = srcset, 
            srcset = ""), url && (descriptor = parseDescriptor(descriptor)) && set.cands.push({
                url: url.replace(/^,+/, ""),
                desc: descriptor,
                set: set
            });
        }
        return set.cands;
    };
    var eminpx, memDescriptor = {}, regDescriptor = /^([\+eE\d\.]+)(w|x)$/, fsCss = "font-size:100% !important;";
    ri.getEmValue = function() {
        var body;
        if (!eminpx && (body = document.body)) {
            var div = document.createElement("div"), originalHTMLCSS = docElem.style.cssText, originalBodyCSS = body.style.cssText;
            div.style.cssText = baseStyle, docElem.style.cssText = fsCss, body.style.cssText = fsCss, 
            body.appendChild(div), eminpx = div.offsetWidth, body.removeChild(div), eminpx = parseFloat(eminpx, 10), 
            docElem.style.cssText = originalHTMLCSS, body.style.cssText = originalBodyCSS;
        }
        return eminpx || 16;
    };
    var sizeLengthCache = {};
    ri.calcListLength = function(sourceSizeListStr) {
        if (!(sourceSizeListStr in sizeLengthCache) || cfg.noCache) {
            var sourceSize, parsedSize, length, media, i, len, sourceSizeList = trim(sourceSizeListStr).split(/\s*,\s*/), winningLength = !1;
            for (i = 0, len = sourceSizeList.length; len > i && (sourceSize = sourceSizeList[i], 
            parsedSize = ri.parseSize(sourceSize), length = parsedSize.length, media = parsedSize.media, 
            !length || !ri.matchesMedia(media) || (winningLength = ri.calcLength(length)) === !1); i++) ;
            sizeLengthCache[sourceSizeListStr] = winningLength ? winningLength : ri.vW;
        }
        return sizeLengthCache[sourceSizeListStr];
    }, ri.setRes = function(set) {
        var candidates, candidate;
        if (set) {
            candidates = ri.parseSet(set);
            for (var i = 0, len = candidates.length; len > i; i++) candidate = candidates[i], 
            candidate.descriptor || setResolution(candidate, set.sizes);
        }
        return candidates;
    };
    var dprM, tLow, greed, tLazy;
    ri.applySetCandidate = function(candidates, img) {
        if (candidates.length) {
            var candidate, i, j, diff, length, bestCandidate, curSrc, curCan, candidateSrc, dpr = ri.DPR * cfg.xQuant;
            if (curSrc = img[ri.ns].curSrc || img[curSrcProp], curCan = img[ri.ns].curCan || setSrcToCur(img, curSrc, candidates[0].set), 
            curCan && curCan.set == candidates[0].set && curCan.res + tLazy >= dpr && (bestCandidate = curCan, 
            candidateSrc = curSrc), !bestCandidate) for (candidates.sort(ascendingSort), length = candidates.length, 
            bestCandidate = candidates[length - 1], i = 0; length > i; i++) if (candidate = candidates[i], 
            candidate.res >= dpr) {
                j = i - 1, bestCandidate = candidates[j] && (diff = candidate.res - dpr) && curSrc != (candidateSrc = ri.makeUrl(candidate.url)) && chooseLowRes(candidates[j].res, diff, dpr) ? candidates[j] : candidate;
                break;
            }
            bestCandidate && (candidateSrc || (candidateSrc = ri.makeUrl(bestCandidate.url)), 
            currentSrcSupported || (img.currentSrc = candidateSrc), img[ri.ns].curSrc = candidateSrc, 
            img[ri.ns].curCan = bestCandidate, candidateSrc != curSrc ? ri.setSrc(img, bestCandidate) : ri.setSize(img));
        }
    }, ri.setSrc = function(img, bestCandidate) {
        var origWidth;
        img.src = bestCandidate.url, "image/svg+xml" == bestCandidate.set.type && (origWidth = img.style.width, 
        img.style.width = img.offsetWidth + 1 + "px", img.offsetWidth + 1 && (img.style.width = origWidth));
    };
    var intrinsicSizeHandler = function() {
        off(this, "load", intrinsicSizeHandler), ri.setSize(this);
    };
    ri.setSize = function(img) {
        var width, curCandidate = img[ri.ns].curCan;
        cfg.addSize && curCandidate && !img[ri.ns].dims && (img.complete || (off(img, "load", intrinsicSizeHandler), 
        on(img, "load", intrinsicSizeHandler)), width = img.naturalWidth, width && ("x" == curCandidate.desc.type ? setImgAttr.call(img, "width", parseInt(width / curCandidate.res / cfg.xQuant, 10)) : "w" == curCandidate.desc.type && setImgAttr.call(img, "width", parseInt(curCandidate.cWidth * (width / curCandidate.desc.val), 10))));
    }, document.addEventListener && "naturalWidth" in image && "complete" in image || (ri.setSize = noop), 
    ri.getSet = function(img) {
        var i, set, supportsType, match = !1, sets = img[ri.ns].sets;
        for (i = 0; i < sets.length && !match; i++) if (set = sets[i], set.srcset && ri.matchesMedia(set.media) && (supportsType = ri.supportsType(set.type))) {
            "pending" == supportsType && (set = supportsType), match = set;
            break;
        }
        return match;
    };
    var alwaysCheckWDescriptor = ri.supSrcset && !ri.supSizes;
    ri.parseSets = function(element, parent) {
        var srcsetAttribute, fallbackCandidate, isWDescripor, srcsetParsed, hasPicture = "PICTURE" == parent.nodeName.toUpperCase();
        return element[ri.ns].src === undefined && (element[ri.ns].src = getImgAttr.call(element, "src"), 
        element[ri.ns].src ? setImgAttr.call(element, srcAttr, element[ri.ns].src) : removeImgAttr.call(element, srcAttr)), 
        element[ri.ns].src && (cfg.useGD && null == element.getAttribute("data-ri") || null != element.getAttribute("data-no-ri")) ? (element[ri.ns].supported = !0, 
        void (element[ri.ns].parsed = !0)) : (element[ri.ns].srcset === undefined && (srcsetAttribute = getImgAttr.call(element, "srcset"), 
        element[ri.ns].srcset = srcsetAttribute, srcsetParsed = !0), element[ri.ns].dims === undefined && (element[ri.ns].dims = getImgAttr.call(element, "height") && getImgAttr.call(element, "width")), 
        element[ri.ns].sets = [], hasPicture && (element[ri.ns].pic = !0, getAllSourceElements(parent, element[ri.ns].sets)), 
        element[ri.ns].srcset ? (fallbackCandidate = {
            srcset: element[ri.ns].srcset,
            sizes: getImgAttr.call(element, "sizes")
        }, element[ri.ns].sets.push(fallbackCandidate), isWDescripor = alwaysCheckWDescriptor || element[ri.ns].src ? hasWDescripor(fallbackCandidate) : !1, 
        isWDescripor || !element[ri.ns].src || getCandidateForSrc(element[ri.ns].src, fallbackCandidate) || (fallbackCandidate.srcset += ", " + element[ri.ns].src, 
        fallbackCandidate.cands = !1)) : element[ri.ns].src && element[ri.ns].sets.push({
            srcset: element[ri.ns].src,
            sizes: null
        }), element[ri.ns].supported = !(hasPicture || fallbackCandidate && !ri.supSrcset || isWDescripor), 
        srcsetParsed && ri.supSrcset && hasPicture && !isWDescripor && (srcsetAttribute ? (setImgAttr.call(element, srcsetAttr, srcsetAttribute), 
        element.srcset = "") : removeImgAttr.call(element, srcsetAttr)), void (element[ri.ns].parsed = !0));
    };
    var isWinComplete, reevaluateAfterLoad = function() {
        var onload = function() {
            off(this, "load", onload), ri.fillImgs({
                elements: [ this ]
            });
        };
        return function(img) {
            off(img, "load", onload), on(img, "load", onload);
        };
    }();
    ri.fillImg = function(element, options) {
        var parent, extreme = options.reparse || options.reevaluate;
        if (element[ri.ns] || (element[ri.ns] = {}), "lazy" == element[ri.ns].evaled && (isWinComplete || element.complete) && (element[ri.ns].evaled = !1), 
        extreme || !element[ri.ns].evaled) {
            if (!element[ri.ns].parsed || options.reparse) {
                if (parent = element.parentNode, !parent) return;
                ri.parseSets(element, parent, options);
            }
            element[ri.ns].supported ? element[ri.ns].evaled = !0 : options.reparse || !skipImg(element) ? applyBestCandidate(element) : cfg.addSize && !element[ri.ns].dims && (setSrcToCur(element, element[curSrcProp]), 
            ri.setSize(element), element[ri.ns].evaled = "lazy");
        }
    };
    var resizeThrottle;
    ri.setupRun = function(options) {
        (!alreadyRun || options.reevaluate) && (dprM = Math.min(Math.max(ri.DPR * cfg.xQuant, 1), 1.8), 
        tLow = cfg.tLow * dprM, tLazy = cfg.tLazy * dprM, greed = cfg.greed * dprM), isVwDirty && (lengthCache = {}, 
        sizeLengthCache = {}, updateView(), options.elements || options.context || clearTimeout(resizeThrottle));
    }, ri.teardownRun = function() {
        var parent;
        lengthElInstered && (lengthElInstered = !1, parent = lengthEl.parentNode, parent && parent.removeChild(lengthEl));
    };
    var alreadyRun = !1, respimg = function(opt) {
        var elements, i, plen, options = opt || {};
        if (options.elements && 1 == options.elements.nodeType && ("IMG" == options.elements.nodeName.toUpperCase() ? options.elements = [ options.elements ] : (options.context = options.elements, 
        options.elements = null)), elements = options.elements || ri.qsa(options.context || document, options.reevaluate || options.reparse ? ri.sel : ri.selShort), 
        plen = elements.length) {
            for (ri.setupRun(options), alreadyRun = !0, i = 0; plen > i; i++) ri.fillImg(elements[i], options);
            ri.teardownRun(options);
        }
    };
    ri.fillImgs = respimg, window.HTMLPictureElement ? (respimg = noop, ri.fillImg = noop) : !function() {
        var regWinComplete = /^loade|^c/, run = function() {
            clearTimeout(timerId), timerId = setTimeout(run, 3e3), document.body && (regWinComplete.test(document.readyState || "") && (isWinComplete = !0, 
            clearTimeout(timerId), off(document, "readystatechange", run)), ri.fillImgs());
        }, resizeEval = function() {
            ri.fillImgs({
                reevaluate: !0
            });
        }, onResize = function() {
            clearTimeout(resizeThrottle), isVwDirty = !0, resizeThrottle = setTimeout(resizeEval, 99);
        }, timerId = setTimeout(run, document.body ? 9 : 99);
        on(window, "resize", onResize), on(document, "readystatechange", run);
    }(), respimg._ = ri, respimg.config = function(name, value) {
        cfg[name] != value && (cfg[name] = value, alreadyRun && ri.fillImgs({
            reevaluate: !0
        }));
    }, window.respimg = respimg, "object" == typeof module && "object" == typeof module.exports ? module.exports = respimg : "function" == typeof define && define.amd && define(function() {
        return respimg;
    });
}(window, document);