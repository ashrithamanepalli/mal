const {
  MalSymbol,
  MalList,
  MalVector,
  MalNil,
  MalMap,
  MalString,
  MalKeyWord} = require('./types.js');

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const current = this.peek();
    this.position++;
    return current;
  }

  length() {
    return this.tokens.length;
  }
}

const read_atom = reader => {
  const token = reader.next();
  const digitRegex = /^-?[\d]+$/;
  const keywordRegex = /^:.*/;
  const stringRegex = /^".*"?$/;

  if (token.match(digitRegex)) {
    return parseInt(token);
  }
  
  if (token.match(stringRegex)) {
    return new MalString(token);
  }
  
  if (token.match(keywordRegex)) {
    return new MalKeyWord(token);
  }

  if (token === "true") {
    return true;
  }
    
  if( token === "false") {
    return false;
  }

  if (token === "nil") {
    return new MalNil();
  }

  return new MalSymbol(token);
};

const read_seq = (reader, endingSymbol) => {
  reader.next();
  const ast = [];
  
  while (reader.peek() != endingSymbol) {
    if (reader.peek() === undefined) {
      throw "unbalanced";
    }
    ast.push(read_form(reader))
  }

  reader.next();
  return ast;
};

const read_list = reader => {
  const ast = read_seq(reader, ")");
  return new MalList(ast);
};

const read_vector = reader => {
  const ast = read_seq(reader, "]");
  return new MalVector(ast);
};

const validateMap = ast => {
  if ((ast.length % 2) !== 0) {
    throw "map literal must contain an even number of forms";
  }
};

const read_map = reader => {
  const ast = read_seq(reader, "}");
  validateMap(ast);
  return new MalMap(ast);
};

const read_form = (reader) => {
  const token = reader.peek();
  switch (token) {
    case "(":
      return read_list(reader);
    case "[":
      return read_vector(reader);
    case "{":
      return read_map(reader);
    default:
      return read_atom(reader);
  }
};

const tokenize = (str) => {
  const re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return [...str.matchAll(re)].map(x => x[1]).slice(0, -1);
};

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = { read_str };
