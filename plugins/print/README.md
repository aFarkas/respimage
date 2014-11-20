#respimage - print plugin

respimage also includes a simple print plugin, which boosts the image quality as also allows re-runs the source selection for ``source`` elements with the ``media="print"``.


##Download and embed
Download the ``ri.print.min.js`` and include it after the respimage script:

```html
<script src="respimage.min.js" async=""></script>
<script src="plugins/print/ri.type.print.js" async=""></script>
```

In case you want to include **respimage** only if the browser doesn't support responsive images yoo can use a script loader or write the following at the top of your head:

```html
<script>
if(!window.HTMLPictureElement){
	//load respimage polyfill + typesupport plugins
	document.write('<script src="respimage.min.js" async=""><\/script>');
	document.write('<script src="plugins\/print\/ri.print.min.js" async=""><\/script>');
}
</script>
```

Of course it is recommended to combine your scripts.

##Browser support
This extension only works in IE9+ and Firefox. Also note, that current versions of the native implementations do not yet support this feature.
