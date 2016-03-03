'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('slotmachine.jquery.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      dist: {
        src: 'dist'
      },
      tmp: {
        src: 'tmp'
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['tmp/jquery.<%= pkg.name %>.js'],
        dest: 'dist/jquery.<%= pkg.name %>.js'
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/jquery.<%= pkg.name %>.min.js'
      },
    },
    qunit: {
      files: ['test/**/*.html']
    },
    eslint: {
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['src/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['eslint']
      },
      js: {
        files: 'src/**/*.js',
        tasks: ['babel', 'concat']
      },
      css: {
        files: 'src/**/*.css',
        tasks: ['autoprefixer', 'cssmin']
      },
      test: {
        files: 'test/**/*.js',
        tasks: ['eslint', 'qunit']
      },
    },
    babel: {
      options: {
        comments: false,
        sourceMap: false,
        presets: ['es2015']
      },
      dist: {
        files: {
          'tmp/jquery.<%= pkg.name %>.js': 'src/jquery.<%= pkg.name %>.js'
        }
      }
    },
    autoprefixer: {
      options: {
          browsers: ['last 10 versions', 'ie 8', 'ie 9']
      },
      dist: {
        files: {
          'dist/jquery.<%= pkg.name %>.css': 'src/jquery.<%= pkg.name %>.css'
        }
      },
    },
    cssmin: {
      target: {
        files: {
          'dist/jquery.<%= pkg.name %>.min.css': 'dist/jquery.<%= pkg.name %>.css'
        }
      },
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task.
  grunt.registerTask('default', ['eslint', 'clean', 'babel', 'concat', 'autoprefixer', 'cssmin', 'qunit', 'uglify']);

  // Travis CI task.
  grunt.registerTask('travis', ['eslint', 'clean', 'babel', 'concat', 'autoprefixer', 'cssmin', 'qunit', 'uglify']);

};
