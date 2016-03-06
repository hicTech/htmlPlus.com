
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),



        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    "css/cssPlus-v.1.0.0.css": "css/less.less" // destination file and source file
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
                files: ['css/**/*.less'], // which files to watch
                tasks: ['less'],
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






    });


    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-favicons');
    grunt.loadNpmTasks('grunt-dom-munger');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');



    //grunt.loadNpmTasks('grunt-folder-list');


    grunt.registerTask('default', ['dom_munger','uglify']);



/*
    grunt.registerTask('default', 'My "default" task description.', function() {
        var file = grunt.file.read("MODULES/footer.html");

        grunt.log.writeln(file);
    });
*/

};