#respimage - type[support] plugin

While respimage includes type detection for the most used images (png, jpeg, gif and svg), this tiny plugin extends the type detection to the following formats:

* **webp** (image/webp)
* **JPEG XR** (image/vnd.ms-photo)
* **JPEG 2000** (image/jp2, image/jpx, image/jpm)
* **APNG** (video/png, video/apng, video/x-mng, video/x-png) (There is no official type for apng)

Note: This is not a polyfill, this is simply a type detection.

##Download and embed
Download the ``ri.type.min.js`` and include it after the respimage script:

```html
<script src="respimage.min.js" async=""></script>
<script src="plugins/typesupport/ri.type.min.js" async=""></script>
```

In case you want to include **respimage** only if the browser doesn't support responsive images you can use a script loader or write the following at the top of your head:

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

```html
<!-- simple type switching -->
<picture>
    <!--[if IE 9]><video style="display: none;"><![endif]-->
    <source
            srcset="image.webp"
            type="image/webp" />
    <source
            srcset="image.jxr"
            type="image/vnd.ms-photo" />
    <!--[if IE 9]></video><![endif]-->
    <img
            src="image.jpg"
            alt="image with typedirection" />
</picture>

<!-- combining type switching with w descriptor and sizes -->
<picture>
    <!--[if IE 9]><video style="display: none;"><![endif]-->
    <source
        srcset="466x200.webp 466w,
        	700x300.webp 700w,
        	1050x450.webp 1050w,
        	1400x600.webp 1400w"
        sizes="(max-width: 1000px) calc(100vw - 20px), 1000px"
        type="image/webp" />
    <source
        srcset="466x200.jxr 466w,
        	700x300.jxr 700w,
        	1050x450.jxr 1050w,
        	1400x600.jxr 1400w"
        sizes="(max-width: 1000px) calc(100vw - 20px), 1000px"
        type="image/vnd.ms-photo" />
    <!--[if IE 9]></video><![endif]-->
    <img
        src="466x200.jpg"
        srcset="466x200.jpg 466w,
        	700x300.jpg 700w,
        	1050x450.jpg 1050w,
        	1400x600.jpg 1400w"
        sizes="(max-width: 1000px) calc(100vw - 20px), 1000px"
        alt="image with typedirection" />
</picture>
``` 
