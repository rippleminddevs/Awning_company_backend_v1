'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const promises_1 = __importDefault(require('fs/promises'))
const path_1 = __importDefault(require('path'))
const pluralize_1 = __importDefault(require('pluralize'))
const rootDir = path_1.default.join(__dirname, '..')
async function generateModule() {
  const moduleName = process.argv[2]
  if (!moduleName) {
    console.error('❌ Please provide a module name!')
    return
  }
  const { pascalCase, camelCase, kebabCase } = await import('change-case')
  const singular = pluralize_1.default.singular(moduleName)
  const plural = pluralize_1.default.plural(moduleName)
  const PascalSingular = pascalCase(singular)
  const PascalPlural = pascalCase(plural)
  const camelSingular = camelCase(singular)
  const camelPlural = camelCase(plural)
  const paramSingular = kebabCase(singular)
  const paramPlural = kebabCase(plural)
  const templateDir = path_1.default.join(rootDir, 'generator/bin')
  const outputDir = path_1.default.join(rootDir, 'modules', camelSingular)
  const routesFile = path_1.default.join(rootDir, 'routes.ts')
  // Check if the module directory already exists
  try {
    await promises_1.default.access(outputDir)
    console.error(`❌ Module '${camelSingular}' already exists at ${outputDir}!`)
    return
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
  await promises_1.default.mkdir(outputDir, { recursive: true })
  const templateFiles = await promises_1.default.readdir(templateDir)
  for (const file of templateFiles) {
    const templatePath = path_1.default.join(templateDir, file)
    const content = await promises_1.default.readFile(templatePath, 'utf-8')
    const replacedContent = content
      .replace(/__PascalSingular__/g, PascalSingular)
      .replace(/__PascalPlural__/g, PascalPlural)
      .replace(/__camelSingular__/g, camelSingular)
      .replace(/__camelPlural__/g, camelPlural)
      .replace(/__paramSingular__/g, paramSingular)
      .replace(/__paramPlural__/g, paramPlural)
    const newFileName = file.replace('module', camelSingular).replace('.txt', '.ts')
    const newFilePath = path_1.default.join(outputDir, newFileName)
    await promises_1.default.writeFile(newFilePath, replacedContent, 'utf-8')
    console.log(`✅ Created: ${newFilePath}`)
  }
  try {
    let routesContent = await promises_1.default.readFile(routesFile, 'utf-8')
    const importLine = `import ${camelSingular}Routes from './modules/${camelSingular}/${camelSingular}Routes'`
    const routeLine = `this.router.use('/${paramPlural}', ${camelSingular}Routes)`
    routesContent = routesContent
      .replace('// {{modulePath}}', `${importLine}\n// {{modulePath}}`)
      .replace('// {{moduleRoute}}', `${routeLine}\n    // {{moduleRoute}}`)
    await promises_1.default.writeFile(routesFile, routesContent, 'utf-8')
    console.log(`✅ Updated: ${routesFile} with ${camelSingular} route`)
  } catch (error) {
    console.error(`❌ Failed to update ${routesFile}: ${error.message}`)
    return
  }
}
generateModule().catch(console.error)
