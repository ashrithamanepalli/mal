const { stdin, stdout } = require("process");
const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { handleDo, handleFn, handleIf, handleLet, handlerDef} = require("./handlers");
const { MalSymbol, MalList, MalVector, MalMap, MalFunction } = require("./types");
const { Env } = require('./env');
const { ns } = require('./core.js');

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
  while (true) {
    if (!(ast instanceof MalList)) return eval_ast(ast, env);
    if (ast.isEmpty()) return ast;
  
    switch (ast.value[0].value) {
      case "def!":
        return handlerDef(ast, env, EVAL);
  
      case "let*":
        [ast, env] = handleLet(ast, env, EVAL); break;
        
      case "if":
        ast = handleIf(ast, env, EVAL); break;
          
      case "do":
        ast = handleDo(ast, env, EVAL); break;
        
      case "fn*":
        ast = handleFn(ast, env); break;
      
      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        
        if (fn instanceof MalFunction) {
          ast = fn.value;
          env = new Env(fn.env, fn.binds.value);
          env.bind(args);
        }
        
        else {
          return fn.apply(null, args);
        }
    }
  }
};

const PRINT = malValue => pr_str(malValue);

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

const setEnv = () => {
  const env = new Env();
  Object.keys(ns).forEach(key => env.set(new MalSymbol(key), ns[key]));
  return env;
};
const env = setEnv();

repl();
