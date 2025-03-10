const playwright = require('playwright');
const path = require('path');
const webpack = require('webpack');

const CI = Boolean(process.env.CI);
// renovate PRs are based off of  upstream branches.
// Their CI run will be a branch based run not PR run and therefore won't have a CIRCLE_PR_NUMBER
const isPR = Boolean(process.env.CIRCLE_PULL_REQUEST);

let build = `material-ui local ${new Date().toISOString()}`;

if (process.env.CIRCLECI) {
  const buildPrefix =
    process.env.CIRCLE_PR_NUMBER !== undefined
      ? process.env.CIRCLE_PR_NUMBER
      : process.env.CIRCLE_BRANCH;
  build = `${buildPrefix}: ${process.env.CIRCLE_BUILD_URL}`;
}

const browserStack = {
  // |commits in PRs| >> |Merged commits|.
  // Since we have limited ressources on BrowserStack we often time out on PRs.
  // However, BrowserStack rarely fails with a true-positive so we use it as a stop gap for release not merge.
  // But always enable it locally since people usually have to explicitly have to expose their BrowserStack access key anyway.
  enabled: !CI || !isPR || process.env.BROWSERSTACK_FORCE === 'true',
  username: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  build,
  // https://github.com/browserstack/api#timeout300
  timeout: 10 * 60, // Maximum time before a worker is terminated. Default 5 minutes.
};

process.env.CHROME_BIN = playwright.chromium.executablePath();

// BrowserStack rate limit after 1600 calls every 5 minutes.
// Per second, https://www.browserstack.com/docs/automate/api-reference/selenium/introduction#rest-api-projects
const MAX_REQUEST_PER_SECOND_BROWSERSTACK = 1600 / (60 * 5);
// Estimate the max number of concurrent karma builds
// For each PR, 6 concurrent builds are used, only one is usng BrowserStack.
const AVERAGE_KARMA_BUILD = 1 / 6;
// CircleCI accepts up to 83 concurrent builds.
const MAX_CIRCLE_CI_CONCURRENCY = 83;

