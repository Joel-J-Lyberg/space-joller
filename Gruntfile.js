module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig({
      babel: {
          options: {
              sourceMap: false,
              presets: ['es2015']
          },
          dist: {
              files: [
                  {
                      expand: true,
                      cwd: '.',
                      src: ['app/*.js', 'lib/utils.js', 'lib/userInput.js', 'lib/SpriteSheet.js'],
                      dest: 'dist/'
                  }
              ]
          }
      },
      clean: ['dist'],
      copy: {
        main: {
          files: [
            {
              expand: true, src: [
                'index.html',
                '*.ogg',
                'graphics/*',
                'lib/require.js',
                'lib/underscore.js',
              ], dest: 'dist/', filter: 'isFile'}
          ]
        }
      }
  });

  grunt.registerTask('default', ['clean', 'copy', 'babel']);
};