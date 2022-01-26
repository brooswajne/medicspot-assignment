# Questions

## Question 1

Explain the output of the following code and why

```js
    setTimeout(function() {
      console.log("1");
    }, 100);
    console.log("2");
```

Running the above code will result in `2` being logged immediately (± some CPU
cycles), then after 100ms `1` will be logged to the console.

This is because of how setTimeout works - the provided callback function gets
scheduled to be run 100ms after the initial setTimeout call, then the next line
of code logs `2`, then the JS event loop keeps running until 100ms has elapsed
and the callback can be run, which logs `1`.

## Question 2

Explain the output of the following code and why

```js
    function foo(d) {
      if(d < 10) {
        foo(d+1);
      }
      console.log(d);
    }
    foo(0);
```

Running the above code will result in the numbers `10` to `0` being logged to the
console **in descending order**.

The initial call to `foo()` will follow the `if` branch (as `d` is `0`), which
will result in a recursive call to `foo()` with `d` being `1`.  \
This will recursively continue until a call to `foo()` with `d` being `10`, at
which point the `if` branch will be skipped and `10` will be logged.  \
Once that is logged, the call to `foo(10)` completes and we go back up the call
stack to the call to `foo(9)` which exits the `if` branch and runs
`console.log(9)`.  \
This continues with `foo(8)`, `foo(7)`, etc. until we get back to completing the
original call of `foo(0)` and the program terminates.

## Question 3

If nothing is provided to `foo` we want the default response to be `5`.
Explain the potential issue with the following code:

```js
    function foo(d) {
      d = d || 5;
      console.log(d);
    }
```

If we were to call `foo()` with any of the following arguments (potentially
incomplete list, just off the top of my head):

- `foo(0)`
- `foo(null)`
- `foo('')`
- `foo(false)`

Then `d` would be "false-y", meaning that `d || 5` would evaluate to `5` - even
though a value for `d` _was_ provided.

A better solution would be to use default parameters, ie. something like:

```js
function foo(d = 5) {
  console.log(d);
}
```

Note that `foo(undefined)` would still log `5` in both cases (the default
parameter essentially expands to `d = d === undefined ? 5 : d`).

## Question 4

Explain the output of the following code and why

```js
    function foo(a) {
      return function(b) {
        return a + b;
      }
    }
    var bar = foo(1);
    console.log(bar(2))
```

The value `3` would be logged to the console.

The initial call to `foo(1)` returns a new function closure which captures the
value of `a`. This means that when calling this new function (which in the above
snippet was assigned to `bar`) it will have `a` still bound to `1`. Since `b` is
given the value of `2`, the resulting evaluated expression is `1 + 2`, which
evaluates to `3`.

## Question 5

Explain how the following function would be used

```js
    function double(a, done) {
      setTimeout(function() {
        done(a * 2);
      }, 100);
    }
```

If I were to ever desire a number being doubled after a 100ms delay rather than
immediately (as I often do), I could call the function as follows:

```js
double(21, function onceDoubled(doubledValue) {
  // do something with doubledValue
});
```

The `onceDoubled` callback function will be invoked after an approximate 100ms
delay with `doubledValue` being bound to `42`.
