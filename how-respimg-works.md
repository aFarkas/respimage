#How ``respimage`` works internally
In case you want to know how to use ``respimage``, simply go to the [readme](README.md). This document describes some internal core concepts of ``respimage``.

``respimage`` uses several techniques to increase perceived performance or reduce bandwidth:

##Polyfill vs. graceful degradation / progressive enhancement and "image data trashing"
Polyfilling responsive images with a fallback ``src`` can lead to a wasted / trashed double request in non-supporting browsers and therefore some polyfills recommend to fully omit the src attribute, which antagonizes the natively and [specified](https://html.spec.whatwg.org/multipage/embedded-content.html#the-img-element:attr-img-src-2) build-in graceful degradation support in responsive images. As it turns out it's also [not the](http://lists.w3.org/Archives/Public/public-respimage/2014Sep/0028.html) [best thing to do](https://twitter.com/grigs/status/327429827726561280) [performancewise](http://www.stevesouders.com/blog/2013/04/26/i/). As also a problem for search engine/bot visibility and the general validity of the document.

While ``respimage`` also supports omitting the ``src`` attribute, ``respimage`` plays nicely with your progressive enhancement strategy (your valid markup) and does not waste an already started image download. respimage automatically adapts to your own ``src`` strategy by implementing various techniques:

if the initially set image ``src``...

* ... is to heavy and the browser supports image request abortion (all IEs and FF 36+) respimage will abort the request and load a smaller image
* ... isn't perfect, but still has a good quality respimage won't change the ``src``
* ... is detected as too fuzzy respimage will not simply change the ``src`` but implements a variation of the [low quality image placeholder pattern (LQIP)](http://www.guypo.com/feo/introducing-lqip-low-quality-image-placeholders/) to increase perceived performance.[^]

As it turns out, the LQIP pattern works so nice, that it could also be used as an enhancement by browser vendors especially in case of a low bandwidth situation and I developed a [lazylaoder, which brings the same perceived performance improvements to supporting browsers](https://github.com/aFarkas/lazysizes).

It's worth noting, that you must not use the smallest image in your fallback ``src`` to take advantage of this technique you can also use a medium sized image.

##The ~~smart~~ or the "not-so-stupid" resource selection
Finding the best source for an image is simple math. In case a browser finds a ``srcset`` attribute with ``w`` descriptors. The browser needs to calculate the pixel density for each source candidate. Here is an example of the calculation:

```html
<img
	srcset="small.jpg 500w, medium.jpg 1000w"
    src="small.jpg"
    sizes="500px"
    />
<!-- yeah, sizes="500px" doesn't make sense in a responsive design -->
```

The calculation is pretty simple. First the browser calculates the sizes attribute in CSS pixels, in our case it's simple (500px are 500px ;-)) and then divides the width descriptor by the calculated current size:

```
small.jpg:   500w / 500px = 1x
medium.jpg: 1000w / 500px = 2x
```

Then the browser simply takes the source candidate, which can satisfy the pixel density of the user's device (devicePixelRatio).

The specification gives the implementers (mainly browser vendors, but also polyfills) room for improvements based on bandwidth, battery status, CPU/GPU performance, user preferences and so worth.

And this is where ``respimage``'s not so stupid resource selection comes into play. Because there are possible improvements to the resource selection, that should be always optimized, especially if exact bandwidth, user preferences etc. are unknown.

While there are some "main breakpoints" you can never account for all breakpoints especially not, if you do multiply each of them, with the diversity of each devicePixelRatio's (1x, 1.5x, 2x and 2.25x).

Here is a simple example of a calculation, where the image sizes doesn't fit:

```html
<img
	srcset="small.jpg 500w, medium.jpg 1000w, big.jpg 2000w"
    src="small.jpg"
    sizes="505px"
    />
```

The calculated pixel density are as follows:

```
small.jpg:  500w /  505px = 0.99x
medium.jpg: 1000w / 505px = 1.98x
big.jpg:    2000w / 505px = 3.96x
```

What ``respimage``'s resource selection is doing is quite simple. It searches for the best quality candidate. In case of a 2x device, the example above returns the big.jpg, then it compares the useless extra pixels (i.e.: 3.96x - 2x : 1.96x) with the missing density of the next lower candidate "medium.jpg" (i.e.: only 0.02) and balances the quality loss vs. the performance decrease. This means the more useless data has to be downloaded, the greedier the algorithm trys to fetch the next lower candidate.

Here is a simple [demo](http://codepen.io/aFarkas/full/tplJE/).

The algorithm used for this is based on the following math.

Let's start to include a simple "get the nearest candidate algorithm" and then refine it. We assume a 2x device and two candidates one with a resolution of 1.8x and one with a resolution with 2.6x.

```js
// constants
var devicePixel = 2;
var lowRes = 1.8;
var highRes = 2.6;


var uselessDensity = highRes - devicePixel; // 0.6
var lowBonus = uselessDensity; // 0.6

var newLowRes = lowRes + lowBonus; // 2.4

return (newLowRes > devicePixel); // true

```

While this algorithm is good, it doesn't take into account the actual perceived quality of the lower resolution image candidate and the squared image data of higher densities. For example, if you treat a lower resolution candidate with 0.7x against a higher resolution candidate with 1.4x on a 1x device, the algorithm would choose the extreme fuzzy 0.7x image. On the other hand on a 2x device the algorithm would prefer a 2.2x image over a 1.7x image, although the 1.7x image looks almost identicall to the 2.2x on this device, but is only half the size. This considerations yields to the following simple refinement.

```js
// example 1.
// constants
var devicePixel = 1;
var lowRes = 0.7;
var highRes = 1.4;

var uselessDensity = highRes - devicePixel; // 0.4
var lowBonus = uselessDensity * lowRes; // 0.28

var newLowRes = lowRes + lowBonus; // 0.98

return (newLowRes > devicePixel); // false

// example 2. (same algorithm)
// constants
var devicePixel = 2;
var lowRes = 1.7;
var highRes = 2.2;


var uselessDensity = highRes - devicePixel; // 0.2
var lowBonus = uselessDensity * lowRes; // 0.34

var newLowRes = lowRes + lowBonus; // 2.04

return (newLowRes > devicePixel); // true
```

Additionally to this algorithm, respimage's source selection algorithm also takes into account the device orientation (i.e. the performance algorithm runs more aggressive in landscape than in portrait mode) and also gives the current already loaded image source some additional advantage (i.e: in case of a resize/orientationchange or if there was an initial ``src`` applyed) to minimize re-downloads or double downloads.

This simple and basic technique can save a lot of bandwidth with real images and realistic sizes: [smart selection demo](https://afarkas.github.io/respimage/cfg/index.html).

Note: That ``respimage`` does only work in browsers, which do not support the srcset attribute natively. This means you should not use Chrome for the examples above.

**``respimage`` is built to not only use responsive images today, but also to use it responsible without wasting any data or writing invalid markup.**





[^]: The way how LIQP is implemented by ``respimage`` is not the implementation described by [Guypo](http://www.guypo.com/feo/introducing-lqip-low-quality-image-placeholders/) but variation suggested by [Steve Souders](http://www.guypo.com/feo/introducing-lqip-low-quality-image-placeholders/#post-850994943). As a result it can often decrease the duration until the ``onload`` event is triggered, but it will always improve perceived performance dramatically. In case you want to use the LQIP pattern for all browsers, not only Safari and FF35-, we suggest using [lazySizes]().
