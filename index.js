'use strict';
var exec = require('child_process').exec;
var process = require('process');

var argv = require('yargs')
    .options({
      'l': {
        alias: 'low',
        default: false,
        describe: 'Exit even for low vulnerabilities',
        type: 'boolean'
      },
      'm': {
        alias: 'moderate',
        default: false,
        describe: 'Exit only when moderate or above vulnerabilities',
        type: 'boolean'
      },
      'h': {
        alias: 'high',
        default: false,
        describe: 'Exit only when high or above vulnerabilities',
        type: 'boolean'
      },
      'c': {
        alias: 'crititcal',
        default: true,
        describe: 'Exit only for critical vulnerabilities',
        type: 'boolean'
      }
    })
    .help('help')
    .argv;

const parseMessage = (severityline) => {
  if (severityline.indexOf('Severity:') === -1) {
    return ''; 
  }
  var matches = severityline.match(/^(\D+|)((\d+)\D+[lL]ow|)(\D+|)((\d+)\D+[mM]oderate|)(\D+|)((\d+)\D+[hH]igh|)(\D+|)((\d+)\D+[cC]ritical|)/);
  var lowCount = matches[3];
  var moderateCount = matches[6];
  var highCount = matches[9];
  var criticalCount = matches[12];

  if (argv.critical && criticalCount > 0) {
    return 'CRITICAL';
  }

  if (argv.high && (criticalCount > 0 || highCount > 0)) {
    return 'HIGH';
  }

  if (argv.moderate && (criticalCount > 0 || highCount > 0 || moderateCount > 0)) {
    return 'MODERATE';
  }

  if (argv.low && (criticalCount > 0 || highCount > 0 || moderateCount > 0 || lowCount > 0)) {
    return 'LOW';
  }
}

module.exports = function() {
  exec('npm audit', function (error, stdout, stderr) {
    if (stdout) {
      if (stdout.indexOf('[+] no known vulnerabilities found') >= 0) {
        return console.log('No issues :: SUCCESS');
      }
      
      var logArr = stdout.split('\n').filter(line => line);
      var severityline = logArr[logArr.length - 1];
      var severityType = parseMessage(severityline);
      switch (severityType) {
        case 'CRITICAL':
        case 'HIGH':
        case 'MODERATE':
        case 'LOW':
          console.log(`FAILURE :: ${severityType} :: ${severityline}`);
          process.exit(1);
          return;
        case '':      
        default:
          console.log(severityline);
          return;
      }
    }
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}
