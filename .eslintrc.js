/*
DEPENDENCIES
npm i -D `
  @typescript-eslint/eslint-plugin `
  @typescript-eslint/parser `
  eslint `
  eslint-plugin-jsdoc `
  eslint-plugin-more `
  eslint-plugin-promise `
  eslint-plugin-simple-import-sort `
  eslint-plugin-unicorn `
  eslint-plugin-unused-imports
*/

module.exports =  {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },

  /**
   * BASE RULES
   * These extensions defines the full set of starting rules
   * Additions and exclusions are in 'rules' property
   */
  extends: [
    'eslint:recommended', // https://eslint.org/docs/rules/
    'plugin:@typescript-eslint/recommended', // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // ^ ditto
    'plugin:jest/recommended', // https://github.com/jest-community/eslint-plugin-jest#rules
    'plugin:unicorn/recommended', // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/master/index.js
  ],

  plugins: [
    'jest', // https://github.com/jest-community/eslint-plugin-jest
    'jsdoc', // https://github.com/gajus/eslint-plugin-jsdoc
    'promise', // https://github.com/xjamundx/eslint-plugin-promise
    'simple-import-sort', // https://github.com/lydell/eslint-plugin-simple-import-sort
    'unicorn', // https://github.com/sindresorhus/eslint-plugin-unicorn
    'unused-imports', // https://github.com/sweepline/eslint-plugin-unused-imports
  ],

  rules: {

    /**
     * DISABLED RULES
     * These were included in byt the 'extends' property.
     */
    '@typescript-eslint/no-inferrable-types': [ 'off' ], // Collides with typedef
    '@typescript-eslint/explicit-module-boundary-types': [ 'off' ], // Enables the 'any' keyword on arguments
    '@typescript-eslint/no-explicit-any': [ 'off' ], // Enables the 'any' keyword on declarations
    '@typescript-eslint/no-unsafe-assignment': [ 'off' ], // Enables 'any' typed variables on assignments
    '@typescript-eslint/no-unsafe-call': [ 'off' ], // Enables the 'any' typed variables as parameters
    '@typescript-eslint/no-unsafe-member-access': [ 'off' ], // Enables nesting properties on 'any' type
    '@typescript-eslint/no-unsafe-return': [ 'off' ], // Enables 'any' typed variables on returns
    '@typescript-eslint/restrict-template-expressions': [ 'off' ], // Complicates handling Error objects
    'unicorn/catch-error-name': [ 'off' ], // Allow using 'e' on catch instead of forced 'error'
    'unicorn/no-null': [ 'off' ], // Allow using 'null', useful for returning strict DTO
    'unicorn/no-reduce': [ 'off' ], // Allow using .reduce() method of Arrays
    'unicorn/prevent-abbreviations': [ 'off' ], // Allow common abbreviations (param, err, etc)

    /**
     * ADDED ERROR SEVERITY RULES
     * New rules that should raise an 'error'.
     */
    'complexity': [ 'error', 15 ], // Restricts maximum cyclomatic complexity
    'eqeqeq': [ 'error' ], // Disallow == and !=
    'no-dupe-else-if': [ 'error' ], // Disallow duplicates on else if statements
    'no-import-assign': [ 'error' ], // Disallow assigning on imports
    'no-setter-return': [ 'error' ], // Disallow returning on setters
    'no-throw-literal': [ 'error' ], // Disallow throwing types different than Error
    'promise/prefer-await-to-then': [ 'error' ], // Disallow .then()
    'unicorn/no-unsafe-regex': [ 'error' ], // Prevent regex that may lead to catasthrophic backtracking

    /**
     * LOWERED SEVERITY RULES
     * These were included as 'error' and have been lowered to 'warn'.
     */
    '@typescript-eslint/explicit-function-return-type': [ 'warn' ], // Require functions return type
    '@typescript-eslint/explicit-member-accessibility': [ 'warn' ], // Must assign properties as public or private
    '@typescript-eslint/require-await': [ 'warn' ], // Require await on async functions
    '@typescript-eslint/typedef': [ 'warn', { arrowParameter: false } ], // Require type definitions except on arrow functions

    /**
     * ADDED WARNING SEVERITY RULES
     * New rules that should raise a 'warn'.
     */
    '@typescript-eslint/array-type': [ 'warn' ], // Enforces consistent array declaration
    '@typescript-eslint/prefer-optional-chain': [ 'warn' ], // Enforces consistent array declaration
    'max-len': [ 'warn', { code: 120, comments: 120 } ], // Maximum column length
    'no-console': [ 'warn' ], // Disallow console.log
    'simple-import-sort/sort': [ 'warn' ], // Force import ordering
    'unused-imports/no-unused-imports-ts': [ 'warn' ], // Disallow unused imported modules

    /**
     * DOCUMENTATION RULES
     * Failure to comply should raise a 'warn'
     * • Must be present at all methods except top level classes
     * • Must obey correct indentation
     * • Must start with capital letter and end with a dot
     */
    'jsdoc/require-jsdoc': [ 'warn', {
      checkConstructors: false,
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
      }
    }],
    'jsdoc/check-alignment': [ 'warn' ],
    'jsdoc/check-indentation': [ 'warn' ],
    'jsdoc/check-param-names': [ 'warn' ],
    'jsdoc/check-tag-names': [ 'warn' ],
    'jsdoc/implements-on-classes': [ 'warn' ],
    'jsdoc/no-types': [ 'warn' ],
    'jsdoc/require-description': [ 'warn' ],
    'jsdoc/require-description-complete-sentence': [ 'warn' ],
    'jsdoc/require-param': [ 'warn' ],
    'jsdoc/require-param-name': [ 'warn' ],

    /**
     * NAMING CONVENTION RULES
     * Enforces consistent casing according to declaration type
     */
    '@typescript-eslint/naming-convention': [ 'warn',
      { selector: 'variable', format: ['strictCamelCase'] },
      { selector: 'function', format: ['strictCamelCase'] },
      { selector: 'parameter', format: ['strictCamelCase'] },
      { selector: 'property', format: ['strictCamelCase', 'snake_case'] },
      { selector: 'property', modifiers: [ 'readonly' ], format: [ 'UPPER_CASE' ] },
      { selector: 'parameterProperty', format: ['strictCamelCase', 'snake_case'] },
      { selector: 'method', format: ['strictCamelCase'] },
      { selector: 'accessor', format: ['strictCamelCase'] },
      { selector: 'enumMember', format: ['UPPER_CASE'] },
      { selector: 'class', format: ['StrictPascalCase'] },
      { selector: 'interface', format: ['StrictPascalCase'] },
      { selector: 'typeAlias', format: ['StrictPascalCase'] },
      { selector: 'enum', format: ['StrictPascalCase'] },
      { selector: 'typeParameter', format: ['StrictPascalCase'] },
    ],

    /**
     * STYLING RULES
     * Theses represent personal preference and should not pose any impact.
     * Nevertheless they should raise a 'warn' if not obeyed.
     */

    // Spacing
    '@typescript-eslint/func-call-spacing': [ 'warn', 'never' ],
    '@typescript-eslint/indent': [ 'warn', 2 ],
    '@typescript-eslint/type-annotation-spacing': [ 'warn' ],
    'array-bracket-spacing': [ 'warn', 'always' ],
    'comma-spacing': [ 'warn', { before: false, after: true }],
    'key-spacing': [ 'warn', { beforeColon: false, afterColon: true, mode: 'strict' }],
    'keyword-spacing': [ 'warn', { before: true, after: true }],
    'no-multi-spaces': [ 'warn' ],
    'no-trailing-spaces': [ 'warn' ],
    'object-curly-spacing': [ 'warn', 'always' ],
    'semi-spacing': [ 'warn' ],
    'space-before-blocks': [ 'warn', 'always' ],
    'space-before-function-paren': [ 'warn', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
    'space-in-parens': ['warn', 'never' ],
    'space-infix-ops': [ 'warn' ],
    'spaced-comment': [ 'warn', 'always' ],

    // Line breaking
    '@typescript-eslint/brace-style': [ 'warn', 'stroustrup', { allowSingleLine: true }],
    'eol-last': [ 'warn', 'always' ],
    'no-multiple-empty-lines': [ 'warn', { max: 1 }],
    'object-property-newline': [ 'warn', { allowAllPropertiesOnSameLine : true } ],
    'object-curly-newline': [ 'warn', {
      ObjectExpression: { minProperties: 4, multiline: true, consistent: true },
      ObjectPattern: { minProperties: 4, multiline: true, consistent: true },
      ImportDeclaration: 'never',
      ExportDeclaration: 'never',
    } ],

    // Commas, semicolons, quotes, parenthesis and brackets
    '@typescript-eslint/quotes': [ 'warn', 'single', { avoidEscape: true }],
    '@typescript-eslint/member-delimiter-style': [ 'warn' ],
    '@typescript-eslint/semi': [ 'warn' ],
    'comma-dangle': [ 'warn', 'always-multiline' ],
    'curly': [ 'warn', 'multi-line', 'consistent' ],
    'no-extra-parens': [ 'warn' ],    
  },

};
