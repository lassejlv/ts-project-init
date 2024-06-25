#!/usr/bin/env node

import inquirer from "inquirer";
import { exec } from "child_process";
import ora from "ora";
import fs from "fs";

const main = async () => {
  const gitSpinner = ora("Cloning repo...");
  const depInstall = ora("Installing dep using npm...");

  const ans = await inquirer.prompt([
    {
      name: "dir",
      message: "Where do you wanna put your project?",
      default: "my-ts-app",
      type: "input",
    },
    {
      name: "install",
      message: "Would you like to have dep installed?",
      default: true,
      type: "confirm",
    },
  ]);

  if (!ans.dir) {
    console.error("No dir was found :(");
    process.exit(1);
  } else if (fs.existsSync(ans.dir)) {
    console.error("The dir is already in use.");
    process.exit(1);
  }

  gitSpinner.start();

  exec(`git clone https://github.com/lassejlv/nodejs-typescript-starter ${ans.dir}`, (error, stdout, stderr) => {
    if (error) {
      gitSpinner.fail("Error while cloning repo!");
      process.exit(1);
    }

    gitSpinner.succeed("Cloned repo!");

    if (ans.install) {
      depInstall.start();
      exec(`cd ${process.cwd()}/${ans.dir} && npm install`, (installError, installStdout, installStderr) => {
        if (installError) {
          depInstall.fail(`Error installing dependencies: ${installStderr}`);
          process.exit(1);
        } else {
          depInstall.succeed("Dependencies installed!");
        }
      });
    }

    console.log("Done!");
    process.exit(0);
  });
};

main();
