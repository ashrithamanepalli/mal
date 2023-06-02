const { MalList } = require("./types");

class Env {
  constructor(outer, binds = [], exprs = []) {
    this.outer = outer;
    this.binds = binds;
    this.exprs = exprs;
    this.data = {};
  }

  set(symbol, malValue) {
    this.data[symbol.value] = malValue;
    return malValue;
  }

  bind(args) {
    let index = 0;
    while (index < this.binds.length && this.binds[index].value !== '&') {
      this.set(this.binds[index], args[index]);
      index++;
    }

    if (index >= this.binds.length) {
      return;
    }

    this.set(this.binds[index + 1], new MalList(args.slice(index)));
  }

  find(symbol) {
    if (this.data[symbol.value] !== undefined) {
      return this;
    }
    if (this.outer !== undefined) {
      return this.outer.find(symbol);
    }
  }

  get(symbol) {
    const env = this.find(symbol);
    if (!env) throw `${symbol.value} not found`;
    return env.data[symbol.value];
  }

  toString() {
    return this.data.toString() + "\n" + this.outer.toString();
  }
}

module.exports = { Env };
