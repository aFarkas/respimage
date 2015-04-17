/*global module:true*/
(function () {
	"use strict";

	var pkg;

	module.exports = function (grunt) {

		// Project configuration.
		grunt.initConfig({
			// Metadata.
			pkg: pkg = grunt.file.readJSON("bower.json"),
			banner: "/*! <%= pkg.name %> - v<%= pkg.version %> - " +
				"<%= grunt.template.today('yyyy-mm-dd') %>\n" +
				" Licensed <%= pkg.license %> */\n",
			// Task configuration.
			uglify: {
				options: {
					banner: "<%= banner %>",

					compress: {
						global_defs: {
							"RIDEBUG": false
						},
						dead_code: true
					}
				},
				dev: {
					options: {
						beautify: true,
						compress: {

							global_defs: {
								"RIDEBUG": false
							},
							dead_code: true
						},
						mangle: false
					},
					src: [ "respimage.dev.js" ],
					dest: "respimage.js"
				},
				main: {
					src: [ "respimage.js" ],
					dest: "respimage.min.js"
				},
				plugins: {
					files: [{
						expand: true,
						cwd: 'plugins/',
						src: ['**/*.js', '!*.min.js', '!**/*.min.js'],
						dest: 'plugins/',
						ext: '.min.js',
						extDot: 'last'
					}]
				}
			},
			qunit: {
				options: {
					timeout: 50000
				},
				files: [ "tests/*.html", "!tests/index-functional.html" ]
			},
			jshint: {
				all: {
					options: {
						jshintrc: true
					},
					src: [ "respimage.dev.js", "plugins/*.js", "tests/*.js", "!Gruntfile.js", "!*.min.js", "!**/*.min.js" ] //, "Gruntfile.js", "tests/*.js"
				}
			},
			watch: {
				gruntfile: {
					files: [ "Gruntfile.js", "respimage.dev.js", "plugins/*.js", "tests/*.js", "!*.min.js", "!**/*.min.js" ],
					tasks: [ "default" ]
				}
			},
			bytesize: {
				all: {
					src: [ "respimage.min.js" ]
				}
			},
			maxFilesize: {
				options: {
					// Task-specific options go here.
				},
				minified: {
					options: {
						maxBytes: 9900
					},
					src: ["respimage.min.js"]
				}
			}
		});

		// These plugins provide necessary tasks.
		grunt.loadNpmTasks("grunt-contrib-jshint");
		grunt.loadNpmTasks("grunt-contrib-qunit");
		grunt.loadNpmTasks("grunt-contrib-uglify");
		grunt.loadNpmTasks("grunt-contrib-watch");
		grunt.loadNpmTasks('grunt-bytesize');
		grunt.loadNpmTasks('grunt-max-filesize');

		// Default task.
		grunt.registerTask("default", [ "test", "uglify", "bytesize", "maxFilesize" ]);
		grunt.registerTask("test", [ "jshint", "qunit" ]);
	};
})();
