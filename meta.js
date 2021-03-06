const path = require('path')
const fs = require('fs')

const {
  sortDependencies,
  installDependencies,
  installGlobalDependencies,
  runLintFix,
  printMessage,
} = require('./utils')
const pkg = require('./package.json')

const templateVersion = pkg.version

const { addTestAnswers } = require('./scenarios')

module.exports = {
  metalsmith: {
    // When running tests for the template, this adds answers for the selected scenario
    before: addTestAnswers
  },
  helpers: {
    if_or(v1, v2, options) {

      if (v1 || v2) {
        return options.fn(this)
      }

      return options.inverse(this)
    },
    template_version() {
      return templateVersion
    },
  },
  
  prompts: {
    name: {
      when: 'isNotTest',
      type: 'string',
      required: true,
      message: 'Project name',
    },
    description: {
      when: 'isNotTest',
      type: 'string',
      required: false,
      message: 'Project description',
      default: 'A Vue.js project',
    },
    author: {
      when: 'isNotTest',
      type: 'string',
      message: 'Author',
    },
    build: {
      when: 'isNotTest',
      type: 'list',
      message: 'Vue build',
      choices: [
        {
          name: 'Runtime + Compiler: recommended for most users',
          value: 'standalone',
          short: 'standalone',
        },
        {
          name:
            'Runtime-only: about 6KB lighter min+gzip, but templates (or any Vue-specific HTML) are ONLY allowed in .vue files - render functions are required elsewhere',
          value: 'runtime',
          short: 'runtime',
        },
      ],
    },
    router: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Install vue-router?',
    },
    store: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Install vuex?',
    },
    elementUI: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Install element-ui?',
    },
    jsdoc: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Install jsdoc(global)?',
    },
    commitizen: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Install git commitizen(global)?',
    },
    installGlobalDependencies:{
      when: 'isNotTest',
      type: 'confirm',
      message: 'Install choosen dependencies global?',
    },
    axios: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Instantiation an axios instance for xhr?',
    },
    uselint: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Use ESLint or Node && eslint to lint your code?',
    },
    lint: {
      when: 'isNotTest && uselint',
      type: 'list',
      message: 'Choose an instance of eslint (stadard with npm on nodejs script) ?',
      choices: [
        {
          name: 'nodejs proxy eslint.(in dev-script/eslint.js)',
          value: 'node',
          short: 'node',
        },
        {
          name: 'Standard (https://github.com/standard/standard)',
          value: 'lint',
          short: 'lint',
        } 
      ],
    },
    lintConfig: {
      when: 'isNotTest && uselint && lint === "lint"',
      type: 'list',
      message: 'Pick an ESLint preset',
      choices: [
        {
          name: 'Standard (https://github.com/standard/standard)',
          value: 'standard',
          short: 'Standard',
        },
        {
          name: 'Airbnb (https://github.com/airbnb/javascript)',
          value: 'airbnb',
          short: 'Airbnb',
        },
        {
          name: 'none (configure it yourself)',
          value: 'none',
          short: 'none',
        },
      ],
    },
    unit: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Set up unit tests',
    },
    runner: {
      when: 'isNotTest && unit',
      type: 'list',
      message: 'Pick a test runner',
      choices: [
        {
          name: 'Karma and Mocha',
          value: 'karma',
          short: 'karma',
        },
        {
          name: 'Jest',
          value: 'jest',
          short: 'jest',
        },
        {
          name: 'none (configure it yourself)',
          value: 'noTest',
          short: 'noTest',
        },
      ],
    },
    e2e: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Setup e2e tests with Nightwatch?',
    },
    initGit: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Init a empty git repo with git init?',
    },
    useGitLint: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Lint git commit with hook?',
    },
    autoInstall: {
      when: 'isNotTest',
      type: 'list',
      message:
        'Should we run `npm install` for you after the project has been created? (recommended)',
      choices: [
        {
          name: 'Yes, use NPM',
          value: 'npm',
          short: 'npm',
        },
        {
          name: 'Yes, use Yarn',
          value: 'yarn',
          short: 'yarn',
        },
        {
          name: 'No, I will handle that myself',
          value: false,
          short: 'no',
        }
      ] 
    }
  },
  filters: {
    '.eslintrc.js': 'uselint',
    '.eslintignore': 'uselint',
    'dev-script/eslint.js': 'lint ==="node"',
    'config/test.env.js': 'unit || e2e',
    'build/webpack.test.conf.js': "unit && runner === 'karma'",
    'test/unit/**/*': 'unit',
    'test/unit/index.js': "unit && runner === 'karma'",
    'test/unit/jest.conf.js': "unit && runner === 'jest'",
    'test/unit/karma.conf.js': "unit && runner === 'karma'",
    'test/unit/specs/index.js': "unit && runner === 'karma'",
    'test/unit/setup.js': "unit && runner === 'jest'",
    'test/e2e/**/*': 'e2e',
    'src/router/**/*': 'router',
    'src/store/**/*': 'store',
    'dev-script/build-jsdoc.js': 'jsdoc',
    'dev-script/.cz-config.js': 'commitizen',
    'dev-script/verifyCommitMsg.js': 'useGitLint',
    'src/api/**/*': 'axios',
  },
  complete: function(data, { chalk }) {
    const green = chalk.green

      
    sortDependencies(data, green)

    const cwd = path.join(process.cwd(), data.inPlace ? '' : data.destDirName)

    if(data.installGlobalDependencies){
      installGlobalDependencies(cwd, 'npm', green)
        .then(() => {
          if (data.autoInstall) {
            console.log("cwd" + cwd);
            
            installDependencies(cwd, data.autoInstall, green)
              .then(() => {
                return runLintFix(cwd, data, green)
              })
              .then(() => {
                printMessage(data, green)
              })
              .catch(e => {
                console.log(chalk.red('Error:'), e)
              })
          } else {
            printMessage(data, chalk)
          }
        })
        .catch(e => {
          console.log(chalk.red('Error:'), e)
        })
    }
  
  },
}
