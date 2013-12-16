'use strict';

module.exports = function(grunt) {

  var fs = require('fs');

  main();

  function main() {

    var sshOpt = {
      host: 'apps.aurin.org.au',
      username: 'dev',
      privateKey: fs.readFileSync(process.env.HOME + '/.ssh/id_rsa').toString(),
      passphrase: fs.readFileSync(process.env.HOME + '/.ssh/passphrase.txt').toString()
    };

    // some defaults
    var config = {
      jsSrc         : 'src/'
    , jsDist        : 'target/dist/<%= pkg.version %>'
    , jsDevTarget   : 'target/dist/<%= pkg.version %>/dev/'
    , jsProdTarget  : 'target/dist/<%= pkg.version %>/min/'
    , jsFileMask    : '**/*.js'
    , deployArchive : '<%= pkg.name %>-<%= pkg.version %>.tgz'
    };

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'), // <%= pkg.name %> is available
      copy: {
        files: {
          cwd: config.jsSrc,
          src: [config.jsFileMask],
          dest: config.jsDevTarget, // destination folder
          expand: true // allow dynamic building
        }
      },
      uglify: {
        options: {
          preserveComments: false
        },
        files: {
          cwd: config.jsSrc,
          src: [config.jsFileMask],
          dest: config.jsProdTarget,
          expand: true // allow dynamic building
        }
      },
      jshint: {
        cwd: config.jsSrc,
        src: [config.jsFileMask],
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
            src: [config.jsSrc + config.jsFileMask],
            instrumentedFiles: '.tmp/',
            htmlReport: 'target/coverage/qunit',
            lcovReport: 'target/coverage/qunit',
            coberturaReport: 'target/coverage/qunit'
          }
        }
      },
      compress: {
        main: {
          options: {
            archive: 'target/' + config.deployArchive,
            mode: 'tgz'
          },
          files: [{
            expand: true,
            cwd: config.jsDist,
            src: [config.jsFileMask]
          }]
        }
      },
      // scp target/undertow-0.x.x.tgz dev@apps.aurin.org.au:/home/dev
      scp: {
        options: sshOpt,
        main: {
            files: [{
              cwd: 'target', // must be set
              src:  config.deployArchive,
              dest: '/home/dev'
            }]
        },
      },
      // ssh -t dev@apps.aurin.org.au sudo tar xvf /home/dev/undertow-0.x.x.tgz -C /var/www/html/apps.aurin.org.au/assets/js/undertow
      sshexec: {
        test: {
          command: 'sudo tar xvf /home/dev/' + config.deployArchive + '-C /var/www/html/apps.aurin.org.au/assets/js/undertow',
          options: sshOpt
        }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-cov');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-scp');
    grunt.loadNpmTasks('grunt-ssh');

    grunt.registerTask('package', ['copy', 'uglify']);
    grunt.registerTask('test', ['mochaTest', 'qunit']);
    grunt.registerTask('default', ['uglify']);
  }

};