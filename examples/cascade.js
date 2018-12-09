/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const util = require('util');
const { MaximEngine } = require('../index');

let engine = new MaximEngine();

engine.register({
    priority: 10,
    description: 'Default message, if none provided, is hello.',
    // condition: wm => typeof (wm.message) === 'undefined',
    condition: wm => !('message' in wm),
    consequence: wm => wm.message = 'hello'
});

engine.register({
    description: 'When the message is hello, change it to goodbye.',
    condition: wm => wm.message === 'hello',
    consequence: wm => wm.message = 'goodbye'
});

let wm = engine.execute({});

console.log("Run complete");
console.log(`  ${engine.rules.length} rules registered`);
console.log(`  ${engine.lastExecution.time} ms`);
console.log("Result:", wm);
console.log("Instrumentation:", util.inspect(engine.lastExecution, false, null, true));
