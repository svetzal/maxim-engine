/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const { MaximEngine } = require('../index');

let engine = new MaximEngine();

engine.register({
    condition: wm => wm.message === 'hello',
    consequence: wm => wm.message = 'goodbye'
});

let wm = engine.execute({ message: 'hello' });

console.log("Run complete");
console.log(`  ${engine.rules.length} rules registered`);
console.log(`  ${engine.lastExecution.time} ms`);
console.log("Result:", wm);
