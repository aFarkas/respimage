#respimage - print plugin

respimage also includes a simple print plugin, which boosts the image quality as also allows re-runs the source selection for ``source`` elements with the ``media="print"``.


##Download and embed
Download the ``ri.print.min.js`` and include it after the respimage script:

```html
<script src="respimage.min.js" async=""></script>
<script src="plugins/print/ri.type.print.js" async=""></script>
```

In case you want to include **respimage** only if the browser doesn't support responsive images you can use a script loader or write the following at the top of your head:

```html
<script>
function loadJS(u){var r = document.getElementsByTagName( "script" )[ 0 ], s = document.createElement( "script" );s.src = u;r.parentNode.insertBefore( s, r );}

if(!window.HTMLPictureElement){
	loadJS("respimage.min.js");
	loadJS("plugins/print/ri.print.min.js");
}
</script>
```

Of course it is recommended to combine your scripts.

##Browser support
This extension only works in IE9+ and Firefox. Also note, that current versions of the native implementations do not yet support this feature.
