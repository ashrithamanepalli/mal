const { stdin, stdout } = require("process");
const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./printer");

const READ = (str) => read_str(str);
const PRINT = (str) => pr_str(str);
const EVAL = (arguments) => arguments;

const rep = (arguments) => PRINT(EVAL(READ(arguments)));

const rl = readline.createInterface(
  {
    input: stdin,
    output: stdout
  }
)

const repl = () => {
  rl.question("user> ", line => {
    console.log(rep(line));
    repl();
  })  
}

repl();
