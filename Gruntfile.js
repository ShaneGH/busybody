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
    
    // Project configuration.
    grunt.initConfig({
        pkg: pkg,
        
        concat: {
            options: {
                separator: '\n\n'
            },
            build: {
                src: ['tools/begin.js', 'src/**/*.js', 'tools/end.js'],
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
            files: ['<%= concat.dist.src %>'],
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

    // Default task(s).
    grunt.registerTask('default', ['bower', 'concat:build', 'uglify', 'concat:lib', 'concat:libDebug'/*, 'qunit'*/]);
    grunt.registerTask('release', ['default', 'copy:release', 'copy:releaseMin']);
};