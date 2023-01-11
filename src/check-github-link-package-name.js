/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const core = require('@actions/core');
const fetch = require('node-fetch');
const { URL } = require('url');

(async () => {
  const myArgs = process.argv.slice(2);
  const npmPackageName = myArgs[0];
  const githubLink = myArgs[1];
  try {
    const path = (new URL(githubLink)).pathname;
    // find out the default branch
    const defaultBranch = await fetch(`https://api.github.com/repos${path}`)
      .then(response => response.json())
      .then(data => data.default_branch)
      .catch(function (error) {
        console.log(error.message)
        throw new Error(`Error getting the default branch for ${githubLink} repo`);
      });
    // fetch package.json from the default branch, read package's name
    const packageName = await fetch(`https://raw.githubusercontent.com${path}/${defaultBranch}/package.json`)
      .then(response => response.json())
      .then(data => data.name)
      .catch(function (error) {
        console.log(error.message)
        throw new Error(`Error reading package name from \`package.json\` file in ${githubLink} repo`);
      });
    
    if (packageName !== npmPackageName) {
      const errorMessage = 'Package name from `package.json` file is not equal to the provided npm package name.';
      throw new Error(errorMessage);
    }
  } catch (e) {
    core.setOutput('error', `:x: ${e.message}`);
    throw new Error(e);
  }
})();
