# Node code challenge

## Part 1: Questions

See [`QUESTIONS.md`](./QUESTIONS.md).

## Part 2: The Server

The server can be started using `node server.js`, or just `npm run start`.

Configuring the server's behaviour is currently done using environment
variables, all of these are defined in [`server/config.js`](./server/config.js).

### Database

There seem to be some issues with the GB.tsv data which I noticed when importing
it into a SQLite database.
I'm not sure if this was intentional to catch me out, but what I immediately
noticed was that the `modification_date` field had been populated with the
values of the `timezone` field instead (ie. there was an offset by one):

```console
sqlite> SELECT DISTINCT(modification_date) FROM locations;
Asia/Nicosia
Europe/London

Europe/Dublin
Europe/Brussels
Europe/Lisbon
Europe/Moscow
```

Looking at the table schema, we can see the source of this mistake: there
doesn't seem to be a tab separating the `admin3_code` and `admin4_code` column
headers, meaning that they are accidentally combined:

```console
sqlite> .schema locations
CREATE TABLE locations(
  "geonameid" TEXT,
  "name" TEXT,
  "asciiname" TEXT,
  "alternatenames" TEXT,
  "latitude" TEXT,
  "longitude" TEXT,
  "feature_class" TEXT,
  "feature_code" TEXT,
  "country_code" TEXT,
  "cc2" TEXT,
  "admin1_code" TEXT,
  "admin2_code" TEXT,
  "admin3_code admin4_code" TEXT,
  "population" TEXT,
  "elevation" TEXT,
  "dem" TEXT,
  "timezone" TEXT,
  "modification_date" TEXT
);
```

This issue was fixed by running `sed -i.bak '1s/admin3_code
admin4_code/admin3_code\tadmin4_code/' ./data/GB.tsv`.

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

### Tooling

Linting can be run using the `npm run lint` script.

Type-checking is done using TypeScript within JSDoc comments for speed of
development, and can be run using the `npm run check` script.

## Part 3: The App

TODO
