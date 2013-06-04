var fs = require('fs')
var syspath = require('path')
var baselib = syspath.join( module.parent.filename , '../' )
var utils = require( syspath.join( baselib , 'util'  ) )
var check_global = require('./check_global_acorn.js')

exports.usage = "检查项目内容";

exports.set_options = function( optimist ){

    optimist.alias('m','modify')
    optimist.describe('m','修改发现的全局变量')

    optimist.alias('g','global')
    return optimist.describe('g','检查当前目录下所有 .js 文件的全局变量')

}


exports.run = function( options ){

    if( options.global ) {

        utils.logger.log('全局变量检查')

        utils.path.each_directory( process.cwd() , function( path ){
            if( syspath.extname(path) !== '.js' ) return;

            check_global.globalsIdentifierCheck( path , function( err , output , details ){

                if( err ) {
                    console.info( err ) 
                    console.info('')
                    return;
                }

                if( !output || !output.length ) return

                console.info( path );
                console.info( "=============================" );

                console.info( output.join('\n') )

                console.info("")
                console.info("")
            })

            if( options.modify ) {
                var code = check_global.globalsIdentifierModify( path )
                fs.writeFileSync( path , code );
            }

        } , true );



    }

    utils.logger.log('done.')

}
