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
      src: {
        files: 'src/**/*.js',
        tasks: ['eslint', 'babel', 'concat', 'qunit']
      },
      test: {
        files: 'test/**/*.js',
        tasks: ['eslint', 'qunit']
      },
    },
    babel: {
      options: {
        sourceMap: false,
        presets: ['es2015'],
        //plugins: ['transform-es2015-modules-amd']
      },
      dist: {
        files: {
          'tmp/jquery.<%= pkg.name %>.js': 'src/jquery.<%= pkg.name %>.js'
        }
      }
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

  // Default task.
  grunt.registerTask('default', ['eslint', 'clean', 'babel', 'concat', 'qunit', 'uglify']);

  // Travis CI task.
  grunt.registerTask('travis', ['eslint', 'clean', 'babel', 'concat', 'qunit', 'uglify']);

};
