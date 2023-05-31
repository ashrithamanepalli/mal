class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value)
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value)
  }
}

class MalKeyWord extends MalValue {
  constructor(value) {
    super(value)
  }
}

class MalList extends MalValue {
  constructor(value) {
    super(value)
  }

  isEmpty() {
    return this.value.length === 0; 
  }

  pr_str() {
    return "(" + this.value.map(x =>
    {
      if (x instanceof MalValue) return x.pr_str();
      return x.toString();
    }).join(" ") + ")";
  }
}

class MalMap extends MalValue {
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

  pr_str() {
    return "{" + this.value.map(x =>
    {
      if (x instanceof MalValue) return x.pr_str();
      return x.toString();
    }).join(" ") + "}";
  }
}

class MalVector extends MalValue{
  constructor(value) {
    super(value)
  }

  isEmpty() {
    return this.value.length === 0; 
  }

  pr_str() {
    return "[" + this.value.map(x =>
    {
      if (x instanceof MalValue) return x.pr_str();
      return x.toString();
    }).join(" ") + "]";
  }
}

class MalNil extends MalValue {
  constructor() {
   super(null);
  }

  pr_str() {
    return "nil"
  }
}

class MalBool extends MalValue {
  constructor(value) {
   super(value);
  }

  pr_str() {
    return this.value.toString();
  }
}

module.exports = {
  MalSymbol, MalValue, MalList, MalVector, MalNil, MalBool, MalMap, MalString, MalKeyWord
};
