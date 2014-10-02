(function(window, $) {

	var startTests = function() {
		var op = respimg._;

		var saveCache = {};

		// reset stubbing

		module( "method", {
			setup: function() {
				var prop;
				for ( prop in op ) {
					if ( op.hasOwnProperty( prop ) ) {
						saveCache[ prop ] = op[ prop ];
					}
				}
			},

			teardown: function() {
				var prop;
				for ( prop in saveCache ) {
					if ( op.hasOwnProperty(prop) && saveCache[prop] != op[ prop ] ) {
						op[prop] = saveCache[prop];
					}
				}
			}
		});

		test( "respimg: Picture fill is loaded and has its API ready", function() {
			ok( window.respimg );

			ok( window.respimg._ );

			ok( window.respimg._.fillImg );

			ok( window.respimg._.fillImgs );

			ok( window.respimg._.observer );

			ok( window.respimg._.observer.start );

			ok( window.respimg._.observer.stop );

			ok( window.respimg._.observer.disconnect );

			ok( window.respimg._.observer.observe );

		});

		if ( !op.mutationSupport || window.HTMLPictureElement ) {
			return;
		}

		var calledFill = 0;
		var createImgSpy = function( ) {
			var old = op.fillImg;
			calledFill = 0;
			op.fillImg = function() {
				calledFill++;
				return old.apply( this, arguments );
			};
		};

		var runFunctionalNewElementsTests = function( $dom ) {
			var $images = $dom.find( op.sel );

			equal( $images.length, 6 );
			equal( calledFill, 6 );

			$images.each(function() {
				ok( this[ op.ns ]);
			});
		};

		asyncTest( "mutationobserver: functional integration test html", function() {
			var markup = $( "#template").html();

			createImgSpy();

			$("#mutation-fixture").html( markup );

			setTimeout(function() {
				runFunctionalNewElementsTests( $("#mutation-fixture") );
				start();
			}, 9);
		});

		asyncTest( "mutationobserver: functional integration test append", function() {
			var markup = $( "#template").html();

			createImgSpy();

			$("#mutation-fixture").append( markup );

			setTimeout(function() {
				runFunctionalNewElementsTests( $("#mutation-fixture") );
				start();
			}, 9);
		});
	};

	if( window.blanket ) {
		blanket.beforeStartTestRunner({
			callback: function() {
				setTimeout(startTests, QUnit.urlParams.coverage ? 500 : 0); //if blanketjs fails set a higher timeout
			}
		});
	} else {
		startTests();
	}

})( window, jQuery );
