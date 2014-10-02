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
					src: [ "respimg.dev.js" ],
					dest: "respimg.js"
				},
				main: {
					src: [ "respimg.js" ],
					dest: "respimg.min.js"
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
				files: [ "tests/**/*.html" ]
			},
			jshint: {
				all: {
					options: {
						jshintrc: true
					},
					src: [ "respimg.dev.js", "plugins/*.js", "tests/*.js", "!Gruntfile.js", "!*.min.js", "!**/*.min.js" ] //, "Gruntfile.js", "tests/*.js"
				}
			},
			watch: {
				gruntfile: {
					files: [ "Gruntfile.js", "respimg.dev.js", "plugins/*.js", "tests/*.js", "!*.min.js", "!**/*.min.js" ],
					tasks: [ "default" ]
				}
			},
			bytesize: {
				all: {
					src: [ "respimg.min.js" ]
				}
			}
		});

		// These plugins provide necessary tasks.
		grunt.loadNpmTasks("grunt-contrib-jshint");
		grunt.loadNpmTasks("grunt-contrib-qunit");
		grunt.loadNpmTasks("grunt-contrib-uglify");
		grunt.loadNpmTasks("grunt-contrib-watch");
		grunt.loadNpmTasks('grunt-bytesize');


		// Default task.
		grunt.registerTask("default", [ "test", "uglify", "bytesize" ]);
		grunt.registerTask("test", [ "jshint", "qunit" ]);
	};
})();