// Karma configuration
module.exports = function setKarmaConfig(config) {
  const baseConfig = {
    basePath: '../',
    browsers: ['chromeHeadless'],
    browserDisconnectTimeout: 3 * 60 * 1000, // default 2000
    browserDisconnectTolerance: 1, // default 0
    browserNoActivityTimeout: 3 * 60 * 1000, // default 30000
    colors: true,
    coverageIstanbulReporter: {
      combineBrowserReports: true,
      dir: path.resolve(__dirname, '../coverage'),
      fixWebpackSourcePaths: true,
      reports: CI ? ['lcov'] : [],
      skipFilesWithNoCoverage: true,
      verbose: false,
    },
    client: {
      mocha: {
        // Some BrowserStack browsers can be slow.
        timeout: (process.env.CIRCLECI === 'true' ? 6 : 2) * 1000,
      },
    },
    frameworks: ['mocha', 'webpack'],
    files: [
      {
        pattern: 'test/karma.tests.js',
        watched: false,
      },
      {
        pattern: 'test/assets/*.png',
        watched: false,
        included: false,
        served: true,
      },
    ],
    plugins: [
      'karma-mocha',
      'karma-chrome-launcher',
      'karma-coverage-istanbul-reporter',
      'karma-sourcemap-loader',
      'karma-webpack',
    ],
    /**
     * possible values:
     * - config.LOG_DISABLE
     * - config.LOG_ERROR
     * - config.LOG_WARN
     * - config.LOG_INFO
     * - config.LOG_DEBUG
     */
    logLevel: config.LOG_INFO,
    port: 9876,
    preprocessors: {
      'test/karma.tests.js': ['webpack', 'sourcemap'],
    },
    proxies: {
      '/fake.png': '/base/test/assets/fake.png',
      '/fake2.png': '/base/test/assets/fake2.png',
    },
    // The CI branch fixes double log issue
    // https://github.com/karma-runner/karma/issues/2342
    reporters: ['dots', ...(CI ? ['coverage-istanbul'] : [])],
    webpack: {
      mode: 'development',
      devtool: CI ? 'inline-source-map' : 'eval-source-map',
      optimization: {
        nodeEnv: 'test',
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.CI': JSON.stringify(process.env.CI),
          'process.env.KARMA': JSON.stringify(true),
          'process.env.TEST_GATE': JSON.stringify(process.env.TEST_GATE),
        }),
        new webpack.ProvidePlugin({
          // required by enzyme > cheerio > parse5 > util
          process: 'process/browser.js',
        }),
      ],
      module: {
        rules: [
          {
            test: /\.(js|ts|tsx)$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            options: {
              envName: 'stable',
            },
          },
          // transpile 3rd party packages with dependencies in this repository
          {
            test: /\.(js|mjs|jsx)$/,
            include:
              /node_modules(\/|\\)(notistack|@mui(\/|\\)x-data-grid|@mui(\/|\\)x-data-grid-pro|@mui(\/|\\)x-license-pro|@mui(\/|\\)x-data-grid-generator|@mui(\/|\\)x-date-pickers-pro|@mui(\/|\\)x-date-pickers)/,
            use: {
              loader: 'babel-loader',
              options: {
                // We have to apply `babel-plugin-module-resolve` to the files in `@mui/x-date-pickers`.
                // Otherwise we can't import `@mui/material` from `@mui/x-date-pickers` in `yarn test:karma`.
                sourceType: 'unambiguous',
                plugins: [
                  [
                    'babel-plugin-module-resolver',
                    {
                      alias: {
                        // all packages in this monorepo
                        '@mui/material': './packages/mui-material/src',
                        '@mui/docs': './packages/mui-docs/src',
                        '@mui/icons-material': './packages/mui-icons-material/lib',
                        '@mui/lab': './packages/mui-lab/src',
                        '@mui/styled-engine': './packages/mui-styled-engine/src',
                        '@mui/styles': './packages/mui-styles/src',
                        '@mui/system': './packages/mui-system/src',
                        '@mui/private-theming': './packages/mui-private-theming/src',
                        '@mui/utils': './packages/mui-utils/src',
                        '@mui/base': './packages/mui-base/src',
                        '@mui/material-next': './packages/mui-material-next/src',
                        '@mui/joy': './packages/mui-joy/src',
                      },
                      transformFunctions: ['require'],
                    },
                  ],
                ],
              },
            },
          },
          {
            test: /\.(js|ts|tsx)$/,
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true },
            },
            enforce: 'post',
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        fallback: {
          // needed by sourcemap
          fs: false,
          path: false,
          // needed by enzyme > cheerio
          stream: false,
        },
      },
      // TODO: 'browserslist:modern'
      // See https://github.com/webpack/webpack/issues/14203
      target: 'web',
    },
    customLaunchers: {
      chromeHeadless: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
    singleRun: CI,
  };

  let newConfig = baseConfig;

  if (browserStack.enabled && browserStack.accessKey) {
    newConfig = {
      ...baseConfig,
      browserStack,
      browsers: baseConfig.browsers.concat(['chrome', 'firefox', 'safari', 'edge']),
      plugins: baseConfig.plugins.concat(['karma-browserstack-launcher']),
      customLaunchers: {
        ...baseConfig.customLaunchers,
        chrome: {
          base: 'BrowserStack',
          os: 'OS X',
          os_version: 'Catalina',
          browser: 'chrome',
          // We support Chrome 90.x
          // However, >=88 fails on seemingly all focus-related tests.
          // TODO: Investigate why.
          browser_version: '87.0',
        },
        firefox: {
          base: 'BrowserStack',
          os: 'Windows',
          os_version: '10',
          browser: 'firefox',
          browser_version: '78.0',
        },
        safari: {
          base: 'BrowserStack',
          os: 'OS X',
          os_version: 'Catalina',
          browser: 'safari',
          // We support 12.5 on iOS.
          // However, 12.x is very flaky on desktop (mobile is always flaky).
          browser_version: '13.0',
        },
        edge: {
          base: 'BrowserStack',
          os: 'Windows',
          os_version: '10',
          browser: 'edge',
          browser_version: '91.0',
        },
      },
    };

    // -1 because chrome headless runs in the local machine
    const browserStackBrowsersUsed = newConfig.browsers.length - 1;

    // default 1000, Avoid Rate Limit Exceeded
    newConfig.browserStack.pollingTimeout =
      ((MAX_CIRCLE_CI_CONCURRENCY * AVERAGE_KARMA_BUILD * browserStackBrowsersUsed) /
        MAX_REQUEST_PER_SECOND_BROWSERSTACK) *
      1000;
  }

  config.set(newConfig);
};
