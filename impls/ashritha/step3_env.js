const { stdin, stdout } = require("process");
const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { MalSymbol, MalList, MalVector, MalMap } = require("./types");
const {Env} = require('./env');


const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalList(newAst);
  }
  
  if (ast instanceof MalVector) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalVector(newAst);
  }

  if (ast instanceof MalMap) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalMap(newAst);
  }

  return ast;
}; 

const READ = str => read_str(str);

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) return eval_ast(ast, env);
  
  if (ast.isEmpty()) return ast;

  switch (ast.value[0].value) {
    case "def!":
      return env.set(ast.value[1], EVAL(ast.value[2], env))

    case "let*":
      const let_env = new Env(env);
      const bindings = ast.value[1].value;
      for (let index = 0; index < bindings.length; index += 2) {
        let_env.set(bindings[index], EVAL(bindings[index+1], let_env));
      }
      return EVAL(ast.value[2], let_env);
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = malValue => pr_str(malValue);

const env = new Env();
env.set(new MalSymbol("+"), (...args) => args.reduce((a, b) => a + b));
env.set(new MalSymbol("*"), (...args) => args.reduce((a, b) => a * b));
env.set(new MalSymbol("-"), (...args) => args.reduce((a, b) => a - b));
env.set(new MalSymbol("/"), (...args) => args.reduce((a, b) => a / b));

const rep = arguments => PRINT(EVAL(READ(arguments), env));

const rl = readline.createInterface(
  {
    input: stdin,
    output: stdout
  }
)

const repl = () => {
  rl.question("user> ", line => {
    try {
      console.log(rep(line));
    }
    catch (error) {
      console.log(error);
    }
    repl();
  })  
}

repl();
