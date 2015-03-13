module.exports = function(grunt) {

    var rawFile = "build/<%= pkg.name %>.raw.debug.js",
        rawReleaseFile = "build/<%= pkg.name %>.raw.js",
        debugFile = "build/<%= pkg.name %>.debug.js",
        releaseFile = "build/<%= pkg.name %>.js";
    
    var bower = grunt.file.readJSON('bower.json'),
        pkg = grunt.file.readJSON('package.json');
    
    var banner =  '// ' + pkg.name + ' v' + pkg.version + '\n// (c) ' + pkg.author + ' ' + new Date().getFullYear() + '\n// http://www.opensource.org/licenses/mit-license.php\n';
    
    var debugFiles = [], releaseFiles = [];
    for (var i in bower.dependencies) {
        var libDependencies = grunt.file.readJSON('bower_components/' + i + '/bower.json').main;
        if (!libDependencies || !libDependencies.length)
            continue;
        
        if (libDependencies.length === 1) {
            debugFiles.push('bower_components/' + i + "/" + libDependencies[0]);
            releaseFiles.push('bower_components/' + i + "/" + libDependencies[0]);
        } else if (libDependencies.length === 2) {
            
            var debug = [false, false];
            var release = [false, false];
            
            debug[0] = libDependencies[0].indexOf(".debug.") !== -1;
            debug[1] = libDependencies[1].indexOf(".debug.") !== -1;
            
            release[0] = libDependencies[0].indexOf(".min.") !== -1 || libDependencies[0].indexOf(".release.") !== -1;
            release[1] = libDependencies[1].indexOf(".min.") !== -1 || libDependencies[1].indexOf(".release.") !== -1;
            
            if ((debug[0] && debug[1]) || (release[0] && release[1]))
                throw "Cannot understand dependences";
            
            if ((debug[0] && release[0]) || (debug[1] && release[1]))
                throw "Cannot understand dependences";
            
            if (debug[0]) {
                debugFiles.push('bower_components/' + i + "/" + libDependencies[0]);
                releaseFiles.push('bower_components/' + i + "/" + libDependencies[1]);
            } else if (debug[1]) {
                debugFiles.push('bower_components/' + i + "/" + libDependencies[1]);
                releaseFiles.push('bower_components/' + i + "/" + libDependencies[0]);
            } else if (release[0]) {
                releaseFiles.push('bower_components/' + i + "/" + libDependencies[0]);
                debugFiles.push('bower_components/' + i + "/" + libDependencies[1]);
            } else if (release[1]) {
                releaseFiles.push('bower_components/' + i + "/" + libDependencies[1]);
                debugFiles.push('bower_components/' + i + "/" + libDependencies[0]);
            } else 
                throw "Cannot understand dependences";
        } else 
            throw "Cannot understand dependences";
    }
    
    debugFiles.push(rawFile);
    releaseFiles.push(rawReleaseFile);
    
    var releaseOptions = {
        process: function (content, srcPath) {
            return banner + content;
        }
    };
    
    var dependencies = [ 
        'src/utils/obj.js', 
        'src/disposable.js', 
        'src/utils/executeCallbacks.js', 
        'src/observeTypes/observeTypesBase.js', 
        'src/observableBase.js', 
        'src/callbacks/changeCallback.js',
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
                dest: rawFile
            },
            lib: {
                src: releaseFiles,
                dest: releaseFile
            },
            libDebug: {
                src: debugFiles,
                dest: debugFile
            }
        },
        
        uglify: {
            build: {
                src: rawFile,
                dest: rawReleaseFile
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
            releaseDebug: {
                options: releaseOptions,
                src: debugFile, 
                dest: 'release/<%= pkg.name %>-<%= pkg.version %>.debug.js'
            },
            release: {
                options: releaseOptions,
                src: releaseFile, 
                dest: 'release/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        }
    });

    // plugins
    require('load-grunt-tasks')(grunt);

    grunt.registerTask('build', ['concat:build', 'concat:libDebug']);
    grunt.registerTask('rebuild', ['build', 'uglify', 'concat:lib']);
    grunt.registerTask('test', ['rebuild', 'qunit']);
    grunt.registerTask('release', ['test', 'copy:releaseDebug', 'copy:release']);
    
    grunt.registerTask('default', 'build');
};