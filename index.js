'use strict';
var exec = require('child_process').exec;
var process = require('process');

module.exports = function() {
  var failOnSevity = "HIGH"
  var cliArgs = process.argv.slice(2);
  if (cliArgs[0] === "--help" || cliArgs[0] === "-h") {
    console.log(
      "      --high : exit only when high severity issues are found\n\
      --moderate : exit when moderate or high severity issues are found\n\
      --low : exit when low, moderate or high severity issues are found\n\
      --help, -h : show this help message"
    );
    return;
  } 
  switch (cliArgs[0]) {
    case '--low':
      failOnSevity = "LOW";
      break
    case '--moderate':
      failOnSevity = "MODERATE";
      break
    case '--high':
    default:
      failOnSevity = "HIGH"
      break;
  }

  exec('npm audit', function (error, stdout, stderr) {
    if (stdout) {
      if (stdout.indexOf('[+] no known vulnerabilities found') >= 0) {
        return console.log('No issues :: SUCCESS');
      }
      
      var logArr = stdout.split('\n').filter(line => line);
      var severityline = logArr[logArr.length - 1];
      if (severityline.indexOf('Severity:') >= -1) {
        var matches = severityline.match(/^\D+(\d+)\D+low\D+(\d+)\D+moderate\D+(\d+)\D+high/);
        var lowCount = matches[1];
        var moderateCount = matches[2];
        var highCount = matches[3];
        switch (failOnSevity) {
          case 'HIGH':
            if (highCount > 0) {
              console.log('FAILURE :: HIGH :: ' + severityline);
              process.exit(1);
              return;
            }
            break;
          case 'MODERATE':
            if (highCount > 0 || moderateCount > 0) {
              console.log('FAILURE :: MODERATE :: ' + severityline);
              process.exit(1);
              return;
            }
            break;
          case 'LOW':
            if (highCount > 0 || moderateCount > 0 || lowCount > 0) {
              console.log('FAILURE :: LOW :: ' + severityline);
              process.exit(1);
              return;
            }
            break;
          default:
            break;
        }
        
      }
      console.log(logArr[logArr.length - 2]);
      return;
    }

    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}
