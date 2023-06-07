const { isDeepStrictEqual } = require("util");

const pr_str = malValue => {
  if (malValue instanceof MalValue) {
    // console.log(malValue);
    return malValue.pr_str(true);
  }

  return malValue.toString();
};

class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }

  isEqual(otherValue) {
    return otherValue instanceof MalValue && otherValue.value === this.value;
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value)
  }

  isEqual(otherValue) {
    return otherValue instanceof MalSymbol && otherValue.value === this.value;
  }

  pr_str() {
    return this.value;
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str(print_readably = false) {
    console.log(print_readably);
    if (print_readably) {
      return '"' + this.value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n") + '"';
    }
    return `"${this.value}"`;
  }

  isEqual(otherValue) {
    return otherValue instanceof MalString && otherValue.value === this.value;
  }
}

class MalKeyWord extends MalValue {
  constructor(value) {
    super(value)
  }

  isEqual(otherValue) {
    return otherValue instanceof MalKeyWord && otherValue.value === this.value;
  }
}

class MalFunction extends MalValue {
  constructor(doForms, binds, env, closureFun, isMacro = false) {
    super(doForms);
    this.value = doForms;
    this.binds = binds;
    this.env = env;
    this.fn = closureFun;
    this.isMacro = isMacro;
  }

  apply(ctx, args) {
    return this.fn.apply(null, args);
  }

  pr_str() {
    return "#<function>";
  }

  isEqual(otherValue) {
    return otherValue instanceof MalFunction && otherValue.value === this.value;
  }
}

class MalIterator extends MalValue {
  constructor(value) {
    super(value);
  }

  nth(n) {
    if (n >= this.value.length) {
      throw "index out of range";
    }
    return this.value[n];
  }
  
  first() {
    if (this.value.length < 1) {
      return new MalNil();
    }
    return this.value[0];
  }

  rest() {
    return new MalList(this.value.slice(1));
  }

  beginsWith(token) {
    return this.value.length > 0 && this.value[0].value === token;
  }

  isEmpty() {
    return this.value.length === 0;
  }

  isEqual(otherValue) {
    return otherValue instanceof MalIterator && isDeepStrictEqual(otherValue.value, this.value);
  }
}

class MalMap extends MalIterator {
  constructor(value) {
    super(value);
    this.keyValuePairs = {};
    this.isInitialized = false;
  }

  init() {
    for (let index = 0; index < this.value.length; index+=2) {
      const key = this.value[index];
      const value = this.value[index + 1];
      this.keyValuePairs[key] = value;
    }
  }

  getValue(requestedKey) {
    if (!this.isInitialized) {
      this.init(); 
      this.isInitialized = true;
    }

    return this.keyValuePairs[requestedKey];
  }

  apply(_, arg){
    return this.getValue(arg);
  }

  pr_str() {
    return "{" + this.value.map(x =>
    {
      if (x instanceof MalValue) return x.pr_str();
      return x.toString();
    }).join(" ") + "}";
  }
}

class MalVector extends MalIterator {
  constructor(value) {
    super(value)
  }

  pr_str() {
    return "[" + this.value.map(x =>
    {
      if (x instanceof MalValue) return x.pr_str();
      return x.toString();
    }).join(" ") + "]";
  }
}

class MalList extends MalIterator {
  constructor(value) {
    super(value)
  }

  pr_str() {
    return "(" + this.value.map(x =>
    {
      if (x instanceof MalValue) return x.pr_str();
      return x.toString();
    }).join(" ") + ")";
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
    this.value = null;
  }

  pr_str() {
    return "nil"
  }

  isEqual(otherValue) {
    return otherValue instanceof MalNil && otherValue.value === this.value;
  }
}

class MalAtom extends MalValue {
  constructor(value) {
    super(value);
  }

  reset(newValue) {
    this.value = newValue;
    return newValue;
  }

  deref() {
    return this.value;
  }

  swap(f, args) {
    let func = f;
    if (f instanceof MalFunction) {
      func = f.fn;
    }

    this.value = func.apply(null, [this.value, ...args]);
    return this.value;
  }

  pr_str() {
    return "(atom " + this.value + ")";
  }
}

module.exports = {
  MalSymbol, MalValue, MalList, MalVector, MalNil, MalMap, MalString, MalKeyWord,
  MalFunction, MalIterator, MalAtom, pr_str
};
