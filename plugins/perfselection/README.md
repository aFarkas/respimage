#respimage - perfselection plugin

While the normal smart selection algorithm does a great job in balancing performance vs. image quality the performance selection plugins hooks into the smart selection algorithm to greed for more performance on biased opinions.

##``respimage.config( "constrainDPI", true )``
The ``"constrainDPI"`` option defaults to true. It is based on the [biased opinion](http://www.quirksmode.org/blog/archives/2012/03/the_ipad_3_and.html), that usually a normal image on a 2x retina device also looks good enough, if it is served with 1.5x quality. The plugin won't greed for more performance, if it assumes that a .gif, .png or .svg is used. Here is a demo: [normal smart selection](http://rawgit.com/aFarkas/respimage/stable/cfg/child.html) and [constrainDPI selection](http://rawgit.com/aFarkas/respimage/stable/cfg/child.html?perfselection). (In case you have only a 1x device, you wont see any differences).

##``respimage.config( "lowbandwidth", true )``
The ``"lowbandwidth"`` option defaults to false. In case a developer knows or assumes that he visitor has a lowbandwidth, he can turn this option on.

```js
respimage.config( "lowbandwidth", true );
```

Note this won't turn on a feature detection. It will simply change the smart selection algorithm to search for lower resolution candidates. It is designed to be used in conjunction with the ``constrainDPI`` option.
Here is a demo: [normal smart selection](http://rawgit.com/aFarkas/respimage/stable/cfg/child.html) and [lowbandwidth selection](http://rawgit.com/aFarkas/respimage/stable/cfg/child.html?lowbandwidth).

##Download and embed
Simply download the ``ri.perfselection.min.js`` and include it after the respimage script:

```html
<script src="respimage.min.js"></script>
<script src="plugins/perfselection/ri.perfselection.min.js"></script>
```

Of course it is recommended to combine your scripts.

See also [lazysizes script for lazyloading and improved low quality image placeholder](https://github.com/aFarkas/lazysizes).

