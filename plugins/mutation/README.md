#respimage - Mutation plugin

The mutation plugin extends ``respimage`` to automatically detect new responsive images in the document and additionally detects relevant attribute changes for responsive images. It also re-normalizes the ``getAttribute`` method in conjunction with the ``src`` and the ``srcset`` attribute.

##Download and embed
Simply download the ``ri.mutation.min.js`` and include it after the respimage script:

```html
<script src="respimage.min.js" async=""></script>
<script src="plugins/mutation/ri.mutation.min.js" async=""></script>
```

In case you want to include **respimage** only if the browser doesn't support responsive images yoo can use a script loader or write the following at the end of your head:

```html
<script>
if(!window.HTMLPictureElement){
	//load respimage polyfill + mutation plugins
	document.write('<script src="respimage.min.js" async=""><\/script>');
	document.write('<script src="plugins\/mutation\/ri.mutation.min.js" async=""><\/script>');
}
</script>
```

Of course it is recommend to combine your scripts.

