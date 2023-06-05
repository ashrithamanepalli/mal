const { MalList, MalMap, MalNil, MalString, MalValue, MalIterator } = require("./types");

const multipleCheck = (args, predicate) => {
  const result = [];
  for (let index = 0; index < args.length - 1; index++) {
    result.push(predicate(args[index], args[index + 1]))
  }
  return result.every((a)=>a === true);
}

const replaceEscapeChars = existingString => {
  const slashReplace = existingString.replaceAll("\\", "\\\\");
  const quoteReplace = slashReplace.replaceAll("\"", "\\\"");
  return quoteReplace;
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
"list" : (...args) => new MalList(args),
"list?" : arg => arg instanceof MalList,
"empty?": arg => arg.isEmpty(),
"=" : (...args) => {
    if (args[0] instanceof MalValue) {
      return args.every((a) => (args[0].isEqual(a)))
    }
    return args.every((a) => (a === args[0]))
  },
"str" : (...args) => new MalString
  (args.map(arg => strFn(arg)).join('')),
"pr-str" : (...args) =>
  {
    return new MalString(
      args.map(arg => arg instanceof MalValue ?
        replaceEscapeChars(arg.toString()): arg).join(' '))
  },
"not" : arg => {
    if (arg === false || arg instanceof MalNil) {
      return true;
    }
    return false;
  },
"count" : arg => {
    if (arg instanceof MalMap) {
      return arg.value.length / 2;
    }
    if (arg instanceof MalNil) {
      return 0;
    }
    return arg.value.length;
  },
"prn" : (...args) => {
    console.log(...args.map(arg => arg instanceof MalValue ? arg.toString() : arg));
    return new MalNil();
  },
"println" : (...args) => {
    console.log(...args.map(arg => arg instanceof MalValue ? arg.value : arg));
    return new MalNil();
  }
}

module.exports = { ns };
