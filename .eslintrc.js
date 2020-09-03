/**
 * To install on a fresh repository:
 * npm i -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-plugin-more eslint-plugin-promise eslint-plugin-simple-import-sort
 */
module.exports =  {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],

  plugins: [
    'jsdoc', // https://github.com/gajus/eslint-plugin-jsdoc
    'promise', // https://github.com/xjamundx/eslint-plugin-promise
    'simple-import-sort', // https://github.com/lydell/eslint-plugin-simple-import-sort
  ],

  rules: {

    /**
     * DISABLED RECOMMENDED RULES
     * 
     * Refer to individual explanations below
     */
    // Conflicts with typedef
    '@typescript-eslint/no-inferrable-types': ['off'],
    // Enables the `any` keywork (use only when extremely necessary)
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-unsafe-assignment': ['off'],
    '@typescript-eslint/no-unsafe-call': ['off'],
    '@typescript-eslint/no-unsafe-member-access': ['off'],
    '@typescript-eslint/no-unsafe-return': ['off'],
    '@typescript-eslint/restrict-template-expressions': ['off'],

    /**
     * CUSTOM ERROR SEVERITY RULES
     * 
     * Raise errors on the followind rules not in
     * the recommended eslint configuration
     */
    // Restricts maximum cyclomatic complexity
    'complexity': ['error', 15 ],
    // Disallow == and !=
    'eqeqeq': ['error'],
    // Disallow duplicates on else if statements
    'no-dupe-else-if': ['error'],
    // Disallow assigning on imports
    'no-import-assign': ['error'],
    // Disallow return setters
    'no-setter-return': ['error'],
    // Disallow throwing types diffente than Error
    'no-throw-literal': ['error'],
    // Disallow .then() .catch() and .finally()
    'promise/prefer-await-to-then': ['error'],

    /**
     * LOWERED SEVERITY RULES
     * 
     * Lowers default level from erro to warn in order to prevent
     * undesired pipeline breaking due to no breaking rules
     */
    // Require functions return type
    '@typescript-eslint/explicit-function-return-type': ['warn'],
    // Must assign properties as public or private
    '@typescript-eslint/explicit-member-accessibility': ['warn'],
    // Require await on async functions
    '@typescript-eslint/require-await': ['warn'],
    // Require type definitions except on arrow functions
    '@typescript-eslint/typedef': ['warn', { arrowParameter: false }],
    // Column length
    'max-len': ['warn', { 'code': 180, 'comments': 180 }],
    // Disallow console.log
    'no-console': ['warn'],
    // Force import ordering
    'simple-import-sort/sort': ['warn'], 

    /**
     * DOCUMENTATION
     * 
     * Requires JSDOC on everything except:
     * • Class and interface declarations
     * • Arrow functions inside methods
     */
    'jsdoc/require-jsdoc': ['warn', {
      checkConstructors: false,
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
      }
    }],
    'jsdoc/check-alignment': ['warn'],
    'jsdoc/check-indentation': ['warn'],
    'jsdoc/check-param-names': ['warn'],
    'jsdoc/check-tag-names': ['warn'],
    'jsdoc/implements-on-classes': ['warn'],
    'jsdoc/no-types': ['warn'],
    'jsdoc/require-description': ['warn'],
    'jsdoc/require-description-complete-sentence': ['warn'],
    'jsdoc/require-param': ['warn'],
    'jsdoc/require-param-name': ['warn'],
    
    /**
     * OPINATED STYLING RULES
     * 
     * Theses represent personal preference and can be altered without
     * any impact. They were designed in order to increase code
     * readability for new contributors
     */
    // Spacing
    '@typescript-eslint/func-call-spacing': ['warn', 'never'],
    '@typescript-eslint/indent': ['warn', 2 ],
    '@typescript-eslint/type-annotation-spacing': ['warn', { before: false, after: true }],
    'array-bracket-spacing': ['warn', 'always'],
    'comma-spacing': ['warn', { 'before': false, 'after': true }],
    'key-spacing': ['warn', { 'beforeColon': false, 'afterColon': true, 'mode': 'strict' }],
    'keyword-spacing': ['warn', { before: true, after: true }],
    'no-multi-spaces': ['warn'],
    'no-trailing-spaces': ['warn'],
    'object-curly-spacing': ['warn', 'always'],
    'space-before-blocks': ['warn', 'always'],
    'space-before-function-paren': ['warn', 'never'],
    'space-infix-ops': ['warn'],
    'spaced-comment': ['warn', 'always'],
    // Line breaking
    '@typescript-eslint/brace-style': ['warn', 'stroustrup', { allowSingleLine: true }],
    'eol-last': ['warn', 'always'],
    'no-multiple-empty-lines': ['warn', { max: 1 }],
    // Commas, semicolons, quotes, parenthesis and brackets
    '@typescript-eslint/quotes': ['warn', 'single', { avoidEscape: true }],
    '@typescript-eslint/semi': ['warn'],
    'comma-dangle': ['warn', 'always-multiline'],
    'curly': ['warn', 'multi-line', 'consistent'],
    'no-extra-parens': ['warn'],

  },
};
