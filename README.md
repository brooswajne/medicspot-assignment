# Node code challenge

## Part 1: Questions

See [`QUESTIONS.md`](./QUESTIONS.md).

## Part 2: The Server

The server can be started using `node server.js`, or just `npm run start`.

Configuring the server's behaviour is currently done using environment
variables, all of these are defined in [`server/config.js`](./server/config.js).

### Dependencies

These are the dependencies I'm using and the reasoning behind their choice.

- `express`: Simplifies the task of creating a web server slightly - for the
  for the purpose of this assignment (just a single static route) it's probably
  more than is needed (this could all just be done with node's built-in `http`
  and `querystring` modules) but it makes it much easier to add new routing and
  functionality in the future.

- `better-sqlite3`: I've not used SQLite before, but the two packages that came
  up when looking for a library to interact with a SQLite database from node.js
  were this one and [`node-sqlite3`](https://github.com/mapbox/node-sqlite3).  \
  The latter is definitely being developed by a bigger company (mapbox) which
  helps feel confident about its stability, but `better-sqlite3` seems to be
  actively developed with over 100k weekly downloads and makes some convincing
  promises about speed and simplicity - the examples make it look a lot nicer to
  use.  \
  Neither has many sub-dependencies making them pretty self-contained
  dependencies and the choice between the two relatively safe.

- `@brooswajne/terrier`: This is just a super-simple logger which I made for fun
  a while back ([source](https://github.com/brooswajne/terrier)). I just like
  how it looks and how it works, and it's nice to use it somewhere.  \
  It has no dependencies, and since I made it I know exactly how it works and
  can be more confident that it doesn't introduce vulnerabilities in code I
  might not have fully audited.

If there are any questions about the dev-dependencies (used for linting /
type-checking / testing) I'd be happy to discuss those too.

## Part 3: The App

TODO
