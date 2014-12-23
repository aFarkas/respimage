#respimage - Intrinsic dimension / size /scaling plugin

The very lightweight intrinsic dimension plugin extends ``respimage`` to add the intrinsic dimension based on the descriptor (and the sizes attribute) and the density of the source candidate to the width content attribute of the image element. This scaling can be of course simply overwritten by any CSS selector.

##Download and embed
Simply download the ``ri.intrinsic.min.js`` and include it after the respimage script:

```html
<script src="respimage.min.js" async=""></script>
<script src="plugins/intrinsic-dimension/ri.intrinsic.min.js" async=""></script>
```

Here is a [demo of the intrinsic sizes extension](http://jsfiddle.net/trixta/gs3p14pr/embedded/result/).

In case you want to include **respimage** only if the browser doesn't support responsive images you can use a script loader or write the following at the top of your head:

```html
<script>
function loadJS(u){var r = document.getElementsByTagName( "script" )[ 0 ], s = document.createElement( "script" );s.src = u;r.parentNode.insertBefore( s, r );}

if(!window.HTMLPictureElement){
	document.createElement('picture');
	loadJS("respimage.min.js");
	loadJS("plugins/intrinsic-dimension/ri.intrinsic.min.js");
}
</script>
```

Of course it is recommend to combine your scripts.

In case you want to use a CDN you can use the combohandler service by jsDelivr:

```html
<script>
function loadJS(u){var r = document.getElementsByTagName( "script" )[ 0 ], s = document.createElement( "script" );s.src = u;r.parentNode.insertBefore( s, r );}

if(!window.HTMLPictureElement){
	document.createElement('picture');
	loadJS("http://cdn.jsdelivr.net/g/respimage(respimage.min.js+plugins/intrinsic-dimension/ri.intrinsic.min.js)");
}
</script>
```

Note: To get this fully work in IE8 the ``img`` elements need a ``height: auto``. Simply add the following line to your CSS normalization:

```html
img {
    height: auto;
}

/*
or only target specific img elements:
*/

.content img {
	height: auto;
}
```

