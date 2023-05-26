const { stdin, stdout } = require("process");
const readline = require("readline");

const PRINT = (arguments) => arguments;
const READ = (arguments) => arguments;
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

const main = () => {
  stdout.write("user> ");
  stdin.on("data", (chunk) => {
    stdout.write(rep(chunk))
    stdout.write("user> ");
  })
};

main();
