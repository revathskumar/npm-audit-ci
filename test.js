import test from 'ava';

var ci = require('./');

test('only low', t => {
	t.is(ci.parseMessage('    Severity: 1 Low', { low:true }), 'LOW');
});

test('only moderate', t => {
	t.is(ci.parseMessage('    Severity: 1 Moderate', { moderate :true }), 'MODERATE');
});

test('only high', t => {
	t.is(ci.parseMessage('    Severity: 1 High', { high :true }), 'HIGH');
});

test('only critical', t => {
	t.is(ci.parseMessage('    Severity: 1 High | 1 Critical', { critical :true }), 'CRITICAL');
});

test('High vrulnerability, but alert only for critical', t => {
	t.is(ci.parseMessage('    Severity: 1 High', { critical :true }), '');
});

test('when line doesnt have Severity', t => {
	t.is(ci.parseMessage('    1 High', { critical :true }), '');
});

