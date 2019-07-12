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
      },
      'registry': {        
        describe: 'Use the specified registry for npm audit. If you have configured npm to point to a different default registry, such as your internal private module repository, npm audit will default to that registry when scanning. Pass a different registry url in order to override this setting.',
        type: 'string'
      }
    })
    .help('help')
    .argv;

const getSeverityType = (metadata = {}, argv = {}) => {
  const {vulnerabilities = {}} = metadata;
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

const getSummary = (metadata = {}) => {
  const {vulnerabilities = {}, totalDependencies = 0} = metadata;
  const totalVulnerabilities = Object.values(vulnerabilities).reduce((total, level) => total + level, 0);
  const summary = Object.keys(vulnerabilities).map(level => ({level, count: vulnerabilities[level]}))
    .filter((levelCount) => levelCount.count > 0)
    .map(levelCount => `${levelCount.count} ${levelCount.level}`)
    .join(', ');
  const severityline = `found ${totalVulnerabilities} vulnerabilities (${summary}) in ${totalDependencies} scanned packages`;
  
  return severityline;
};

const run = () =>{
  let auditCommand = 'npm audit --json';
  if(argv.registry)
  {
    auditCommand += ` --registry ${argv.registry}`;
  }

  const execOptions = { maxBuffer: 10 * 1024 * 1024 };

  exec(auditCommand, execOptions, function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
      return;
    }

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
  });
};

module.exports = {
  run: run,
  parseMessage: getSeverityType
};
