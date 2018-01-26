[![Travis](https://img.shields.io/travis/mediamonks/seng-event.svg?maxAge=2592000)](https://travis-ci.org/mediamonks/seng-event)
[![Code Climate](https://img.shields.io/codeclimate/github/mediamonks/seng-event.svg?maxAge=2592000)](https://codeclimate.com/github/mediamonks/seng-event)
[![Coveralls](https://img.shields.io/coveralls/mediamonks/seng-event.svg?maxAge=2592000)](https://coveralls.io/github/mediamonks/seng-event?branch=master)
[![npm](https://img.shields.io/npm/v/seng-event.svg?maxAge=2592000)](https://www.npmjs.com/package/seng-event)
[![npm](https://img.shields.io/npm/dm/seng-event.svg?maxAge=2592000)](https://www.npmjs.com/package/seng-event)

# seng-event
Provides Classes and utilities for dispatching and listening to events.

Provides an _EventDispatcher_ base class that adds the ability to dispatch events and attach handlers that 
should be called when such events are triggered. New event classes can be created by extending the _AbstractEvent_
class provided in this module. This module also provides basic event classes _BasicEvent_ and _CommonEvent_ that
are ready to be used with _EventDispatcher_.

_seng-event_ also supports event capturing and bubbling phases, heavily inspired by existing event 
dispatching systems like the functionality described in the 
[DOM Event W3 spec](https://www.w3.org/TR/DOM-Level-2-Events/events.html)


## Installation

```sh
yarn add seng-event
```

```sh
npm i -S seng-event
```

## Basic usage

```ts
import EventDispatcher, {AbstractEvent} from 'seng-event';
import {generateEventTypes, EVENT_TYPE_PLACEHOLDER} from 'seng-event/lib/util/eventTypeUtils';

// extend EventDispatcher
class Foo extends EventDispatcher {
  ...
}

// Create your own event class
class FooEvent extends AbstractEvent {
   ...
   public static COMPLETE:string = EVENT_TYPE_PLACEHOLDER;
   ...
}
generateEventTypes({FooEvent});

// listener for events
const foo = new Foo();
const exampleHandler = (event:FooEvent) => 
{
  console.log('Handler called!', event.type, event.target);
}
foo.addEventListener(FooEvent.COMPLETE, exampleHandler);

// dispatch an event (will execute exampleHandler and log 'Handler called!')
foo.dispatchEvent(new FooEvent(FooEvent.COMPLETE));  
```


## Documentation

View the [generated documentation](http://mediamonks.github.io/seng-event/).


## Building

In order to build seng-event, ensure that you have [Git](http://git-scm.com/downloads)
and [Node.js](http://nodejs.org/) installed.

Clone a copy of the repo:
```sh
git clone https://github.com/mediamonks/seng-event.git
```

Change to the seng-event directory:
```sh
cd seng-event
```

Install dev dependencies:
```sh
yarn
```

Use one of the following main scripts:
```sh
yarn build            # build this project
yarn dev              # run compilers in watch mode, both for babel and typescript
yarn test             # run the unit tests incl coverage
yarn test:dev         # run the unit tests in watch mode
yarn lint             # run eslint and tslint on this project
yarn doc              # generate typedoc documentation
```

When installing this module, it adds a pre-commit hook, that runs lint and prettier commands
before committing, so you can be sure that everything checks out.

## Contribute

View [CONTRIBUTING.md](./CONTRIBUTING.md)


## Changelog

View [CHANGELOG.md](./CHANGELOG.md)


## Authors

View [AUTHORS.md](./AUTHORS.md)


## LICENSE

[MIT](./LICENSE) © MediaMonks


