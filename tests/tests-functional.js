(function(window, $) {
	var relurls = {};
	var absurls = {};

	$.each(['350x150', '700x300', '1400x600', '2100x900', '2800x1200'], function(i, name){
		var img = document.createElement('img');
		img.src = 'resources/more-imgs/'+ name +'.gif';
		relurls[name] = 'more-imgs/'+ name +'.gif';
		absurls[name] = img.src;
	});
	var startTests = function() {

		var $iframe = $('#functional-content');
		var frameWindow = $iframe.prop('contentWindow');
		var f$ = frameWindow.$;
		var $content = f$('#content');
		var respimage = frameWindow.respimage;
		var ri = respimage._;
		var saveCache = {};


		var afterImgLoad = function(cb){
			var timer;
			var run = function(){
				clearTimeout(timer);
				timer = setTimeout(cb, 99);
			};
			$content
				.find('img')
				.filter(function(){
					return !this.complete;
				})
				.on('load error', run)
			;
			run();
		};

		// reset stubbing

		module( "method", {
			setup: function() {
				var prop;
				$iframe.css('width', 1024);
				$content.empty();

				for ( prop in ri ) {
					if ( ri.hasOwnProperty( prop ) ) {
						if($.isPlainObject(ri[ prop ])){
							saveCache[ prop ] = $.extend(true, {}, ri[ prop ]);
						} else {
							saveCache[ prop ] = ri[ prop ];
						}
					}
				}
			},

			teardown: function() {
				var prop;
				for ( prop in saveCache ) {
					if ( ri.hasOwnProperty(prop) && (prop in saveCache) && saveCache[prop] != ri[ prop ] ) {
						if($.isPlainObject(ri[ prop ]) && $.isPlainObject(saveCache[prop])){
							$.extend(true, ri[prop], saveCache[prop]);
						} else {
							ri[prop] = saveCache[prop];
						}
					}
				}
			}
		});

		asyncTest( "simple x image without 1x in srcset", function() {
			var $ximage = f$('<img />').attr({
				src: relurls['350x150'],
				srcset: relurls['700x300'] +' 2x'
			});
			$ximage.appendTo($content);

			afterImgLoad(function(){
				var curSrc = ri.DPR > 1.2 ? absurls['700x300'] : absurls['350x150'];
				if(!ri.supSrcset || window.HTMLPictureElement){
					equal($ximage.prop('currentSrc'), curSrc);
				}
				equal($ximage.prop('offsetWidth'), 350);
				equal($ximage.attr('src'), relurls['350x150']);
				start();
			});
		});
	};

	$(window).load(startTests);

})( window, jQuery );
