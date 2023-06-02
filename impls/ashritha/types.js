const { isDeepStrictEqual } = require("util");

class MalValue {
  constructor(value) {
    this.value = value;
  }

  toString() {
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
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  toString() {
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
  constructor(doForms, binds, env) {
    super(doForms);
    this.value = doForms;
    this.binds = binds;
    this.env = env;
  }

  toString() {
    return "#<function>";
  }

  apply(_, args) {
    return this.value(...args);
  }

  isEqual(otherValue) {
    return otherValue instanceof MalFunction && otherValue.value === this.value;
  }
}

class MalIterator extends MalValue {
  constructor(value) {
    super(value);
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

  isEmpty() {
    return this.value.length === 0; 
  }

  toString() {
    return "{" + this.value.map(x =>
    {
      if (x instanceof MalValue) return x.toString();
      return x.toString();
    }).join(" ") + "}";
  }
}

class MalVector extends MalIterator {
  constructor(value) {
    super(value)
  }

  isEmpty() {
    return this.value.length === 0; 
  }

  toString() {
    return "[" + this.value.map(x =>
    {
      if (x instanceof MalValue) return x.toString();
      return x.toString();
    }).join(" ") + "]";
  }
}

class MalList extends MalIterator {
  constructor(value) {
    super(value)
  }

  isEmpty() {
    return this.value.length === 0; 
  }

  toString() {
    return "(" + this.value.map(x =>
    {
      if (x instanceof MalValue) return x.toString();
      return x.toString();
    }).join(" ") + ")";
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
    this.value = null;
  }

  toString() {
    return "nil"
  }

  isEqual(otherValue) {
    return otherValue instanceof MalNil && otherValue.value === this.value;
  }
}

class MalBool extends MalValue {
  constructor(value) {
   super(value);
  }

  toString() {
    return this.value.toString();
  }

  isEqual(otherValue) {
    return otherValue instanceof MalBool && otherValue.value === this.value;
  }
}

module.exports = {
  MalSymbol, MalValue, MalList, MalVector, MalNil, MalBool, MalMap, MalString, MalKeyWord,
  MalFunction
};
