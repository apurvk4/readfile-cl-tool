#!/usr/bin/env node
"use strict";
const fs = require("fs");
const readline = require("readline");
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
let args = process.argv.slice(2);
const Default_Encoding = "utf8";
function read(enc, name, num, flag) {
  if (/^[rR][aA][wW]$/.test(enc)) {
    enc = undefined;
  }
  fs.readFile(name, enc, (err, data) => {
    if (err) {
      console.error(err.message);
      return;
    }
    data = data.split("\n");
    let len = data.length;
    if (typeof num != "undefined" && num <= len) {
      len = num;
    }
    for (let i = 0; i < len; i++) {
      if (flag) {
        let index = i + 1;
        data[i] = index + ": " + data[i];
      }
      console.log(data[i]);
    }
    // down: key.sequence=== \u001b[B
    // right : key.sequence === \u001b[C
    if (data.length > len) {
      process.stdin.on("keypress", (str, key) => {
        if (
          (key.ctrl && (key.name === "c" || key.name === "z")) ||
          key.name === "escape"
        ) {
          process.exit();
        } else if (key.sequence === "\u001b[B" || key.sequence === "\u001b[C") {
          if (flag) {
            let index = len + 1;
            data[len] = index + ": " + data[len];
          }
          console.log(data[len]);
          len++;
          if (len >= data.length) {
            process.exit();
          }
        }
      });
    }
  });
}
if (/^(-h|--help)$/.test(args[0])) {
  if (args.length > 1) {
    console.error("Invalid Extra arguments provided.");
  } else {
    console.log(`--help utility\n\n
                readfile [options] <file_name> [min_lineNumber]\n
                filename should be with proper file extension And with full path if not in PWD\n
                [options] =>
                  -e : it is used to provide encoding of the given text file.\n
                  It Supports utf8,ucs2,ascii,utf16le,latin1,binary,raw,hex,base64 and base64url.\n
                  Default encoding is utf8.
                    eg :- 'readfile -e ascii file_name' \n or 'readfile file_name' (it uses default encoding)\n
                  -l : it is used to add line number at the begining of each line.if not included line number will not be added.\n
                    eg :- 'readfile -l file_name' \n or 'readline -le ascii file_name' (using both custom encoding and line numbers)\n
                  min_lineNumber : It is used to provide minimum line numbers to be printed. If output data has less number of lines \n
                  then provided then all of them will be printed at once but if output data has less number of lines then provided min_linNumber \n
                  at first given number of lines will be printed but on \n
                  down-key or right-key press => next line added.\n
                  to stop press  ctrl+c or ctrl+z or esc.

                  eg :- 'readfile -el utf8 file_name 21'
                `);
  } // regex=  /[\w-@\.]{1,}\.\w{1,}$/
} else if (
  args[0] === "-l" ||
  (args[0] != "-l" &&
    args[0] != "--version" &&
    args[0] != "-v" &&
    args.length === 1)
) {
  let index = 1;
  let flag = false;
  if (args[0] === "-l") {
    index++;
    flag = true;
  }
  if (args.length > index) {
    args[index] = Number.parseInt(args[index]);
    if (!Number.isInteger(args[index]) || args.length > index + 1) {
      console.log(
        "Invalid Extra arguments provided.\nUse 'readfile --help' to get more information."
      );
      process.exit(1);
    }
  }
  read(Default_Encoding, args[index - 1], args[index], flag);
} else if (args[0] === "--version" || args[0] === "-v") {
  if (args.length > 1) {
    console.error(
      "Invalid Extra arguments provided.\nUse 'readfile --help' to get more information."
    );
  } else {
    let path = __dirname.split("/bin");
    let flag = false;
    if (path.length != 2) {
      path = __dirname.split("\\bin");
      flag = true;
    }
    if (flag) {
      path = path[0] + "\\package.json"; //for windows
    } else {
      path = path[0] + "/package.json"; // linux and osx
    }
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      data = JSON.parse(data);
      console.log("version : ", data.version);
    });
  }
} else if (
  (args[0] === "-e" || args[0] === "-el" || args[0] === "-le") &&
  (args.length === 1 || args.length == 2)
) {
  let l = args.length;
  console.error(
    ` ${
      l === 2
        ? "No filename provided."
        : "No encoding format and filename provided."
    }\nUse 'readfile --help' to get more information.`
  );
} else if (
  (args[0] === "-e" || args[0] === "-el" || args[0] === "-le") &&
  args.length >= 3
) {
  if (args.length >= 4) {
    args[3] = Number.parseInt(args[3]);
    if (!Number.isInteger(args[3]) || args.length > 4) {
      console.error(
        "Invalid Extra arguments provided.\nUse 'readfile --help' to get more information."
      );
      process.exit(1);
    }
  }
  let n;
  args[3] = Number.parseInt(args[3]);
  if (args.length === 4 && Number.isInteger(args[3])) {
    n = args[3];
  }
  let flag = args[0] === "-e" ? false : true;
  read(args[1], args[2], n, flag);
} else {
  console.error(
    "invalid input.\n use 'readfile --help' to get more information."
  );
}
