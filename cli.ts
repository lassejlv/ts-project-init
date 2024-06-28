#!/usr/bin/env node

import inquirer from "inquirer";
import { exec } from "child_process";
import ora from "ora";
import fs from "fs";

const main = async () => {
  const checkGitSpinner = ora("Checking if git is installed...");
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

  const promise = new Promise(async (res, rej) => {
    checkGitSpinner.start();

    // Check if git is installed
    exec("git --version", async (err) => {
      if (err) {
        checkGitSpinner.fail("Git is not installed. Go to https://git-scm.com/downloads and install it.");
        process.exit(1);
      } else {
        checkGitSpinner.succeed("Git is installed!");
      }
    });

    exec(`git clone https://github.com/lassejlv/nodejs-typescript-starter ${ans.dir}`, async (error, stdout, stderr) => {
      if (error) {
        gitSpinner.fail("Error while cloning repo!");
        rej(error.message);
        process.exit(1);
      }

      gitSpinner.succeed("Cloned repo!");

      if (ans.install) {
        depInstall.start();
        exec(`cd ${process.cwd()}/${ans.dir} && npm install`, (installError, installStdout, installStderr) => {
          if (installError) {
            depInstall.fail(`Error installing dependencies: ${installStderr}`);
            rej(installError);
            process.exit(1);
          }

          depInstall.succeed("Dependencies installed!");
          res(true);
        });
      }

      if (!ans.install) {
        console.log("Skipping install...");
        res(true);
      }
    });
  });

  promise.then(() => {
    console.log("\nDone!");
    console.log(`cd ${ans.dir} && npm run dev`);
    console.log("\nFor production build: npm run build && npm start");
    console.log("\nHappy coding :)");
  });
};

main();
