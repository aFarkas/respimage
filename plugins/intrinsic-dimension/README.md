#respimage - Intrinsic dimension / size /scaling plugin

The very lightweight intrinsic dimension plugin extends ``respimage`` to add the intrinsic dimension based on the descriptor (and the sizes attribute) and the density of the source candidate to the width content attribute of the image element. This scaling can be of course simply overwritten by any CSS selector.

##Download and embed
Simply download the ``ri.intrinsic.min.js`` and include it after the respimage script:

```html
<script src="respimage.min.js" async=""></script>
<script src="plugins/intrinsic-dimension/ri.intrinsic.min.js" async=""></script>
```

In case you want to include **respimage** only if the browser doesn't support responsive images you can use a script loader or write the following at the end of your head:

```html
<script>
if(!window.HTMLPictureElement){
	//load respimage polyfill + mutation plugins
	document.write('<script src="respimage.min.js" async=""><\/script>');
	document.write('<script src="plugins\/intrinsic-dimension\/ri.intrinsic.min.js" async=""><\/script>');
}
</script>
```

Of course it is recommend to combine your scripts.

