'use strict';
const exec = require('child_process').exec;
const process = require('process');

const argv = require('yargs')
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
        describe: 'Show a textual report',
        type: 'boolean'
      }
    })
    .help('help')
    .argv;

const getSeverityType = (metadata, argv = {}) => {
  const {vulnerabilities} = metadata;
  const {low, moderate, high, critical} = vulnerabilities;
  let severityType = '';
  
  if (argv.critical && critical > 0) {
    severityType = 'CRITICAL';
  }

  if (argv.high && (critical > 0 || high > 0)) {
    severityType = 'HIGH';
  }

  if (argv.moderate && (critical > 0 || high > 0 || moderate > 0)) {
    severityType = 'MODERATE';
  }

  if (argv.low && (critical > 0 || high > 0 || moderate > 0 || low > 0)) {
    severityType = 'LOW';
  }

  return severityType;
};

const getSummary = (metadata) => {
  const {vulnerabilities, totalDependencies} = metadata;
  const totalVulnerabilities = Object.values(vulnerabilities).reduce((total, level) => total + level, 0);
  const summary = Object.keys(vulnerabilities).map(level => ({level, count: vulnerabilities[level]}))
    .filter((levelCount) => levelCount.count > 0)
    .map(levelCount => `${levelCount.count} ${levelCount.level}`)
    .join(', ');
  const severityline = `found ${totalVulnerabilities} vulnerabilities (${summary}) in ${totalDependencies} scanned packages`;
  
  return severityline;
};

const run = () =>{
  exec('npm audit --json', function (error, stdout, stderr) {
    if (stdout) {
     
      if (argv.report) {
        console.log(stdout);
      }
      
      const {metadata} = JSON.parse(stdout);
      const severityType = getSeverityType(metadata, argv);
      const severityline = getSummary(metadata);
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
  parseMessage: getSeverityType
};
