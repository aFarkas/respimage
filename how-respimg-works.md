#How ``respimage`` works internally
In case you want to know how to use ``respimage``, simply go to the [readme](README.md). This document describes some internal core concepts of ``respimage``.

``respimage`` uses several techniques to increase perceived performance or reduce bandwidth:

##Polyfill vs. graceful degradation / progressive enhancement and "image data trashing"
Polyfilling responsive images with a fallback ``src`` can lead to a wasted / trashed doubble request in non-supporting browsers and therefore some polyfills recommend to fully omit the src attribute, which antagonizes the natively and [specified](https://html.spec.whatwg.org/multipage/embedded-content.html#the-img-element:attr-img-src-2) build-in graceful degradation support in responsive images. As it turns out it's also [not the](http://lists.w3.org/Archives/Public/public-respimage/2014Sep/0028.html) [best thing to do](https://twitter.com/grigs/status/327429827726561280) [performancewise](http://www.stevesouders.com/blog/2013/04/26/i/).

While ``respimage`` also supports omitting the ``src`` attribute, ``respimage`` plays nicely with your progressive enhancement strategy and does not trash an already started image download.

``respimage`` instead implements a variation of the [low quality image placeholder pattern](http://www.guypo.com/feo/introducing-lqip-low-quality-image-placeholders/) to increase perceived performance.[^]

As it turns out, it works so nice, that it could also be used as an enhancement by browser vendors especially in case of a low bandwidth situation.

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

Although the example above is constructed, this simple and basic technique can save a lot of bandwidth with real images and realistic sizes: [comparison polyfill demo](http://afarkas.github.io/responsive-image-race/)).

Note: That ``respimage`` does only work in browsers, which do not support the srcset attribute natively. This means you should not use Chrome for the examples above.

**``respimage`` is built to not only use responsive images today, but also to use it responsible without wasting any data or writing invalid markup.**






[^]: The way how LIQP is implemented by ``respimage`` is a middle ground between the implementation described by [Guypo](http://www.guypo.com/feo/introducing-lqip-low-quality-image-placeholders/) and the implementation suggested by [Steve Souders](http://www.guypo.com/feo/introducing-lqip-low-quality-image-placeholders/#post-850994943).
