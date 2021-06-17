# Node code challenge

This challenge has three parts:

1. Written answers to [Questions](./QUESTIONS.md)
2. Build a geo search server
3. Build a form to search and display results

We're looking for elegant, clean solutions.  Try to think of and handle possible edge cases.

This challenge is sent to experienced developers and newcomers alike. The aim is to complete the task to the point at which you are comfortable talking about it.  In the interview we'll discuss approach to the problem, why you chose the given approach and where you would take it next.

There are [hints](./HINTS.md) available should you get stuck.

## Part 1: Questions

The goal here is to describe as clearly and tersely as possible. As much an assessment of communications as JavaScript knowledge.

## Part 2: The geo search server

The objective is to create a server which can be queried for names of points of interest in the UK.

For a given input such as `hastin` a set of matching results should be returned which start with this input.

Specification:

The server should respond to the following route

    /locations?q=fuzzyMatchString

Where `fuzzyMatchString` will be a partial name of a location where the start of the name matches. For example

    /locations?q=hastin

Could return a the following JSON response (NOTE: Your dataset only contains GB locations, so the results will differ)

    [
      "Hastings Castle",
      "Hastings Slieve Donard Hotel",
      "Hastings Everglades Hotel",
      "Hastings Railway Station",
      "Hastings Culloden Estate",
      "Hastings Europa Hotel",
      "Hastings District",
      "Hastingleigh",
      "Hastingwood",
      "Hastings Stormont",
      "Hastings Ballygally Castle Hotel",
      "Hastings Culloden Estate & Spa",
      "Hastings Slieve Donard Resort And Spa"
    ]

NOTE: You should only start fuzzy matches if 2 or more characters are in the search string.

Implementation:

You can use whatever server library you like but it must be written in [node](https://nodejs.org). The data of the locations should be stored in a [SQLite](https://www.sqlite.org/) database.

Data source:

The data source is available in this repo in the [./data/GB.txt](data/) file. The [readme](data/readme.txt) in that directory explains how to use the data.

## Part 3: The search form

The objective is to provide a user interface to search for names.

The interface should comprise of a search box and list of results.

When the user starts typing the results should be displayed in the list below.

```
   [ Search here     ]

   * Result 1
   * Result 2
   * Result 3
   * Result 4

```

NOTE: It is important to display the correct results for a given search term.

Implementation:

The implementation should be a single page app and use [React JS](https://reactjs.org/). The style of react, supporting tools and libraries are up to you.

## Rules

All work should be committed into a fork of this repo. Please note you won't have permission to push to this repo directly (see <https://help.github.com/articles/fork-a-repo> for help)

You'll get bonus points if you

* Display coordinates next to results
* Unit test your code
* Provide good documentation
* Sort the results by the closest name match

Good luck!
