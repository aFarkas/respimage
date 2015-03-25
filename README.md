#respimage
**respimage** is a fast, lightweight and robust [responsive images](http://picture.responsiveimages.org/) polyfill, that saves the users bandwidth by [utilizing smart resource selection algorithm](how-respimg-works.md). It implements the ``srcset``/``sizes`` attributes as also the ``picture`` element. Unlike other responsive images polyfills ``respimage`` plays nicely with your graceful degradation / progressive enhancement and image SEO strategy.

##Download and Embed
Simply [download the respimage.min.js](respimage.min.js) script and add it to your website or bundle it in your normal JS.

```html
<script src="respimage.min.js" async=""></script>
```
**respimage** will automatically run and polyfill all images. So you can simply start writing responsive images.

In case you want to include **respimage** only if the browser doesn't support responsive images you can add the following inline script at the top of your head (before any stylesheets or any blocking JS, This should be added as inline script and not inside of an external script.):

```html
<script>
function loadJS(u){var r = document.getElementsByTagName( "script" )[ 0 ], s = document.createElement( "script" );s.src = u;r.parentNode.insertBefore( s, r );}

if(!window.HTMLPictureElement){
	document.createElement('picture');
	loadJS("respimage.min.js");
}
</script>
```

In case you need to support IE8 and want to include the script at the bottom you need to use either the [html5shiv](https://github.com/aFarkas/html5shiv) or add at least the following script inside your ``head`` element:

```html
document.createElement('picture');
```

Also note, that only IE8 in strict mode is supported. In case you need to support IE8 compatibility view or IE7, please use the [oldie plugin](plugins/oldie).

###Mobile support

For mobile support it is crucial to set the viewport ``meta`` tag to ``device-width``

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

####Install via bower

```
$ bower install respimage --save
```

####Install via npm

```
$ npm install respimage --save
```

##Markup Examples
Responsive images can be technically differentiated between 2 types.

* ``srcset`` with source descriptors (let the browser choose the right image based on screen size/resolution, bandwidth…):
	* density descriptor (``x``) (for static image sizes, Retina vs. normal resolution)
	* width descriptor (``w``) and the corresponding ``sizes`` attribute (for flexible, responsive / adaptive images (automatically also includes Retina optimization)
* and the ``picture`` element with its ``source[media]`` children (gives the author control about what ``srcset`` should be chosen by the browser depending on specific media queries)


###``srcset`` with the density ``x`` descriptor
The ``x`` descriptor is natively supported in [Firefox 38, Chrome 34+ and Safari 7.1+](http://caniuse.com/#feat=srcset). All other browsers will be polyfilled. <br />Note: You must not mix the ``w`` and the ``x`` descriptor in one ``srcset`` attribute!

```html
<img
	srcset="http://placehold.it/350x150 1x,
		http://placehold.it/700x300 2x"
	src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
    alt="Static content image" />
```
[load example](http://codepen.io/aFarkas/pen/qEBOEq)


###``srcset`` with the width ``w`` descriptor and the ``sizes`` attribute
The ``w`` descriptor is in [Firefox 38 and Chrome 38+](http://caniuse.com/#feat=srcset). All other browsers will be polyfilled. <br />Note: You must not mix the ``w`` and the ``x`` descriptor in one ``srcset`` attribute!

```html
<img
	srcset="http://placehold.it/466x200 466w,
		http://placehold.it/700x300 700w,
		http://placehold.it/1050x450 1050w,
		http://placehold.it/1400x600 1400w"
	sizes="(max-width: 1000px) calc(100vw - 20px), 1000px"
	src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
	alt="flexible image" />
```
[load example](http://codepen.io/aFarkas/pen/KwKdpY)

###The ``picture`` element
The ``picture`` element is currently only supported in [Firefox 38 and Chrome 38+](http://caniuse.com/#search=picture). All other browsers will be polyfilled. To support IE9 all source elements have to be wrapped inside of an ``audio`` or hidden ``video`` element:

```html
<picture>
	<!--[if IE 9]><audio><![endif]-->
	<source
			srcset="http://placehold.it/500x600/11e87f/fff"
			media="(max-width: 450px)" />
	<source
			srcset="http://placehold.it/700x300"
			media="(max-width: 720px)" />
	<source
			srcset="http://placehold.it/1400x600/e8117f/fff"
			media="(max-width: 1100px)" />
	<source
    		srcset="http://placehold.it/1800x900/117fe8/fff" />
	<!--[if IE 9]></audio><![endif]-->
	<img
			src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
			alt="image with artdirection" />
</picture>
```
[load example](http://codepen.io/aFarkas/pen/yyLJWO)

The art direction approach of the picture element and the descriptor approach can also be mixed:

```html
<picture>
	<!--[if IE 9]><video style="display: none;"><![endif]-->
	<source
			srcset="http://placehold.it/525x225 1.5x,
        	http://placehold.it/350x150 1x"
			media="(max-width: 380px)" />
	<source
			srcset="http://placehold.it/1400x600/e8117f/fff 1.5x,
        	http://placehold.it/1024x439/e8117f/fff 1x"
			media="(max-width: 1050px)" />
	<source
	    srcset="http://placehold.it/2100x900/117fe8/fff 1.5x,
            http://placehold.it/1400x600/117fe8/fff 1x" />
	<!--[if IE 9]></video><![endif]-->
	<img
        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        alt="image with artdirection" />
</picture>
```
[load example](http://codepen.io/aFarkas/pen/RNwRzq)

##API
###``respimage`` function
In case new responsive images are created and dynamically added to the DOM simply invoke the ``respimage`` method.

```js
window.respimage();
```

Here an extended example how this could look like in a jQuery environment.

```js
$("div.dynamic-context").load("path-to-content.html", function(){
	if( window.respimage ) {
    	respimage();
    }
});
```

In case you are dynamically changing relevant attributes (``srcset``, ``sizes``, ``media``) on responsive images or their associated ``source`` elements, you need to call ``respimage`` with an additional argument:

```js
respimage({elements: [imageElement], reparse: true});
```

In the unlikely case you want either **remove** the ``srcset`` of an ``img`` (not of an ``source``) or want to directly change the ``src`` of an responsive image the additional ``src`` or ``srcset`` option has to be set (Note: In most cases, you don't want to do that!).


```js
var $imgs = $('img').removeAttr('srcset');

respimage({elements: $imgs, reparse: true, srcset: true});

//or for src

var $imgs = $('img').attr('src', 'some-img.jpg');
respimage({elements: $imgs, reparse: true, src: true});
```

In case you are not supporting IE8 we recommend to use the [Mutation plugin](plugins/mutation) instead of using this API (It fully polyfills also the DOM APIs and makes additional calls to ``respimage`` automatically for you).

## Browser Support
**respimage** supports a broad range of browsers and devices. It is actively tested in the following browsers and devices IE8+, Firefox (ESR and current), Safari 7.0+, Chrome, Opera, Android 4.1+ and IOS 7+, but should work in a lot more browsers/devices. IE6 and IE7 are only supported with the [oldIE plugin](plugins/oldie).

##Troubleshooting and bug reporting
In case of any problems include the **respimage.dev.js** into your project and open your JS console. In case you think you have found a bug, please create a testcase and then report your issue. Note: You should not use the dev build inside your production environment, because it is a lot slower.

**Note: It is highly recommended to test with the *.dev.js file, especially if you are using responsive images the first time or you start a new project setup.** The **respimage.dev.js** file can give you some useful hints in the console. About 80% of all tutorials suggest wrong markup examples! Also note: That our respimg debugger can't check every possible error.

##Plugins

respimage has some really nice extensions/plugins to improve standards support even more. In case you want to use a CDN, you can use the combohandler service provided by jsDelivr:


```html
<script>
function loadJS(u){var r = document.getElementsByTagName("script")[0], s = document.createElement("script");s.src = u;r.parentNode.insertBefore( s, r );}

if(!window.HTMLPictureElement){
	document.createElement('picture');
	loadJS("http://cdn.jsdelivr.net/g/respimage(respimage.min.js+plugins/mutation/ri.mutation.min.js+plugins/intrinsic-dimension/ri.intrinsic.min.js+plugins/typesupport/ri.type.min.js)");
}
</script>
```

###The [intrinsic sizes / dimensions - Plugin](plugins/intrinsic-dimension)
The intrinsic dimension plugin extends ``respimage`` to add the intrinsic dimension based on the descriptor (and the sizes attribute) and the density of the source candidate to the width content attribute of the image element.

###The [Mutation - Plugin](plugins/mutation)
This plugin automatically detects new responsive images and also any changes to ``srcset``/``media`` and ``sizes`` attributes. It also implements the corresponding DOM properties for those attributes.

###The [typesupport - Plugin](plugins/typesupport)
The type support plugin adds type support detection for the following image file types: apng, JPEG 2000, JPEG XR, WEBP

###The [oldie - Plugin](plugins/oldie)
Respimage supports IE8+ (including) out of the box. In case you need to support IE6/7 or any IE in compatibility view or quirksmode use the oldie plugin.

##Known issues/caveats/
* Browsers without picture and srcset support and disabled JS will either show the image specified with the ``src`` attribute or - if omitted - show only the ``alt`` text. In case a ``src`` attribute is used non-supporting browser might download a wasted addtional image. For workarounds and markup patterns to improve this problem see below.
* **respimage** implements [different JS techniques](how-respimg-works.md) to automatically adapt to your ``src`` strategy. This yields among other things to the fact, that using an inital ``src`` attribute in conjunction with respimage can improve perceived performance (although an additional request is generated:

###low quality image source

In case JS off is a concern. Use a low quality source as the fallback ``src``. As soon as an image has already a source respimage will not simply switch the image ``src`` but will implement the low quality image placeholder pattern. While the lquip technique can often increase the time until the onload event and the transferred image data, it **improves perceived performance**:

```html
<img
	srcset="http://placehold.it/466x200 466w,
		http://placehold.it/700x300 700w,
		http://placehold.it/1050x450 1050w,
		http://placehold.it/1400x600 1400w"
	sizes="(max-width: 1000px) calc(100vw - 20px), 1000px"
	src="http://placehold.it/250x107"
	alt="flexible image" />
```

Due to the fact, that the lqip ``src`` attribute can be optimized by the browser's preload parser this technique yields to a very fast first impression, while the best image candidate can be loaded in the background.

This technique can be combined with [lazyLoading](https://github.com/aFarkas/lazysizes), which will also additionally decrease the time until onload event and gives you the possibility to implement the improved perceived performance also for native supporting browsers.

###Omit the ``src``

In case JS disabled legacy browsers are no concern and you can't provide an lquip source or you are using client side rendering (No preload parser optimization advantage), use a one pixel ``src`` or better a data URI.

```html
<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
	srcset="image.jpg 1x, image2.jpg 2x"
    alt="my image" />
```

###Simply live with it and use either the most often used or the smallest source candidate as the fallback ``src``

```html
<img
	srcset="http://placehold.it/1050x450 1050w,
    	http://placehold.it/466x200 466w,
		http://placehold.it/700x300 700w,
		http://placehold.it/1400x600 1400w"
	sizes="(max-width: 1000px) calc(100vw - 20px), 1000px"
	src="http://placehold.it/1050x450"
	alt="flexible image" />

<!-- or -->

<img
	srcset="http://placehold.it/466x200 466w,
		http://placehold.it/700x300 700w,
		http://placehold.it/1050x450 1050w,
		http://placehold.it/1400x600 1400w"
	sizes="(max-width: 1000px) calc(100vw - 20px), 1000px"
	src="http://placehold.it/466x200"
	alt="flexible image" />
```

In this case respimage will guard your chosen ``src`` strategy and will only kick in as a progressive enhancement script in the following situations:
* the inital image candidate is too heavy and the browser supports image request abortion
* the inital image candidate is too fuzzy (see LQIP pattern above)
* or art direction is envolved and the fallback ``src`` candidate is not part of the chosen ``srcset``
In case the currently set source candidate is not perfect (or perfect of course), but good enough the ``src`` won't be changed by respimage. (See also the ``lazyFactor`` option below.)

* Media queries support in old IEs (IE8/IE9) are limited to ``min-width``, ``max-width``, ``max-height`` and ``min-height``. For IE9 it is possible to extend support by including a [``matchMedia`` polyfill](https://github.com/paulirish/matchMedia.js).

##Responsive images and lazy loading
Beside the fact, that lazy loading improves performance, there is an interesting side effect. Due to delayed image loading the sizes attribute can be dynamically calculated with JS and makes integrating responsive images in any environment therefore easy. We recommend [lazysizes](https://github.com/aFarkas/lazysizes).

##Setting options

respimage uses the asynchronous push syntax for configuration. Simply create a global ``respimgCFG`` array if it doesn't exist already and push your options:

```js
window.respimgCFG = window.respimgCFG || [];

respimgCFG.push(['lazyFactor', 0.6]);
```

Also Note: respimage is a drop-in polyfill solution and you normally shouldn't need to configure anything. But in case you want to play around with respimage's options here is a [small testing zone for you](https://afarkas.github.io/respimage/cfg/index.html).

###The ``maxX`` option (default: ``2``)
Due to the fact that reliable bandwidth detection is nearly impossible and 3x image density means 9x image data respimage constraints the maximum considered ``devicePixelRatio`` to ``2``. In case you want to serve 3x images to 3x devices even with possibly lower bandwidth set this option to 3:

```js
window.respimgCFG = window.respimgCFG || [];

respimgCFG.push(['maxX', 2]);
```

Note: This only affects polyfilled browsers. In case you want to constrain the maximum dpi for all browser you can try [lazySizes - optimumx extension](https://github.com/aFarkas/lazysizes/tree/gh-pages/plugins/optimumx).

###The ``lazyFactor`` option (default: ``0.4``)
In case an image already has a source candidate (either initially set as ``src`` attribute or on resize) respimage becomes lazy changing the source. The higher the ``lazyFactor`` the more respimage honors your fallback ``src``. Reasonable values are between 0.1 and 1.5.

```js
window.respimgCFG = window.respimgCFG || [];

//make respimage more lazy
respimgCFG.push(['lazyFactor', 0.8]);

//make respimage less lazy
//respimgCFG.push(['lazyFactor', 0.2]);
```

Wether this option has an impact depends also heavily on your fallback ``src`` strategy.

##Building a production ready respimage.js version from the *.dev.js file

The respimage.js or the respimage.min.js files are production ready versions of respimage while the respimage.dev.js file includes some informativ extra checks (For example, it checks wether your markup or the content of your ``sizes`` is reasonable.). Therefore the dev version is not only bigger but also a lot slower. In case you want to use the dev version inside your dev enviroment and want to automatically build a production ready version, you can do so by using the dead code removal feature of uglify. Here is a simple grunt config example:

```js
/*
// simply add the following option to your uglify option task
// to remove respimage's debug code:
compress: {
    global_defs: {
        "RIDEBUG": false
    },
    dead_code: true
}
*/
grunt.initConfig({
    //uglify task
    uglify: {
        options: {
            compress: {
                global_defs: {
                    "RIDEBUG": false
                },
                dead_code: true
            }
        },
        //your task:
        my_target: {
            files: [{
                expand: true,
                cwd: 'src/js',
                src: '**/*.js',
                dest: 'dest/js'
            }]
        }
    }
});
```

##Authors
* Authors of the original work: Scott Jehl, Mat Marquis, Shawn Jansepar (2.0 refactor lead)
* Authors of the improved **respimage** script: Alexander Farkas
* and many more: see [Authors.txt](Authors.txt)

##Contributing
Fixes, PRs and issues are always welcome, make sure to create a new branch from the **dev** (not the stable branch), validate against JShint and test in all browsers. In case of an API/documentation change make sure to also document it here in the readme.md.
