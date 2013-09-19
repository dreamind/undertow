'use strict';

module.exports = function(grunt) {

  main();

  function main() {

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
      // server side test: plain mocha
      mochaTest: {
        test: {
          options: {
            reporter: 'spec'
          },
          src: ['test/mocha/**/*.js']
        }
      },
      // server side test & coverage: using blanket
      mochacov: {
        'html-cov': {
          options: {
            reporter: 'html-cov',
            require: ['should'],
            output: "target/coverage-mocha.html"
          },
          src: ['test/mocha/**/*.js']
        },
        'lcov': {
          options: {
            reporter: 'mocha-lcov-reporter',
            coverage: 'true',
            require: ['should'],
            output: "target/coverage-mocha.lcov"
          },
          src: ['test/mocha/**/*.js']
        }
      },
      // client side test & coverage: using istanbul & phantomjs
      qunit: {
        files: ['test/qunit/**/*.html'],
        options: {
          '--web-security': 'no',
          coverage: {
            src: ['<%= pkg.name %>.js'],
            instrumentedFiles: '.tmp/',
            htmlReport: 'target/coverage/qunit',
            lcovReport: 'target/coverage/qunit',
            coberturaReport: 'target/coverage/qunit'
          }
        }
      },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-cov');

    grunt.registerTask('test', ['mochaTest', 'qunit']);
    grunt.registerTask('default', ['uglify']);
  }

};