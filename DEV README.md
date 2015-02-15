# to set up a dev environment
1. Install node.js
2. Install grunt and the grunt cli: "http://gruntjs.com/"
2. Install bower: "http://bower.io/"
2. Install grunt plugins:
    Navigate to project directory
    Use command "npm install"

# to build
Run the "grunt" command (no args)

# to monitor and build/test
Run the "grunt watch" command

# to change bower dependencies or dependency versions
alter dependencies in bower.json and run: "bower install"

# to do a release
1.  Alter the version number in package.json and bower.json
2.  Alter the file name of the releases in bower.json -> main
3.  Use "grunt release"