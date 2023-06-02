const { stdin, stdout} = require("process");
const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");
const { MalSymbol, MalList, MalVector, MalMap, MalNil, MalString, MalFunction, MalValue } = require("./types");
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

const handleLet = (ast, env) => {
  const let_env = new Env(env);
  const [bindings, ...forms] = ast.value.slice(1); 
  const doForms = new MalList([new MalSymbol("do"), ...forms]);
  
  for (let index = 0; index < bindings.value.length; index += 2) {
    let_env.set(bindings[index], EVAL(bindings[index+1], let_env));
  }
  
  return [doForms, let_env];
};

const handleIf = (ast, env) => {
  const [predicate, ifBlock, doBlock] = ast.value.slice(1);
  const predicate_value = EVAL(predicate, env);
  
  if (predicate_value !== false && !(predicate_value instanceof MalNil)) {
    return ifBlock;
  }

  if (doBlock !== undefined) {
    return doBlock;
  }

  return new MalNil();
}

const handleDo = (ast, env) => {
  ast.value.slice(1, -1).forEach(element => {
    EVAL(element, env);
  });

  return ast.value.slice(-1)[0];
};

const handleFn = (ast, env) => {
  const [binds, ...exprs] = ast.value.slice(1);
  const doForms = new MalList([new MalSymbol("do"), ...exprs]);

  return new MalFunction(doForms, binds, env);
}

const READ = str => read_str(str);

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof MalList)) return eval_ast(ast, env);
    if (ast.isEmpty()) return ast;
  
    switch (ast.value[0].value) {
      case "def!":
        return env.set(ast.value[1], EVAL(ast.value[2], env))
  
      case "let*":
        [ast, env] = handleLet(ast, env);
        break;
        
      case "if":
        ast = handleIf(ast, env);
        break;
          
      case "do":
        ast = handleDo(ast, env);
        break;
        
      case "fn*":
        ast = handleFn(ast, env);
        break;
      
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

const env = new Env();
env.set(new MalSymbol("+"), (...args) => args.reduce((a, b) => a + b));
env.set(new MalSymbol("*"), (...args) => args.reduce((a, b) => a * b));
env.set(new MalSymbol("-"), (...args) => args.reduce((a, b) => a - b));
env.set(new MalSymbol("/"), (...args) => args.reduce((a, b) => a / b));
env.set(new MalSymbol("%"), (...args) => args.reduce((a, b) => a % b));
env.set(new MalSymbol("="), (...args) => {
  if (args[0] instanceof MalValue) {
    return args.every((a) => (args[0].isEqual(a)))
  }
  return args.every((a) => (a === args[0]))
});
env.set(new MalSymbol("<"), (...args) => multipleCheck(args, (a,b) => a < b));
env.set(new MalSymbol(">"), (...args) => multipleCheck(args, (a,b) => a > b));
env.set(new MalSymbol("<="), (...args) => multipleCheck(args, (a,b) => a <= b));
env.set(new MalSymbol(">="), (...args) => multipleCheck(args, (a,b) => a >= b));
env.set(new MalSymbol("list"), (...args) => new MalList(args));
env.set(new MalSymbol("list?"), arg => arg instanceof MalList);
env.set(new MalSymbol("empty?"), arg => arg.isEmpty());
env.set(new MalSymbol("str"), (...args) =>
{
  return new MalString(
    args.map(arg =>  arg instanceof MalValue ? arg.value : arg).join(''))
});
env.set(new MalSymbol("pr-str"), (...args) =>
{
  return new MalString(
    args.map(arg => arg instanceof MalValue ?
      replaceEscapeChars(arg.toString()) :
      arg).join(' '))
});
env.set(new MalSymbol("not"), arg => {
  if (arg === false || arg instanceof MalNil) {
    return true;
  }
  return false;
});
env.set(new MalSymbol("count"), arg => {
  if (arg instanceof MalMap) {
    return arg.value.length / 2;
  }
  if (arg instanceof MalNil) {
    return 0;
  }
  return arg.value.length;
});
env.set(new MalSymbol("prn"), (...args) => {
  console.log(...args.map(arg => arg instanceof MalValue ? arg.toString() : arg));
  return new MalNil();
});
env.set(new MalSymbol("println"), (...args) => {
  console.log(...args.map(arg => arg instanceof MalValue ? arg.value : arg));
  return new MalNil();
});

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
