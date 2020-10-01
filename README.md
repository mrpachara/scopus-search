# Project Title

Searching SCOPUS from API.

---
## Requirements

For development, you will only need Node.js (version 14+) and a node global package, Yarn, installed in your environement.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer, **the version 14+ is required**.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v14.10.1

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

---

## Install

    $ git clone https://github.com/mrpachara/scopus-search
    $ cd scopus-search
    $ npm install

## Configure app

Create `.env` file then add your API key with the following example:

  ```shell
    ESL_API_KEY="YOUR_API_KEY"
  ```

Then create `out` directory to store your result.

    $ mkdir out

## Running the program

    $ npm run ts ./src/scopus-coding-search.ts ./out/YOUR_RESULT_FILE_NAME.csv
