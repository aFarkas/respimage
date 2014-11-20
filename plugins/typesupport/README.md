#respimage - type[support] plugin

While respimage includes type detection for the most used images (png, jpeg, gif and svg), this tiny plugin extends the type detection to the following formats:

* **webp** (image/webp)
* **APNG** (video/png, video/apng, video/x-mng, video/x-png)
* **JPEG XR** (image/vnd.ms-photo)
* **JPEG 2000** (image/jp2, image/jpx, image/jpm)

Note: This is not a polyfill, this is simply a type detection.

##Download and embed
Download the ``ri.type.min.js`` and include it after the respimage script:

```html
<script src="respimage.min.js" async=""></script>
<script src="plugins/typesupport/ri.type.min.js" async=""></script>
```

In case you want to include **respimage** only if the browser doesn't support responsive images yoo can use a script loader or write the following at the top of your head:

```html
<script>
if(!window.HTMLPictureElement){
	//load respimage polyfill + typesupport plugins
	document.write('<script src="respimage.min.js" async=""><\/script>');
	document.write('<script src="plugins\/typesupport\/ri.type.min.js" async=""><\/script>');
}
</script>
```

Of course it is recommended to combine your scripts.
