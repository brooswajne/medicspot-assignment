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
  ...
  "admin2_code" TEXT,
  "admin3_code admin4_code" TEXT,
  "population" TEXT,
  ...
);
```

This issue was fixed by running `sed -i.bak '1s/admin3_code
admin4_code/admin3_code\tadmin4_code/' ./data/GB.tsv`.

There were still some issues flagged by `sqlite3` when importing the data:

```console
sqlite> .import ./data/GB.tsv locations
./data/GB.tsv:1812: unescaped " character
./data/GB.tsv:1821: unescaped " character
./data/GB.tsv:1870: unescaped " character
./data/GB.tsv:1919: unescaped " character
./data/GB.tsv:1952: unescaped " character
./data/GB.tsv:2011: unescaped " character
./data/GB.tsv:3442: unescaped " character
./data/GB.tsv:5355: unescaped " character
./data/GB.tsv:6998: unescaped " character
./data/GB.tsv:7731: unescaped " character
./data/GB.tsv:12556: unescaped " character
./data/GB.tsv:19008: unescaped " character
./data/GB.tsv:20756: unescaped " character
./data/GB.tsv:25812: unescaped " character
./data/GB.tsv:1811: expected 19 columns but found 21 - extras ignored
```

From looking at these lines, all of them except for 25812 seemed to be due to
some form of encoding issue having caused a character (I think probably some
form of `??` going by the location names) in the `alertnatenames` field to turn
into `"`:

```console
$ nl ./data/GB.tsv \
$   | sed -n '1p; 1811,1812p; 1821p; 1870p; 1919p; 1952p; 2011p; 3442p; 5355p; 6998p; 7731p; 12556p; 19008p; 20756p; 25812p;'
$   | awk -F'\t' '{ print "["$1" ] "$4": "$5 }'
[     1 ] asciiname: alternatenames
[  1811 ] Uxbridge: "ksbridzh,aksabrija,wu ke si qiao,????????????????,???????????????????????????,????????????
[  1812 ] Uttoxeter: "ksutur,??????????????
[  1821 ] Usk: "sk,Ask,Brynbuga,Usk,??????,??????
[  1870 ] Uppingham: "pingam,??????????????
[  1919 ] Upminster: "pminstur,??????????????????
[  1955 ] Ulverston: "lvurstun,Ulverston,Ulverstone,??????????????????
[  2014 ] Uckfield: "kfijld,??????????????
...
[ 25817 ] Ringmer "The Motte":
```

(25817 seems to be a location name with actual quotes in it).

It'd be worth figuring out what the mis-encoded character is meant to be, but
for the time being I just fixed the issue by properly escaping all quote
characters using `sed -E -i.bak 's/"/""/g; s/[^ ]+/"&"/g' ./data/GB.tsv`.

The data could then be imported with no issues.

Note that the types of some of the fields should really be updated to be more
accurate (eg. `latitude`/`longitude` should be numeric), but since that is
irrelevant to this assignment I didn't spend extra time on it:

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
  "admin3_code" TEXT,
  "admin4_code" TEXT,
  "population" TEXT,
  "elevation" TEXT,
  "dem" TEXT,
  "timezone" TEXT,
  "modification_date" TEXT
);
```

### Dependencies

These are the dependencies I'm using and the reasoning behind their choice.

- `express`: Simplifies the task of creating a web server slightly - for the
  for the purpose of this assignment (just a single static route) it's probably
  more than is needed (this could all just be done with node's built-in `http`
  and `querystring` modules) but it makes it much easier to add new routing and
  functionality in the future.

- `sqlite3`: I've not used SQLite before, but the two packages that came up 
  when looking for a library to interact with a SQLite database from node.js
  were this one and
  [`better-sqlite3`](https://github.com/JoshuaWise/better-sqlite3).  \
  Neither has many sub-dependencies making them pretty self-contained
  dependencies and the choice between the two relatively safe.  \
  The major advantage which this package has which resulted in me picking it
  over `better-sqlite3` is that its queries are run asynchronously, which is an
  important feature for a web server to avoid blocking the main thread and
  stalling all incoming requests.

- `sql-template-strings`: An very small package with no sub-dependencies which
  just serves to make creating safe SQL queries simpler (and safer).

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

Unit tests can be run using `npm run test:unit`, and API tests can be run using
`npm run test:api`.  \
**Important**: you should make sure that you configure which database is being
used by your application (using environment variables) to avoid the default
database being used and therefore accidentally overwriting your existing
locations data.

### Routing

I'm a big fan of file-based routing, similar to what modern front-end frameworks
such as [SvelteKit](https://kit.svelte.dev/docs#routing) and
[Next.js](https://nextjs.org/docs/routing/introduction) use. In my opinion, it's
an intuitive way to organise your files which inherently forces you to consider
which pieces of functionality and which routes belong together.

It's **extremely** overkill for this basic server with just a single route, but
I'd recently implemented this functionality for another project so was able to
just re-use the code for it to save time.  \
It does make writing endpoints a lot more ergonomic and much easier to unit test
in my opinion as the endpoint handlers can just be promise-returning functions,
and you could argue that it helps with future-proofing the app a bit for when we
start adding more endpoints in the future.

## Part 3: The App

As requested the app is built using ReactJS, and can be found in the
[`app/`](./app) directory.

The app uses [`vitejs`](https://vitejs.dev/) for bundling, and can be built
using `npm run build`.  \
Once that is done, the bundled app will be present in the `dist/` directory
which will be served statically by the server.

When developing, you can run the `npm run dev` script which will concurrently:

- Start the server, watching for any changes and restarting it when required.
- Start the app's vitejs dev server, with hot module reloading etc.

To support HMR when developing, we currently run the web app using the built-in
vitejs dev server. This means that the app will be served over a different port
to the backend server (defaults to the backend's configured port + 1, but can be
configured itself - see [`vite.config.js`](./vite.config.js) for the relevant
environment variable).  \
I therefore used vitejs's
[`server.proxy`](https://vitejs.dev/config/#server-proxy) configuration option
to forward any API requests to the correct port when running the dev server.
This is slightly awkward - in a real production app I'd want to either:

- Have the production environment be closer to this dev environment, where the
  app is just served statically by its own process and API requests are made to
  a remote server (perhaps through an API gateway).
- Use something like vitejs' built-in [SSR
  support](https://vitejs.dev/guide/ssr.html) to server-render the app using the
  same server as our API routes, which could therefore also serve the app with
  HMR in a development environment.

## Spec Compliance

- To achieve the `Display coordinates next to results` "bonus point", I changed
  the `GET /locations` endpoint to return not just an array of string location
  names but also those locations' ids, latitudes and longitudes.  \
  This seems like a sensible change in general to support more use-cases for this
  endpoint rather than restricting ourselves to just responding with names, but
  the commit before that change (`a86e9d2`) can be checked out to see the
  implementation working when only returning the `name` field of the matching
  locations.

- The server spec also says `You should only start fuzzy matches if 2 or more
  characters are in the search string.` - I sadly skipped over this note until
  the last minute, and while changing the endpoint to reject any search string
  under 2 characters wouldn't be hard at all that seems like a silly way to
  implement this, and I'm not sure what the expected behaviour would be? Respond
  with every single location?  \
  I would normally look to clear this up before implementing something, so sadly
  did not have the time to do so here. No reason to make the endpoint support
  _less_ use-cases if I don't have a good understanding of what's wanted.
