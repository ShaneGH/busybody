module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json'),
        debugFile =  'build/<%= pkg.name %>.debug.js',
        minFile = 'build/<%= pkg.name %>.js',
        banner =  '// ' + pkg.name + ' v' + pkg.version + '\n// (c) ' + pkg.author + ' ' + new Date().getFullYear() + '\n// http://www.opensource.org/licenses/mit-license.php\n';
    
    var releaseOptions = {
        process: function (content, srcPath) {
            return banner + content;
        }
    };
    
    var dependencies = [ 
        'src/utils/obj.js', 
        'src/disposable.js', 
        'src/observableBase.js', 
        'src/callbacks/changeCallback.js',
        'src/callbacks/arrayCallbackBase.js',
        'src/arrayBase.js'];
    
    var src = [
        'tools/begin.js', 
        'src/**/*.js', 
        'tools/end.js'];
    
    src.splice(1, 0, dependencies);
    
    // Project configuration.
    grunt.initConfig({
        pkg: pkg,
        
        concat: {
            options: {
                separator: '\n\n'
            },
            build: {
                src: src,
                dest: debugFile
            },
            lib: {
                src: ["build/release/objjs-<%= pkg.libDependencies.objjs %>.js", minFile],
                dest: minFile
            },
            libDebug: {
                src: ["build/release/objjs-<%= pkg.libDependencies.objjs %>.debug.js", debugFile],
                dest: debugFile
            }
        },
        
        uglify: {
            build: {
                src: debugFile,
                dest: minFile
            }
        },
        
        qunit: {
            files: ['test/**/*.html']
        },
        
        watch: {
            files: src,
            tasks: ['default']
        },
        
        copy: {
            release: {
                options: releaseOptions,
                src: debugFile, 
                dest: 'release/<%= pkg.name %>-<%= pkg.version %>.debug.js'
            },
            releaseMin: {
                options: releaseOptions,
                src: minFile, 
                dest: 'release/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        
        bower: {
            dev: {
                dest: "build/"
            }
        }
    });

    // plugins
    require('load-grunt-tasks')(grunt);

    grunt.registerTask('build', ['concat:build', 'concat:libDebug']);
    grunt.registerTask('rebuild', ['bower', 'build', 'uglify', 'concat:lib']);
    grunt.registerTask('test', ['rebuild', 'qunit']);
    grunt.registerTask('release', ['test', 'copy:release', 'copy:releaseMin']);
    
    grunt.registerTask('default', 'build');
};