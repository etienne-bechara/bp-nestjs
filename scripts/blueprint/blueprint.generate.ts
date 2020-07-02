import { argv } from 'yargs';
import fs from 'fs-extra';
import globby from 'globby';
import { dotCase, pascalCase, snakeCase, camelCase } from 'change-case';

/**
 * Creates a folder inside ./source that matches
 * desired blueprint and replace it variables
 */
function generateBlueprint(): void {
  try {
    const type = argv.type || argv.t;
    if (type === 'crud') return generateCrud();
    else return printError('missing blueprint type [--type, -t]');
  }
  catch (e) {
    return printError(e.message);
  }
}


/**
 * Copy all files inside CRUD folder to project ./source,
 * renaming according to provided domain name
 * Then replace all placeholder with domain name according
 * to desired case
 */
function generateCrud(): void {
  const name = argv.name || argv.n;
  if (!name) return printError('missing crud service name [--name, -n]');

  globby.sync('./crud/**/*', { cwd: __dirname }).map((file) => {

    const source = file.replace('./', './scripts/blueprint/');
    const destination = file.replace('./', './source/').replace(/crud/g, dotCase(name));
    
    const content = fs.readFileSync(source, 'utf8');
    const replaced = content
      .replace(/__PascalCaseName__/g, pascalCase(name))
      .replace(/__SnakeCaseName__/g, snakeCase(name))
      .replace(/__CamelCaseName__/g, camelCase(name))
      .replace(/__DotCaseName__/g, dotCase(name))

    fs.ensureFileSync(destination);
    fs.writeFileSync(destination, replaced, 'utf8');
  });
  

}

/**
 * Prints an error message
 * @param message 
 */
function printError(message: string): void {
  console.error(`
  
  Blueprint Generation Failed!

  Error: ${message}
  
  `);
}

void generateBlueprint()