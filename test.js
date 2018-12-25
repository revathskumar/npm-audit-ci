import test from 'ava';

var ci = require('./');

test('only low', t => {
	t.is(ci.parseMessage({vulnerabilities: {low: 1}}, { low:true }), 'LOW');
});

test('only moderate', t => {
	t.is(ci.parseMessage({vulnerabilities: {moderate: 1}}, { moderate :true }), 'MODERATE');
});

test('only high', t => {
	t.is(ci.parseMessage({vulnerabilities: {high: 1}}, { high: true}), 'HIGH');
});

test('only critical', t => {
	t.is(ci.parseMessage({vulnerabilities: {critical: 1}}, { critical :true }), 'CRITICAL');
});

test('High vrulnerability, but alert only for critical', t => {
	t.is(ci.parseMessage({vulnerabilities: {high: 1}}, { critical :true }), '');
});

test('when object doesnt have vulnerabilities', t => {
	t.is(ci.parseMessage({vulnerabilities: {}}, { critical :true }), '');
});

