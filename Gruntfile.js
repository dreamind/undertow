'use strict';

module.exports = function(grunt) {

  main();

  function main () {

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'), // <%= pkg.name %> is available
      uglify: {
        options: {
          preserveComments: false
        },
        files: {
          src: ['<%= pkg.name %>.js'],
          dest: 'target/<%= pkg.name %>.min.js',
        }
      },
      jshint: {
        src: ['<%= pkg.name %>.js'],
        options: {
          jshintrc: '.jshintrc',
          reporterOutput: 'target/jshint-report.txt'
        },
      },
      mochaTest: {
        test: {
          options: {
            reporter: 'spec'
          },
          src: ['test/mocha/**/*.js']
        }
      },
      qunit: {
        files: ['test/qunit/**/*.html']
      },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('test', ['mochaTest', 'qunit']);
    grunt.registerTask('default', ['uglify']);

  }

};