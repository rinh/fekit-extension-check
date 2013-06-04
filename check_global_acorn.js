var fs = require('fs');
var acorn = require('acorn');

function parseGlobal( ast ) {

    var body = ast.body;

    var result = [];

    var resultDetail = [];
    if(!body || !body.forEach ){
        console.info('请检查你的代码，错误可能发生在：第' , ast.start , '个字符附近, 参考ast:' , ast )
        console.info('')
        throw 'ERROR';
    }

    body.forEach(function(i){

        switch( i.type ) {
            case 'VariableDeclaration':
                    var d = i.declarations[0].id;
                    result.push( d.name );
                    resultDetail.push({ type : 'var' , name : d.name , start : d.start , end : d.end })
                break;
            case 'FunctionDeclaration':
                    var d = i.id;
                    result.push( d.name );
                    resultDetail.push({ type : 'function' , name : d.name , start : d.start , end : d.end })
                break;
            case 'IfStatement':
                    if( i.consequent ) {
                        var r = parseGlobal( i.consequent );
                        result = result.concat( r[0] )
                        resultDetail = resultDetail.concat( r[1] )
                    }

                    if( i.alternate ){
                        if( i.alternate.type == 'IfStatement' ) {
                            var r = parseGlobal( { body : [ i.alternate ] } );
                        } else {
                            var r = parseGlobal( i.alternate )
                        }
                        result = result.concat( r[0] )
                        resultDetail = resultDetail.concat( r[1] )
                    }

                break;
        }

    });

    return [ result , resultDetail ]

}

function checkRegSymbol(str) {
    return str.replace( '$' , '\\$' );
}

/*
    1. 找到指定位置的文字进行修改
    2. 判断toplevel的if中的内容
*/
function modify( code , item ) {

    switch( item.type ) {
        case 'var':
                var s = preindexOf( code , item.start , item.end , 'var' );
                if( !!~s ) code = replace( code , s , item.end - 1 , 'window.' + item.name );
            break;
        case 'function':
                var s = preindexOf( code , item.start , item.end , 'function' );
                if( !!~s ) code = replace( code , s , item.end - 1 , 'window.' + item.name + ' = function' );
            break;
    }

    return code;

}

function replace( str , start , end , replaceStr ) {
    return str.slice( 0 , start ) + replaceStr + str.slice( end + 1 );
}

function preindexOf( str , start , end , findStr ) {
    var s = start;
    while( s >= 0 && str.slice( s , end ).indexOf( findStr ) !== 0 ) {
        s--;
    }
    return s;
}


exports.globalsIdentifierModify = function( path ) {

    var code = fs.readFileSync( path ).toString() , 
        r = null;

    try {
        while( ( r = parseGlobal( acorn.parse(code) )[1] ).length ) {
            code = modify( code , r[0] )
        }
    } catch( err ){
        console.info( code )
        console.info( err )
    }

    return code;
}

exports.globalsIdentifierCheck = function( path , cb ) {

    var code = fs.readFileSync( path ).toString();

    var ast = acorn.parse( code );

    try {
        var r = parseGlobal( ast );
    } catch( err ) {
        cb( '[ERROR]' + err + '\n[ERROR]以上发生错误出现在：' + path  + '\n[ERROR]最好是按照标准javascript语法写代码，比如if必须补全大括号什么的。' )
        return;
    }

    cb( null , r[0] , r[1] )

}