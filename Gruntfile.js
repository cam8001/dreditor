/*global module:false*/
/*global __dirname:false*/
module.exports = function(grunt) {
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/**\n' +
      ' * <%= pkg.title || pkg.name %> <%= pkg.version %>\n' +
      '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
      ' * <%= pkg.description %>\n' +
      ' * Licensed under <%= _.pluck(pkg.licenses, "type").join(", ") %>\n *\n' +
      ' * Maintainers:' +
      '<% _.forEach(pkg.maintainers, function(maintainer) {%>\n *   <%= maintainer.name %> - <%= maintainer.url %><% }); %>\n *\n' +
      ' * Last build: <%= grunt.template.today("yyyy-mm-dd h:MM:ss TT Z") %>\n' +
      ' */\n',
    // Task configuration.
    clean: {
      files: ['build', 'release']
    },
    less: {
      options: {
        cleancss: true
      },
      files: {
        src: 'src/less/**/*.less',
        dest: 'build/<%= pkg.name %>.css'
      }
    },
    css2js: {
      convert: {
        src: 'build/<%= pkg.name %>.css',
        dest: 'build/<%= pkg.name %>.css.js'
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>' + grunt.file.read('src/js/_banner.header.js'),
        footer: grunt.file.read('src/js/_banner.footer.js'),
        stripBanners: true
      },
      build: {
        src: ['src/js/**/*.js', '!src/js/_banner.header.js', '!src/js/_banner.footer.js', '!src/js/init.js', 'build/<%= pkg.name %>.css.js', 'src/js/init.js'],
        dest: 'build/<%= pkg.name %>.js'
      }
    },
    jshint: {
      package: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'package.json'
      },
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      js: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['src/js/**/*.js']
      }
    },
    sed: {
      name: {
        path: 'build/',
        pattern: '%PKG.NAME%',
        replacement: '<%= pkg.name %>',
        recursive: true
      },
      title: {
        path: 'build/',
        pattern: '%PKG.TITLE%',
        replacement: '<%= pkg.title || pkg.name %>',
        recursive: true
      },
      description: {
        path: 'build/',
        pattern: '%PKG.DESCRIPTION%',
        replacement: '<%= pkg.description %>',
        recursive: true
      },
      homepage: {
        path: 'build/',
        pattern: '%PKG.HOMEPAGE%',
        replacement: '<%= pkg.homepage || "" %>',
        recursive: true
      },
      author: {
        path: 'build/',
        pattern: '%PKG.AUTHOR%',
        replacement: '<%= pkg.author.name %>',
        recursive: true
      },
      icon: {
        path: 'build/',
        pattern: '%PKG.ICON%',
        replacement: '<%= pkg.icon || "icon.png" %>',
        recursive: true
      },
      license: {
        path: 'build/',
        pattern: '%PKG.LICENSE%',
        replacement: '<%= _.pluck(pkg.licenses, "type").join(", ") %>',
        recursive: true
      },
      version: {
        path: 'build/',
        pattern: '%PKG.VERSION%',
        replacement: '<%= pkg.version %>',
        recursive: true
      }
    },
    copy:{
      chrome: {
        files: [
          {
            expand: true,
            cwd: 'templates/chrome/',
            src: ['**'],
            dest: 'build/chrome/'
          },
          {
            expand: true,
            cwd: 'src/',
            src: ['icon.png'],
            dest: 'build/chrome/'
          },
          {
            expand: true,
            cwd: 'build/',
            src: ['<%= pkg.name %>.js'],
            dest: 'build/chrome/'
          }
        ]
      },
      firefox: {
        files: [
          {
            expand: true,
            cwd: 'templates/firefox/',
            src: ['**'],
            dest: 'build/firefox/'
          },
          {
            expand: true,
            cwd: 'src/',
            src: ['icon.png'],
            dest: 'build/firefox/'
          },
          {
            expand: true,
            cwd: 'build/',
            src: ['<%= pkg.name %>.js'],
            dest: 'build/firefox/data/'
          }
        ]
      },
      safari: {
        files: [
          {
            expand: true,
            cwd: 'templates/safari/',
            src: ['Info.plist', 'Settings.plist'],
            dest: 'build/<%= pkg.name %>.safariextension/'
          },
          {
            expand: true,
            cwd: 'templates/safari/',
            src: ['update.plist'],
            dest: 'build/'
          },
          {
            expand: true,
            cwd: 'src/',
            src: ['icon.png'],
            dest: 'build/<%= pkg.name %>.safariextension/'
          },
          {
            expand: true,
            cwd: 'build/',
            src: ['<%= pkg.name %>.js'],
            dest: 'build/<%= pkg.name %>.safariextension/'
          }
        ]
      }
    },
    watch: {
      default: {
        files: [
          '<%= jshint.package.src %>',
          '<%= jshint.gruntfile.src %>',
          '<%= jshint.js.src %>',
          'src/less/**/*.less',
          '<%= qunit.all %>'
        ],
        tasks: ['default']
      },
      ext: {
        files: [
          '<%= jshint.package.src %>',
          '<%= jshint.gruntfile.src %>',
          '<%= jshint.js.src %>',
          'src/less/**/*.less'
        ],
        tasks: ['ext']
      },
      dev: {
        files: [
          '<%= jshint.package.src %>',
          '<%= jshint.gruntfile.src %>',
          '<%= jshint.js.src %>',
          'src/less/**/*.less'
        ],
        tasks: ['dev']
      }
    },
    release: {
      options: {
        add: false,
        commit: false,
        tag: false,
        push: false,
        pushTags: false,
        npm: false
      }
    },
    compress: {
      chrome: {
        options: {
          archive: 'release/chrome-<%= pkg.version %>.zip',
          mode: 'zip'
        },
        expand: true,
        cwd: 'build/chrome/',
        src: ['**/*'],
        dest: '/'
      }
    },
    "mozilla-addon-sdk": {
      'master': {
        options: {
          revision: "master",
          github: true
        }
      }
    },
    "mozilla-cfx-xpi": {
      'release': {
        options: {
          "mozilla-addon-sdk": "master",
          extension_dir: "build/firefox",
          dist_dir: "release",
          arguments: "--output-file=<%= pkg.name %>-<%= pkg.version %>.xpi"
        }
      }
    },
    'qunit' : {
      all: "tests/**/*.html"
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-css2js');
  grunt.loadNpmTasks('grunt-mozilla-addon-sdk');
  grunt.loadNpmTasks('grunt-sed');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-release');

  // Default tasks.
  grunt.registerTask('default', ['clean', 'less', 'css2js', 'jshint', 'concat', 'copy', 'sed']);

  // Test tasks.
  grunt.registerTask('test', ['qunit']);
  grunt.registerTask('travis-ci', ['default', 'test']);

  // Autoload Firefox extension.
  // @see https://addons.mozilla.org/en-US/firefox/addon/autoinstaller/
  grunt.registerTask('autoload:ff', "Autoload new XPI extension in Firefox", function() {
    var done = this.async();
    grunt.util.spawn({
      cmd: 'wget',
      args: [
        '--post-file=release/' + grunt.template.process('<%= pkg.name %>-<%= pkg.version %>.xpi'),
        'http://localhost:8888'
      ],
      opts: grunt.option('debug') ? {stdio: 'inherit'} : {}
    }, function (error, result, code) {
      if(code !== 8) {
        return grunt.warn('Auto-loading Firefox extension failed: (' + code + ') ' + error);
      }
      grunt.log.ok('Auto-loaded "' + grunt.template.process('<%= pkg.name %>-<%= pkg.version %>.xpi') + '" into Firefox...');
      done();
    });
  });

  // Build tasks.
  grunt.registerTask('build:chrome', ['compress:chrome']);
  grunt.registerTask('build:firefox', ['mozilla-cfx-xpi', 'autoload:ff']);
  grunt.registerTask('build:safari', 'Builds the safari extension', function () {
    grunt.util.spawn({
      cmd:'build-safari-ext',
      args:[grunt.template.process('<%= pkg.name %>-<%= pkg.version %>'), grunt.template.process(__dirname + '/build/<%= pkg.name %>.safariextension'), __dirname + '/release'],
      fallback:-255
    }, function (error, result, code) {
      if (0 !== code) {
        grunt.log.errorlns(result.stdout);
        grunt.log.errorlns(result.stderr);
      }
    });
  });

  // Development tasks.
  grunt.registerTask('dev',   ['default', 'build:firefox']);
  grunt.registerTask('build', ['default', 'compress:chrome', 'build:firefox', 'build:safari']);
  grunt.registerTask('gm',    ['clean', 'less', 'css2js', 'jshint:js', 'concat', 'copy', 'sed']);

};
