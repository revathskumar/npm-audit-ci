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
        alias: 'critical',
        default: true,
        describe: 'Exit only for critical vulnerabilities',
        type: 'boolean'
      },
      'r': {
        alias: 'report',
        default: false,
        describe: 'Show npm audit report',
        type: 'boolean'
      }
    })
    .help('help')
    .argv;

const parseJson = (json, argv = {}) => {
  const {moderate, high, critical} = json.metadata.vulnerabilities;

  if (argv.critical && critical > 0) {
    return 'CRITICAL';
  }

  if (argv.high && (critical > 0 || high > 0)) {
    return 'HIGH';
  }

  if (argv.moderate && (critical > 0 || high > 0 || moderate > 0)) {
    return 'MODERATE';
  }

  if (argv.low && (critical > 0 || high > 0 || moderate > 0 || low > 0)) {
    return 'LOW';
  }

  return '';
};

const run = () =>{
  exec('npm audit --json', {cwd: '../warm-welkom'}, function (error, stdout, stderr) {
    if (stdout) {
      if (stdout.indexOf('[+] no known vulnerabilities found') >= 0) {
        return console.log('No issues :: SUCCESS');
      }
      
      if (argv.report) {
        console.log(stdout);
      }
      
      var severityType = parseJson(stdout, argv);
      switch (severityType) {
        case 'CRITICAL':
        case 'HIGH':
        case 'MODERATE':
        case 'LOW':
          let message = `FAILURE :: ${severityType}`;

          if (!argv.report) {
            message = `${message} :: ${severityline}`;
          }

          console.log(message);
          process.exit(1);
          return;
        case '':      
        default:
          if (!argv.report) {
            console.log(severityline);
          }

          return;
      }
    }
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
};

module.exports = {
  run: run,
  parseMessage: parseJson
};
