module.exports = {
  jest: {
    configure: {
      moduleNameMapper: {
        "^axios$": "<rootDir>/__mocks__/axios.js",
      },
    },
  },
};
