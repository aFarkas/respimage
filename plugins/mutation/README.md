#respimage - Mutation plugin

The mutation plugin extends ``respimage`` to automatically detect new responsive images in the document and additionally detects relevant attribute changes / mutations for responsive images. It also re-normalizes the ``getAttribute`` method in conjunction with the ``src`` and the ``srcset`` attribute. And adds getter and setter support for ``sizes`` and ``srcset`` as also getter support for the ``currentSrc`` property.

##Download and embed
Simply download the ``ri.mutation.min.js`` and include it after the respimage script:

```html
<script src="respimage.min.js" async=""></script>
<script src="plugins/mutation/ri.mutation.min.js" async=""></script>
```

In case you want to include **respimage** only if the browser doesn't support responsive images you can use a script loader or write the following at the top of your head (as inline script before any blocking resource):

```html
<script>
function loadJS(u){var r = document.getElementsByTagName( "script" )[ 0 ], s = document.createElement( "script" );s.src = u;r.parentNode.insertBefore( s, r );}

if(!window.HTMLPictureElement){
	loadJS("respimage.min.js");
	loadJS("plugins/mutation/ri.mutation.min.js");
}
</script>
```

Of course it is recommend to combine your scripts.

