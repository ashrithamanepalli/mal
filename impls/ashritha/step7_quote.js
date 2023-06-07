const { stdin, stdout} = require("process");
const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { MalSymbol, MalList, MalVector, MalMap, MalFunction, MalString, MalIterator} = require("./types");
const { handleDo, handleFn, handleIf, handleLet, handleDef} = require("./handlers");
const {Env} = require('./env');
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

const quasiquote = (ast, env) => {
  if (ast instanceof MalList && ast.beginsWith("unquote")) {
    return ast.value[1];
  }

  if (ast instanceof MalSymbol || ast instanceof MalMap) {
    return new MalList([new MalSymbol("quote"), ast]);
  }

  if (ast instanceof MalIterator) {
    let result = new MalList([]);
    for (let index = ast.value.length - 1; index >= 0; index--) {
      const element = ast.value[index];

      if (element instanceof MalIterator && element.beginsWith("splice-unquote")) {
        result = new MalList([new MalSymbol("concat"), element.value[1], result])
      } else {
        result = new MalList([new MalSymbol("cons"), quasiquote(element), result])
      }
    }
    if (ast instanceof MalVector) {
      return new MalList([new MalSymbol("vec"), result]);
    }
    return result;
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
        return handleDef(ast, env, EVAL);
  
      case "let*":
        [ast, env] = handleLet(ast, env, EVAL);
        break;
        
      case "if":
        ast = handleIf(ast, env, EVAL);
        break;
          
      case "do":
        ast = handleDo(ast, env, EVAL);
        break;
        
      case "fn*":
        ast = handleFn(ast, env, EVAL);
        break;
      
      case "quasiquote":
        ast = quasiquote(ast.value[1], env);
        break;
      
      case "quote":
        return ast.value[1];
      
      case "quasiquoteexpand":
        return quasiquote(ast.value[1], env);
      
      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        
        if (fn instanceof MalFunction) {
          ast = fn.value;
          env = new Env(fn.env, fn.binds.value);
          env.bind(args);
        } else {
          return fn.apply(null, args);
        }
    }
  }
};

const PRINT = malValue => pr_str(malValue);

const setEnv = () => {
  const env = new Env();
  Object.keys(ns).forEach(key => env.set(new MalSymbol(key), ns[key]));
  env.set(new MalSymbol("eval"), (ast) => EVAL(ast, env));
  env.set(new MalSymbol("*ARGV*"), new MalList([]));
  return env;
};
const env = setEnv();

const rep = arguments => PRINT(EVAL(READ(arguments), env));
rep('(def! load-file (fn* (f) (eval (read-string (str "(do "(slurp f)"\nnil)")))))');

const rl = readline.createInterface(
  {
    input: stdin,
    output: stdout
  })

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

if (process.argv.length >= 3) {
  const args = process.argv.slice(3);
  const malArgs = new MalList(args.map(x => new MalString(x)));
  env.set(new MalSymbol("*ARGV*"), malArgs);
  
  const code = '(load-file "' + process.argv[2] + '")';
  rep(code);
  rl.close();
}
else {
  repl();
}
