module.exports = {
  "env": {
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": "airbnb-base",
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018
  },
  "rules": {
    "camelcase": "off",
    // "class-methods-use-this": "off",
    "comma-dangle": ["error", {
      "functions": "ignore",
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "always-multiline",
      "exports": "always-multiline",
    }],
    // "consistent-return": "off",
    // "dot-notation": "off",
    "func-names": "off",
    // "global-require": "off",
    // "guard-for-in": "off",
    // "import/newline-after-import": "off",
    "import/no-dynamic-require": "off",
    // "import/order": "off",
    "max-len": [
      "warn",
      {
        "code": 120,
        "ignoreComments": false,
        "ignoreRegExpLiterals": true,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true,
        "ignoreTrailingComments": false,
        "ignoreUrls": true,
        "tabWidth": 2
      }
    ],
    // "new-cap": "off",
    "newline-per-chained-call": "off",
    // "no-bitwise": "off",
    // "no-buffer-constructor": "off",
    // "no-cond-assign": "off",
    // "no-confusing-arrow": "off",
    "no-console": "off",
    // "no-dupe-keys": "off",
    // "no-else-return": "off",
    // "no-empty": "off",
    // "no-empty-function": "off",
    // "no-lonely-if": "off",
    // "no-loop-func": "off",
    // "no-mixed-operators": "off",
    // "no-multi-assign": "off",
    "no-param-reassign": "off",
    "no-plusplus": "off",
    "no-prototype-builtins": "off",
    // "no-restricted-syntax": "off",
    // "no-return-assign": "off",
    // "no-shadow": "off",
    "no-throw-literal": "off",
    // "no-unreachable": "off",
    "no-unused-vars": ["error", {
      "args": "none",
      "caughtErrors": "none"
    }],
    "no-trailing-spaces": ['error',{
      "skipBlankLines" : true
    }],
    "no-use-before-define": "off",
    "no-useless-concat": "off",
    "no-useless-constructor": "off",
    "no-useless-escape": "off",
    "no-var": "off",
    "no-void": "off",
    "object-curly-newline": [
      "error",
      {
        "consistent": true
      }
    ],
    "object-shorthand": "off",
    "one-var": "off",
    "one-var-declaration-per-line": "off",
    "operator-assignment": "off",
    "prefer-arrow-callback": "off",
    "prefer-const": "off",
    "prefer-destructuring": "off",
    "prefer-template": "off",
    "quote-props": "off",
    "quotes": "off",
    "radix": "off",
    "vars-on-top": "off",
    "wrap-iife": "off"
  }
}
