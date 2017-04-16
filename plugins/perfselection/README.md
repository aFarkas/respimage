# respimage - perfselection plugin

This plugin was removed.

## perceived performance vs. perceived quality on retina devices

Use one or the combination of the following techniques:

### constraining markup patterns via the ``picture`` element

#### Limitting high resolution candidates due to (max-width) fragmenting
```html
<picture>
    <!--[if IE 9]><video style="display: none;"><![endif]-->
    <source
        srcset="http://placehold.it/800x450 800w,
            http://placehold.it/600x300 600w,
            http://placehold.it/400x200 400w"
        media="(max-width: 760px)"
        sizes="calc(100vw - 10px)"
         />
    <source
        srcset="http://placehold.it/1440x720 1440w,
            http://placehold.it/1200x600 1200w,
            http://placehold.it/800x450 800w"
        media="(max-width: 1200px)"
        sizes="calc(100vw - 10px)"
         />
    <!--[if IE 9]></video><![endif]-->
    <img
        srcset="http://placehold.it/1600x900 1600w,
            http://placehold.it/1440x720 1440w,
            http://placehold.it/1200x600 1200w,
            http://placehold.it/800x450 800w,
            http://placehold.it/600x300 600w,
            http://placehold.it/400x200 400w"
        sizes="(max-width: 1200px) calc(100vw - 10px), 1200px"
        alt="picture but without artdirection" />
</picture>
```
#### Serve higher compressions to retina devices
```html
<picture>
<!--[if IE 9]><video style="display: none;"><![endif]-->
<source
    srcset="http://placehold.it/1600x900?quality=60 1600w,
        http://placehold.it/1440x720?quality=60 1440w,
        http://placehold.it/1200x600?quality=60 1200w,
        http://placehold.it/800x450?quality=60 800w,
        http://placehold.it/600x300?quality=60 600w,
        http://placehold.it/400x200?quality=60 400w"
    media="(-webkit-min-device-pixel-ratio: 1.5), 
        (min-resolution: 144dpi)"
    sizes="(max-width: 1200px) calc(100vw - 10px), 1200px"
     />
<!--[if IE 9]></video><![endif]-->
<img
    srcset="http://placehold.it/1600x900?quality=80 1600w,
        http://placehold.it/1440x720?quality=80 1440w,
        http://placehold.it/1200x600?quality=80 1200w,
        http://placehold.it/800x450?quality=80 800w,
        http://placehold.it/600x300?quality=80 600w,
        http://placehold.it/400x200?quality=80 400w"
    sizes="(max-width: 1200px) calc(100vw - 10px), 1200px"
    alt="picture but without artdirection" />
</picture>
```

### Use [lazyloading via lazysizes](https://github.com/aFarkas/lazysizes)

#### Use the [``data-optimumx`` extension for lazysizes](https://github.com/aFarkas/lazysizes/tree/gh-pages/plugins/optimumx)

#### Use [lazysizes responsive image service extension](https://github.com/aFarkas/lazysizes/tree/gh-pages/plugins/rias) with a third party or self hosted responsive image service
