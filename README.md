[![Build Status](https://travis-ci.org/svetzal/maxim-engine.svg?branch=master)](https://travis-ci.org/svetzal/maxim-engine)
[![Code Quality](https://api.codeclimate.com/v1/badges/ce3c1b2c628677b1c330/maintainability)](https://codeclimate.com/github/svetzal/maxim-engine/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ce3c1b2c628677b1c330/test_coverage)](https://codeclimate.com/github/svetzal/maxim-engine/test_coverage)

# Maxim Engine

Maxim is a simple rule engine, getting better a step at a time.

The engine will recognize when a consequence changes a property in working memory that is referenced by a registered rule. When this happens, it will re-run the rule-set.

It does not (yet) do loop detection so it will re-run the rule-set a defined number of times (default is 10).

The engine lazily evaluates referenced properties in working memory and uses Reflect / Proxy to intercept and record when they change.

## Limitations

- no loop detection / conflict resolution
- no optimization of rule re-runs
- probably more I haven't thought of...

## Roadmap (tentative)

These will change depending on community engagement, and my own needs.

- ability to name rules
- explore smarter algorithms to execute across the ruleset
  - loop detection
  - conflict resolution

## Usage

Initialize yourself an instance of the `MaximEngine`

```js
const { MaximEngine } = require('maxim-engine');
let engine = new MaximEngine();
```

Rules have two components, a `condition` and a `consequence`. Each component needs a lambda that takes an instance of the engine's Working Memory 

A `condition` is a lambda that takes an instance of the engine's Working Memory and returns a boolean value that indicates to the engine that the consequence applies.

eg. `(wm) => typeof(wm.message) !== 'undefined'`

A `consequence` is a lambda that mutates the provided working memory (which is actually a copy of the original working memory in order to avoid side-effects).

eg. `(wm) => wm.message = "Hello, World!"`

So here is an example of a complete rule:

```js
let rule = {
    condition: (wm) => typeof(wm.message) !== 'undefined',
    consequence: (wm) => wm.message = "Hello, World!"
};
```

Once you have a set of rules you can register them with the engine. You can provide a single rule or an array of rules.

```js
engine.register(rule);
```

Once you have loaded your rules into the engine, you can use it as many times as you'd like with different input data.

```js
let result = engine.execute({ message: "Change me!" });
console.log(result.message); // Outputs "Hello, World!"
```

With a more sophisticated ruleset, if you want to ensure a maximum number of working memory generations (in case you have loops) you can do so like this:

```js
let result = engine.execute({ message: "Change me!" }, 100);
// evaluates a maximum of 100 generations of working memory
```

## Prioritizing Rules

Rules can be prioritized with a property called `priority`. Higher integers represent higher priority.

```js
engine.register([
    {
        priority: 100,
        condition: wm => wm.value === 1,
        consequence: wm => wm.value = 100
    },
    {
        priority: 1,
        condition: wm => wm.value === 1,
        consequence: wm => wm.value = 10
    }
]);

let result = engine.execute({value: 1});
// { value: 100 }
```

# Distributed Openly, Built Openly

This project is licensed under the very permissive MIT license and Copyright (c) 2018 Stacey Vetzal.

My goal is that the entirety of this system will be built openly via [the Twitch platform](https://www.twitch.tv). While traditionally a game-streaming platform, Twitch offers a remarkable experience for the streamer, and I hope that the archive of streams will be perhaps useful for educational purposes.

You can watch the entirety of Maxim-Engine's construction via the following [Twitch collection](https://www.twitch.tv/collections/5ftbYtNbXRX9DQ).

I welcome engagement, real time over [Twitch](https://www.twitch.tv/svetzal), or via [Github](https://github.com/svetzal/maxim-engine).