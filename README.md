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
form of `ü` going by the location names) in the `alertnatenames` field to turn
into `"`:

```console
$ nl ./data/GB.tsv \
$   | sed -n '1p; 1811,1812p; 1821p; 1870p; 1919p; 1952p; 2011p; 3442p; 5355p; 6998p; 7731p; 12556p; 19008p; 20756p; 25812p;'
$   | awk -F'\t' '{ print "["$1" ] "$4": "$5 }'
[     1 ] asciiname: alternatenames
[  1811 ] Uxbridge: "ksbridzh,aksabrija,wu ke si qiao,Ъксбридж,अक्सब्रिज,烏克斯橋
[  1812 ] Uttoxeter: "ksutur,Ъксътър
[  1821 ] Usk: "sk,Ask,Brynbuga,Usk,Аск,Ъск
[  1870 ] Uppingham: "pingam,Ъпингам
[  1919 ] Upminster: "pminstur,Ъпминстър
[  1955 ] Ulverston: "lvurstun,Ulverston,Ulverstone,Ълвърстън
[  2014 ] Uckfield: "kfijld,Ъкфийлд
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

TODO
