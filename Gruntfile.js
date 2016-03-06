var path = require("path");
var glob = require("glob");

var ExtractTextPlugin = require("extract-text-webpack-plugin");

var extractStyle = new ExtractTextPlugin("[name].styles.css");
var extractLESS  = new ExtractTextPlugin("[name].less.css");
var extractCSS   = new ExtractTextPlugin("[name].sheets.css");

var entries = []
    .concat(glob.sync(__dirname+"/MODULES/**/*.js"))
    .concat(glob.sync(__dirname+"/MODULES/**/*.html"))
    .concat(glob.sync(__dirname+"/MODULES/**/*.css"))
    .concat(glob.sync(__dirname+"/MODULES/**/*.less"))
    .concat(glob.sync(__dirname+"/index.js"));

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        webpack: {
            build: {
                entry: entries,
                output: {
                    path: path.join(__dirname, "dist"),
                    publicPath: __dirname,
                    filename: '[name].build.js'
                },
                
                module: {
                    loaders: [

                        /* estrae solamente il contenuto del blocco <style rel="stylesheet/less"> da MODULES/*.html */
                        { test: /\.html$/, loader: extractStyle.extract("raw", "css?-url&-import!style-block?filter=less") },
                    ]
                },
                
                plugins: [extractStyle,extractCSS, extractLESS]
            }
        },

        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    "dist/main.styles.css": "dist/main.styles.css" // destination file and source file
                }
            }
        },

        favicons: {
            options: {
                html: 'index.html',
                HTMLPrefix: "assets/favicons/"
            },
            icons: {
                src:    'assets/favicons/baseIcon.png',
                dest:   'assets/favicons'
            }
        },


        watch: {
            styles: {
                files: ['MODULES/**/*.html'], // which files to watch
                tasks: ['webpack'],
                options: {
                    nospawn: true
                }
            }
        },

        folder_list: {
            default_options : {
                options : {
                    files:  true,
                    folder: true
                },
                files : [
                    {
                        src  : ['js/'],
                        dest : 'tmp/fixtures.json',
                        cwd  : 'test/fixtures'
                    }
                ]
            }
        },


        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['MODULES/*.html'],
                dest: 'css/destination.html'
            }
        },

        'string-replace': {
            dist: {
                files: {
                    'css/destination-2.css': 'css/destination.css'
                },
                options: {
                    replacements: [{
                        pattern: 'hello',
                        replacement: 'howdy'
                    }]
                }
            }
        },




        /*
        dom_munger: {
            your_target: {
                options: {
                    read: {selector:'script',attribute:'src',writeto:'myJsRefs',isPath:true}
                },
                src: 'MODULES/*.html'
            },
        },
        uglify: {
            dist: {
                src:['<%= dom_munger.data.myJsRefs %>'],
                dest: 'dist/app.min.js'
            }
        }
        */





    });


    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-favicons');
    //grunt.loadNpmTasks('grunt-dom-munger');
    //grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //grunt.loadNpmTasks('grunt-folder-list');

    grunt.registerTask('default', ['webpack','less']);


/*
    grunt.registerTask('default', 'My "default" task description.', function() {
        var file = grunt.file.read("MODULES/footer.html");

        grunt.log.writeln(file);
    });
*/

};