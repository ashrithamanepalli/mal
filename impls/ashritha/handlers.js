const { MalSymbol, MalList, MalNil, MalFunction} = require("./types");
const {Env} = require('./env');

const handleLet = (ast, env, eval) => {
  const let_env = new Env(env);
  const [bindings, ...forms] = ast.value.slice(1); 
  const doForms = new MalList([new MalSymbol("do"), ...forms]);
  
  for (let index = 0; index < bindings.value.length; index += 2) {
    let_env.set(bindings.value[index], eval(bindings.value[index+1], let_env));
  }
  
  return [doForms, let_env];
};

const handleIf = (ast, env, eval) => {
  const [predicate, ifBlock, doBlock] = ast.value.slice(1);
  const predicate_value = eval(predicate, env);
  
  if (predicate_value !== false && !(predicate_value instanceof MalNil)) {
    return ifBlock;
  }

  if (doBlock !== undefined) {
    return doBlock;
  }

  return new MalNil();
}

const handleDo = (ast, env, eval) => {
  ast.value.slice(1, -1).forEach(element => {
    eval(element, env);
  });

  return ast.value.slice(-1)[0];
};

const handleFn = (ast, env) => {
  const [binds, ...exprs] = ast.value.slice(1);
  const doForms = new MalList([new MalSymbol("do"), ...exprs]);

  return new MalFunction(doForms, binds, env);
}

const handlerDef = (ast, env, eval) => {
  return env.set(ast.value[1], eval(ast.value[2], env));
}

module.exports = { handleDo, handleFn, handleIf, handleLet, handlerDef };
