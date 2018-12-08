/*
 * Copyright (c) 2018 Stacey Vetzal
 */

const { MaximEngine } = require('../index');

let engine = new MaximEngine();

engine.register({
    condition: wm => wm.message === 'hello',
    consequence: wm => wm.message = 'goodbye'
});

engine.register({
    condition: wm => wm.message === 'goodbye',
    consequence: wm => wm.message = 'au revoir'
});

let wm = engine.execute({ message: 'hello' });

console.log("Run complete");
console.log(`  ${engine.rules.length} rules executed`);
console.log(`  ${engine.lastExecution.time} ms`);
console.log("Result:", wm);