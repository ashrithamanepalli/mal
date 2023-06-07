const fs = require('fs');
const {pr_str} = require('./printer');
const { read_str } = require("./reader");
const { MalList, MalMap, MalNil, MalString, MalValue, MalIterator, MalAtom, MalVector } = require("./types");

const multipleCheck = (args, predicate) => {
  const result = [];
  for (let index = 0; index < args.length - 1; index++) {
    result.push(predicate(args[index], args[index + 1]))
  }
  return result.every((a)=>a === true);
}

const strFn = arg => {
  if (arg instanceof MalIterator) {
    return arg.toString();
  }
  if (arg instanceof MalValue) {
    return arg.value;
  }
  return arg;
}

const ns = {
  "+" : (...args) => args.reduce((a, b) => a + b),
  "*" : (...args) => args.reduce((a, b) => a * b),
  "-" : (...args) => args.reduce((a, b) => a - b),
  "/" : (...args) => args.reduce((a, b) => a / b),
  "%": (...args) => args.reduce((a, b) => a % b),

  "<" : (...args) => multipleCheck(args, (a,b) => a < b),
  ">" : (...args) => multipleCheck(args, (a,b) => a > b),
  "<=" : (...args) => multipleCheck(args, (a,b) => a <= b),
  ">=" : (...args) => multipleCheck(args, (a,b) => a >= b),
  "=" : (...args) => {
    if (args[0] instanceof MalValue) {
      return args.every((a) => (args[0].isEqual(a)))
    }
    return args.every((a) => (a === args[0]))
  },

  list : (...args) => new MalList(args),
  "list?" : arg => arg instanceof MalList,
  "empty?": arg => arg.isEmpty(),
  not : arg => {
    if (arg === false || arg instanceof MalNil) {
      return true;
    }
    return false;
  },
  count: arg => {
    if (arg instanceof MalMap) {
      return arg.value.length / 2;
    }
    if (arg instanceof MalNil) {
      return 0;
    }
    return arg.value.length;
  },

  str : (...args) => new MalString(args.map(arg => strFn(arg)).join('')),
  prn : (...args) => {
    const str = args.map(x => pr_str(x, true)).join(" ");
    console.log(str);
    return new MalNil();
  },
  println : (...args) => {
    console.log(...args.map(arg => arg instanceof MalValue ? arg.value : arg));
    return new MalNil();
  },
  "pr-str": (...args) => {
    return pr_str(new MalString(args.map(x => pr_str(x, true)).join(" ")), true)
  },
  "read-string": string => read_str(string.value),

  slurp: filename => new MalString(fs.readFileSync(filename.value, "utf8")),

  atom: value => new MalAtom(value),
  deref: atom => atom.deref(),
  "atom?": value => value instanceof MalAtom,
  "reset!": (atom, value) => atom.reset(value),
  "swap!": (atom, fn, ...args) => atom.swap(fn, args),
  cons : (value, list) => new MalList([value, ...list.value]),
  concat: (...lists) => new MalList(lists.flatMap(x => x.value)),
  vec: (args) => new MalVector(args.value),
  "to-map": (args) => new MalMap(args.value),
  nth: (list, n) => list.nth(n),
  first: (list) => list instanceof MalNil ? new MalNil() : list.first(),
  rest: (list) => list instanceof MalNil ? new MalList([]) : list.rest(),
}

module.exports = { ns };
