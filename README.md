#respimage
``respimage`` is the fast, lightweight and robust [responsive images](http://picture.responsiveimages.org/) polyfill, that plays nicely with your graceful degradation / progressive enhancement strategy and saves the users bandwidth by [utilizing a simple but smart resource selection algorithm](how-respimage-works.md). It implements the ``srcset``/``sizes`` attributes as also the ``picture`` element.

##Download and Embed
Simply [download the respimage.min.js](respimage.min.js) script and add it to your website or bundle it in your normal JS.

```html
<script src="respimage.min.js"></script>
```
Respimg will automatically run and polyfill all images. So you can simply start writing responsive images.

##Markup Examples
Responsive images can be technically differentiated between 2 types.

* ``srcset`` with source descriptors: (let the browser choose the right image based on screen size/resolution, bandwidth...)
	* density descriptor (``x``) (for static image sizes, Retina vs. normal resolution)
	* width descriptor (``w``) and the corresponding ``sizes`` attribute (for flexible, responsive / adaptive images)
* and the ``picture`` element with its ``source[media]`` children (gives the author control about what srcset should be chosen by the browser depending on specific media queries)


###``srcset`` with the density ``x`` descriptor
The ``x`` descriptor is natively supported in Chrome and Safari 7.1+. All other browsers will be polyfilled. Note: You must not mix the ``w`` and the ``X`` descriptor in one ``srcset`` attribute!

```html
<img 
	srcset="http://placehold.it/700x300 2x"
	src="http://placehold.it/350x150" 
    alt="Static content image" />
```

###``srcset`` with the width ``w`` descriptor and the ``sizes`` attribute
The ``w`` descriptor is currently only supported in Chrome. All other browsers will be polyfilled. Note: You must not mix the ``w`` and the ``X`` descriptor in one ``srcset`` attribute!

```html
<img 
	srcset="http://placehold.it/700x300 700w, 
        http://placehold.it/1400x600 1400w,
        http://placehold.it/2800x1200 2800w" 
     sizes="(max-width: 1400px) 100vw, 1400px" 
     src="http://placehold.it/1400x600"
     alt="flexible image" />
```

###The ``picture`` element
The ``picture`` element is currently only supported in Chrome. All other browsers will be polyfilled. To support IE9 all source elements have to be wrapped inside of an ``audio`` or hidden ``video`` element:

```html
<picture>
	<!--[if IE 9]><audio><![endif]-->
    <source 
    	srcset="http://placehold.it/700x300" 
        media="(max-width: 756px)" />
    <source 
    	srcset="http://placehold.it/1400x600/e8117f/fff" 
        media="(max-width: 1280px)" />
    <!--[if IE 9]></audio><![endif]-->
    <img 
    	src="http://placehold.it/2100x900/117fe8/fff" 
        alt="image with artdirection" />
</picture>
```

The art direction approach of the picture element and the descriptor approach can also be mixed:

```html
<picture>
	<!--[if IE 9]><video style="display: none;"><![endif]-->
    <source 
    	srcset="http://placehold.it/700x300 2x,
        	http://placehold.it/350x150 1x" 
        media="(max-width: 500px)" />
    <source 
    	srcset="http://placehold.it/1400x600/e8117f/fff 1.5x, 
        	http://placehold.it/1024x439/e8117f/fff 1x"
        media="(max-width: 1024px)" />
    <!--[if IE 9]></video><![endif]-->
    <img 
    	src="http://placehold.it/2100x900/117fe8/fff" 
        alt="image with artdirection" />
</picture>
```

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

In case you are not supporting IE8 we recommend to use the [Mutation plugin](plugins/mutation) instead of doing this.

###``respimage.config`` method

####``addSize`` option (default: ``false``)
``respimage`` can add the intrinsic width based on the descriptor (and the sizes attribute) and the density of the source candidate to the width content attribute of the image element. This can be of course simply overwritten by any CSS selector. In case this standard behavior is wanted ``addSize`` can be set to ``true``.

```js
respimage.config( "addSize", true );
```
The ``addSize`` feature is not available in IE8.

####``xQuant`` option (default: 1)
The ``xQuant`` option defaults to 1 and manipulates the calculation of the best image candidate in polyfilled browsers. It basically multiplies the ``devicePixelRatio`` of the browser. In case xQuant is above 1 a picture with a higher density (good for high quality/zooming) and in case the value is below 1 an image with a lower density is chosen (good for performance).

```js
respimage.config( "xQuant", 0.8 );
```
The `xQuant` option can be adjusted for testing or in conjunction with feature detection (lowbandwidth, lowbattery, lowcpu or vice versa etc.) conditionally changed. But please use it responsibly. You can't feature detect and control everything.

## Browser Support
``respimage`` supports a broad range of browsers and devices. Respimg is actively tested in the following browsers and devices IE8+, Firefox (ESR and current), Safari 7.0+, Chrome, Opera, Android 4.1+ and IOS 7+, but should work in a lot more browsers/devices. IE6 and IE7 are not supported.

###Troubleshooting and bug reporting
In case of any problems include the **respimage.dev.js** into your project and open your JS console. In case you think you have found a bug, please create a testcase and then report your issue. Note: You should not use the dev build inside your production environment, because it is a lot slower.

##Comparison to picturefill 2.1/2.2-pre
``respimage`` is a performance improved (especially network performance) variant of the famous ``picturefill`` polyfill with many additional bugfixes. It includes more than 20 bugfixes compared to the normal ``picturefill`` polyfill and also adds fundamental improvements in standards support, saves bandwidth through intelligent resource selection algorithms and has its code coverage over 80%. It's simply a ``picturefill`` on steroids. In case you are not convinced, [read this](how-respimage-works.md) or [test here](http://afarkas.github.io/responsive-image-race/).

##The [Mutation - Plugin](plugins/mutation)
This plugin automatically detects new responsive images and also changes to srcset/media and sizes attributes.

##Known issues/caveats
* browsers without picture and srcset support and disabled JS will either show the image specified with the ``src`` attribute or - if ommitted - show only the alt text
* ``respimage`` is quite good at detecting not to download a source candidate, because an image with a good resolution was already downloaded. If a fallback src with a lower resolution or another art direction set is used, ``respimage`` however will start to download the better candidate, after the browser might already started to download the worse fallback candidate. Possible solutions/workarounds: 
    * omit the ``src`` attribute, 
    * add the attribute ``data-no-ri`` to the images, which shouldn't be polyfilled,
    * use a lazyLoading script (what you should do, if you are a performance aware developer anyway) or
    * simply live with it. (recommended, because ``respimage`` does not simply switch the image src, but implements the [low qualitiy image placeholder (LQIP)](how-respimage-works.md) technique
* Media queries support in old IEs (IE8/IE9) are limited to min-width and max-width. For IE9 it is possible to extend support by including a [``matchMedia`` polyfill](https://github.com/paulirish/matchMedia.js).

##Responsive images and lazy loading
Beside the fact, that lazy loading can not only improve performance, there is an interesting side effect. Due to the fact the image loading is delayed the sizes attribute can be dynamically calculated with JS and makes integrating responsive images therefore easy.

##Authors
* Authors of the original work: Scott Jehl, Mat Marquis, Shawn Jansepar (2.0 refactor lead)
* Authors of the improved ``respimage`` script: Alexander Farkas
* and many more: see [Authors.txt](Authors.txt)

##Contributing
Fixes, PRs and issues are always welcome, make sure to create a new branch from the **dev** (not the stable branch), validate against JShint and test in all browsers. In case of an API/documentation change make sure to also document it here in the readme.md.

