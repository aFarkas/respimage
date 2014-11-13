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


		var afterImgLoad = function(cb){
			var timer;
			var run = function(){
				clearTimeout(timer);
				timer = setTimeout(cb, 222);
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
		var createPicture = function(srces, attrType){
			if(!attrType){
				attrType = 'attr';
			}
			var picture = frameWindow.document.createElement('picture');
			$.each(srces, function(i, attrs){
				var src;
				if(i >= srces.length -1){
					src = 'img';
				} else {
					src = 'source';
				}
				src = frameWindow.document.createElement(src);
				picture.appendChild(src);
				$(src)[attrType](attrs);
			});
			return picture;
		};
		var runViewportTests = function($picture, viewports, cb){
			var $image;
			var results = {};
			var viewport = viewports.shift();
			var run = function(){
				results[viewport] = {
					currentSrc: $image.prop('currentSrc'),
					offsetWidth: $image.prop('offsetWidth'),
					offsetHeight: $image.prop('offsetHeight'),
					src: $image.attr('src')
				};
				viewport = viewports.shift();
				if(viewport){
					$iframe.css('width', viewport);
					afterImgLoad(run);
				} else if(cb) {
					cb(results);
					cb = false;
				}
			};
			$picture = $($picture);
			if($picture.is('picture')){
				$image = $picture.find('img');
			} else {
				$image = $picture;
			}
			$iframe.css('width', viewport);
			setTimeout(function(){
				$picture.appendTo($content);

				if(!ri.mutationSupport){
					setTimeout(respimage);
				}
				afterImgLoad(run);
			}, 33);
			return results;
		};

		// reset stubbing

		module( "method", {
			setup: function() {
				$iframe.css('width', 1024);
				$content.empty();

				if(!ri.mutationSupport){
					setTimeout(respimage);
				}
			}
		});

		asyncTest( "simple x image without 1x in srcset", function() {
			var $ximage = f$('<img />').attr({
				src: relurls['350x150'],
				srcset: relurls['700x300'] +' 2x'
			});
			$ximage.appendTo($content);

			//IE8/IE9 needs a clear remove here
			$ximage.removeAttr('width');
			$ximage.removeAttr('height');

			afterImgLoad(function(){
				var curSrc = ri.DPR > 1.2 ? absurls['700x300'] : absurls['350x150'];
				if(!ri.supSrcset || window.HTMLPictureElement){
					equal($ximage.prop('currentSrc'), curSrc);
				}
				equal($ximage.prop('offsetWidth'), 350);
				if(ri.mutationSupport){
					equal($ximage.attr('src'), relurls['350x150']);
				}
				start();
			});
		});

		asyncTest( "simple x image with 1x in srcset", function() {
			var $ximage = f$('<img />').attr({
				src: relurls['1400x600'],
				srcset: relurls['350x150'] +' 1x, '+ relurls['700x300'] +' 2x'
			});
			$ximage.appendTo($content);

			//IE8/IE9 needs a clear remove here
			$ximage.removeAttr('width');
			$ximage.removeAttr('height');

			afterImgLoad(function(){
				var curSrc = ri.DPR > 1.2 ? absurls['700x300'] : absurls['350x150'];
				if(!ri.supSrcset || window.HTMLPictureElement){
					equal($ximage.prop('currentSrc'), curSrc);
				}
				equal($ximage.prop('offsetWidth'), 350);
				if(ri.mutationSupport) {
					equal($ximage.attr('src'), relurls['1400x600']);
				}
				start();
			});
		});

		asyncTest( "simple x image with 2.05x in src", function() {
			var $ximage = f$('<img />').attr({
				src: relurls['1400x600'],
				srcset: relurls['1400x600'] + ' 2.05x, ' +relurls['350x150'] +' 1x, '+ relurls['700x300'] +' 2x'
			});
			$ximage.appendTo($content);

			afterImgLoad(function(){

				if(!ri.supSrcset){
					equal($ximage.prop('currentSrc'), absurls['1400x600']);
				}
				if(ri.mutationSupport) {
					equal($ximage.attr('src'), relurls['1400x600']);
				}
				start();
			});
		});

		if(!window.HTMLPictureElement){
			(function(){
				var test = function(attrType) {
					return function(){
						var viewports = [320, 620, 800];
						var $wimage = f$('<img />')[attrType]({
							src: relurls['350x150'],
							sizes: '(max-width: 400px) calc(200px * 1.5), (max-width: 700px) 710px, 2000px',
							srcset: relurls['1400x600'] + ' 1400w, ' +relurls['350x150'] +' 350w, ' +
							relurls['700x300'] +' 700w,' +
							relurls['2100x900'] +' 2100w 900h,' +
							absurls['2800x1200'] + ' 1200h 2800w'
						});

						//IE8/IE9 needs a clear remove here
						$wimage.removeAttr('width');
						$wimage.removeAttr('height');

						runViewportTests($wimage, viewports, function(results){
							var dpr = window.devicePixelRatio || 1;
							var rdpr = Math.round(dpr);

							if(dpr % 1 < 0.1 && (rdpr == 1 || rdpr == 2)){
								equal(results['320'].currentSrc, rdpr == 1 ? absurls['350x150'] : absurls['700x300']);
								equal(results['620'].currentSrc, rdpr == 1 ? absurls['700x300'] : absurls['1400x600']);
								equal(results['800'].currentSrc, rdpr == 1 ? absurls['2100x900'] : absurls['2800x1200']);
							}

							equal(results['320'].offsetWidth, 300);
							equal(results['620'].offsetWidth, 710);
							equal(results['800'].offsetWidth, 2000);

							start();
						});
					};
				};

				asyncTest("image with w descriptor (setAttribute)", test('attr'));

				if(ri.mutationSupport){
					asyncTest("image with w descriptor (prop idl setter)", test('prop'));
				}
			})();
		}

		asyncTest("image with w descriptor and untrue w", function() {
			var $wimage = f$('<img />').attr({
				src: relurls['350x150'],
				sizes: '300px',
				srcset: relurls['350x150'] +' 300w, ' +
				relurls['700x300'] +' 600w'
			});

			$wimage.appendTo($content);

			afterImgLoad(function(){
				var curSrc = ri.DPR > 1.3 ? absurls['700x300'] : absurls['350x150'];
				equal($wimage.prop('offsetWidth'), 350);
				equal($wimage.prop('currentSrc'), curSrc);
				if(ri.mutationSupport) {
					equal($wimage.attr('src'), relurls['350x150']);
				}
				start();
			});
		});

		asyncTest( "simple picture without src img", function() {

			var viewports = [320, 620, 800];
			var picture = createPicture([
				{
					srcset: relurls['350x150'],
					media: '(max-width: 480px)'
				},
				{
					srcset: relurls['1400x600'],
					media: '(min-width: 800px)'
				},
				{
					srcset: relurls['700x300']
				}
			]);


			runViewportTests(picture, viewports, function(results){

				equal(results['320'].currentSrc, absurls['350x150']);
				equal(results['620'].currentSrc, absurls['700x300']);
				equal(results['800'].currentSrc, absurls['1400x600']);

				start();
			});

		});

		asyncTest( "complex picture with src and srcset img", function() {

			var viewports = [320, 620, 800];

			var picture = createPicture([
				{
					srcset: relurls['350x150']+' 1x,'+relurls['2100x900']+' 1.2x',
					media: '(max-width: 480px)'
				},
				{
					srcset: relurls['1400x600'],
					media: '(min-width: 800px)'
				},
				{
					src: relurls['700x300'],
					srcset: relurls['2800x1200']
				}
			]);


			runViewportTests(picture, viewports, function(results){

				equal(results['320'].currentSrc, ri.DPR < 1.1 ? absurls['350x150'] : absurls['2100x900']);
				equal(results['620'].currentSrc, absurls['2800x1200']);
				equal(results['800'].currentSrc, absurls['1400x600']);

				start();
			});
		});

		(function(){
			var test = function(attrType){
				return function() {

					var viewports = [320, 800];
					var data = [
						{
							srcset: relurls['350x150']+'  350w,'+relurls['700x300']+' 400w',
							media: '(max-width: 480px)',
							sizes: '340px'
						},

						{
							src: relurls['2100x900'],
							srcset: relurls['2800x1200'] +'  600w , '+relurls['1400x600']+' 700w , '
						}
					];
					var picture = createPicture(data, attrType);


					runViewportTests(picture, viewports, function(results){
						if(ri.mutationSupport){
							equal($('source', picture).prop('srcset'), data[0].srcset);
							equal($('source', picture).prop('media'), data[0].media);
							equal($('source', picture).prop('sizes'), data[0].sizes);
							strictEqual($('source', picture).prop('type'), '');


							if(!ri.supSrcset || ri.supSizes){
								equal($('img', picture).prop('srcset'), data[1].srcset);
							}
							equal($('img', picture).prop('media'), data[1].media);
							strictEqual($('img', picture).prop('sizes'), '');
						}

						equal($('img', picture).attr('srcset'), data[1].srcset);
						equal(results['320'].currentSrc, ri.DPR < 1.1 ? absurls['350x150'] : absurls['700x300']);

						equal(results['800'].currentSrc, absurls['1400x600']);

						start();
					});
				};
			};

			asyncTest( "complex picture with src and srcset img and w descriptors (setAttribute)", test('attr'));

			if(ri.mutationSupport){
				asyncTest( "complex picture with src and srcset img (idl setter)", test('prop'));
			}

		})();
	};

	$(window).load(startTests);

})( window, jQuery );
