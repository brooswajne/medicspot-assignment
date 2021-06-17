# Hints

## Challenge 1: Questions

Depending on experience you might want to run the scripts and debug the statements to give a confident answer.

## Challenge 2: The geo search server

Loading data:

SQLite has tools for loading data into a database automatically. The data is provided as a Tab Separated Variables (.tsv).

From the sqlite prompt (run `sqlite3` in your terminal):

```sh
sqlite> .open ./data/locations.db
sqlite> .mode tabs
sqlite> .import ./data/GB.tsv locations
```

Building the server:

Feel free to include modules to help you with this challenge. A good set might be:

* [express](https://www.npmjs.com/package/express)
* [sqlite](https://www.npmjs.com/package/sqlite3)

There is a starter `package.json` and `index.js` to build your app

## Challenge 3: The search form

The search app can be built using the tools of your choice such as [CRA](https://github.com/facebook/create-react-app) or [webpack](https://webpack.js.org/).

It is also possible to use React directly in an HTML page using unpkg.

```html
<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js" crossorigin></script>

<script type="text/babel" src="./js/App.js"></script>
```

There is a starter `/public/index.html` file for the client app. This should be served from the webserver from Challenge 2.
