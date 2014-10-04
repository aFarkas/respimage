#How ``respimg`` works internally
In case you want to know how to use ``respimg``, simply go to the [readme](readme.md). This document describes some internal core concepts of ``respimg``.

``respimg`` uses several techniques to increase perceived performance or reduce bandwidth.

##Polyfill vs. graceful degradation / progressive enhancement and "image data trashing"
Polyfilling a responsive image with a fallback ``src`` can lead to a wasted / trashed doubble request in non-supporting browsers and therefore some polyfills recommend to fully omit the src attribute, which antagonizes the natively and [specified](https://html.spec.whatwg.org/multipage/embedded-content.html#the-img-element:attr-img-src-2) build-in graceful degradation support in responsive images. As it turns out it's also [not the best thing to do performancewise](http://www.stevesouders.com/blog/2013/04/26/i/).

While ``respimg`` also supports omitting the ``src`` attribute, ``respimg`` plays nicely with your progressive enhancement strategy and never trashes an already started image download.

``respimg`` instead implements a variation of the [low quality images placeholder pattern](http://www.guypo.com/feo/introducing-lqip-low-quality-image-placeholders/) to increase perceived performance. (The way this is implemented by ``respimg`` is a middle ground between the implementation described by [Guypo](http://www.guypo.com/feo/introducing-lqip-low-quality-image-placeholders/) and the suggested implementation suggested by [Steve Souders](http://www.guypo.com/feo/introducing-lqip-low-quality-image-placeholders/#post-850994943).)

It's worth noting, that you must not use the smallest image in your fallback ``src`` to take advantage of this technique you can also use a medium sized image.

##Intelligent resource selection
Finding the best source for an image is simple math. In case a browser finds a ``srcset`` attribute with ``w`` descriptors. The browser calculates the pixel density for each source candidate. Here is an example:

```html
<img 
	srcset="small.jpg 500w, medium.jpg 1000w"
    src="small.jpg"
    sizes="500px"
    />
<!-- yeah, sizes="500px" doesn't make sense in a responsive design -->
```

The calculation is pretty simple. First the browser calculates the sizes attribute in pixel, in our case it's simple (500px are 500px ;-)) and then divides the width descriptor by the calculated current size:

```
small.jpg:  500w / 500px = 1
medium.jpg: 500w / 500px = 2
```

Then the browser simply looks at the devicePixelRatio (i.e.: pixel density) of the users device and the source candidate, which has a density euqal or higher is the best candidate.

The specification gives the implementors (mainly browser vendors, but also polyfills) room for improvements based on bandwidth, battery status, CPU/GPU performance, user preferences and so worth.

And this is where ``respimg``'s intelligent resource selection comes into play. Because there are possible improvements to the resource selection, that should be always optimized, if exact bandwidth, user preferences etc. are unknown.

While there are some "main breakpoints" you can never account for all breakpoints especially not, if you do multiply each of them, with the diversity of each devicePixelRatio's (1x, 1.5x, 2x and 2.25x).

Here is a simple example:

```html
<img 
	srcset="small.jpg 500w, medium.jpg 1000w, big.jpg 2000w"
    src="small.jpg"
    sizes="505px"
    />
```

The calculated pixel density are as follows:

```
small.jpg:  500w /  505px = 0.99
medium.jpg: 1000w / 505px = 1.98
big.jpg:    2000w / 505px = 3.96
```

What ``respimg`` resource selection is doing is quite simple. It searches for the best quality candidate in case of a device with 2 DPR, the example above returns the big.jpg with a density of the 3.96, then it compares the useless extra pixels (i.e.: 3.96 - 2 : 1.96) with the missing density of the next lower candidate "medium.jpg" (i.e.: only 0.02) and balances the quality vs. the download performance. Here is a simple [demo](http://codepen.io/aFarkas/full/tplJE/). Note: That the ``respimg`` does only work in browsers, which do not support the srcset attribute natively. This means you should not use Chrome for this test. Or in case you do use Chrome, you might want to fill an issue after that ;).

Well, the example above is constructed, so the main question is how much does this save with real image data and "real" sizes. The answer is a lot more than I thought myself. (demo with a lot of image data is comming ;-), until then try the following: [comparison polyfill demo](http://afarkas.github.io/responsive-image-race/)).

``respimg`` is built to not only use responsive images today, but also to use it responsible.








