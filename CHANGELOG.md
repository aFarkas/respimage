# CHANGELOG

###head

* refinements to the source selection algorithm. compared to previous version:
	* smart source selection runs less aggressive on 1x devices (better for quality)
	* smart source selection runs more aggressive on 2x+ devices (better for performance)
	* smart source selection runs less aggressive in portrait mode than in landscape mode (good for orientation change)
* includes orientation media query polyfill (mainly for IE8 but also IE9)
* removed perfselection plugin. (Non-biased part is now directly included into the main script. For the "biased" part [use some other x-browser techniques](plugins/perfselection).) 

###1.1.1-1.1.3

* no script changes, only adjustments to the package.json (sorry for the release noise)

###1.1.0

* improve [intrinsic scaling and move it to a plugin](plugins/intrinsic-dimension)
* allow use of h descriptor (allow futureproof markup)
* make respimage lazier on resize
* improve image abortion for trident
* tests tests tests ;-)

###1.0.0

* CSS calc function in the ``sizes`` attribute in conjunction with em/vw is now 100% precise and works even in IE8
* massive network performance improvement for the Trident engine (IE) if a ``src`` fallback attribute is specified

###0.9.6

* improve addSize option

###0.9.5

* improve memory usage
* add type support plugin
* fixed debug message (for source and size order) + added new debug messages

### 0.9.4

* handle changes to devicePixelRatio
* improve debugging information in *.dev.js (Test wether calculated sizes matches rendered size of image + Test order of source elements and sizes attribute)
* Stick to editorconfig in all files
* removed UMD (simply not so good for polyfills, sorry)
* Add `.editorconfig` file to ensure coding conventions
* Update npm dependencies
* add ``lazyload`` check

### v0.9.3-RC1
### v0.9.3
### v0.9.2
### v0.9.1
### v0.9.0-RC2
### v0.9.0
