var $fs, $globleMap, $globleReg, $jh, $rule;

$jh = require("jshint").JSHINT;

$fs = require("fs");

$rule = {
  smarttabs: true,
  undef: true
};

$globleMap = {
  document: true,
  clearInterval: true,
  setInterval: true,
  clearTimeout: true,
  setTimeout: true,
  alert: true,
  window: true,
  location: true,
  "eval": true,
  decodeURIComponent: true,
  encodeURIComponent: true,
  encodeURI: true,
  escape: true,
  unescape: true,
  navigator: true
};

$globleReg = /window|document|setTimeout|setInterval|clearTimeout|clearInterval|location|Math|parseInt|parseFloat|String|eval|Number|alert|decodeURIComponent|encodeURI|encodeURIComponent|escape|unescape|Date|RegExp|Function|Array|navigator/;

exports.globalsIdentifierCheck = function(filename, callback) {
  if (!filename || typeof callback !== "function") {
    throw "param wrong";
  }
  return $fs.readFile(filename, function(err, data) {
    var cList, code, globeArr, globeList, novarArr, output, result, undefList, undefObj;
    output = "";
    if (!err) {
      code = data.toString();
      $jh(code, $rule, $globleMap);
      result = $jh.data();
      if (result) {
        undefList = result.implieds;
        novarArr = [];
        if (undefList) {
          cList = code.split("\n");
          undefObj = {};
          undefList.forEach(function(val, i) {
            var lines, name;
            name = val.name;
            if (!undefObj[name]) {
              lines = val.line;
              return lines.forEach(function(line, i) {
                if ((new RegExp(name + "\\s*=[^=]")).test(cList[line - 1])) {
                  undefObj[name] = 1;
                  return novarArr.push("{\"" + name + "\":[" + lines + "]}");
                }
              });
            }
          });
        }
        globeList = result.globals;
        globeArr = [];
        if (globeList) {
          globeList.forEach(function(name) {
            if (!$globleReg.test(name)) {
              return globeArr.push(name);
            }
          });
        }
        /*
        output = "{";
        if (novarArr.length) {
          output += "\"novar\":[" + novarArr.join(",") + "]";
        }
        if (globeArr.length) {
          if (output.length > 1) {
            output += ",";
          }
          output += "\"globals\":[" + globeArr.join(",") + "]";
        }
        if (output.length > 1) {
          output = "{\"" + filename + "\":" + output + "}}";
        } else {
          output = null;
        }
        */

        output = globeArr
      }
    }
    return callback(err, output);
  });
};
