import { runAllSeeds, runModuleSeed } from './seeds/index.js';

const moduleName = process.env.SEED_MODULE;
if (moduleName) {
  console.log(`🌱 Running seed module: ${moduleName}`);
  await runModuleSeed(moduleName);
} else {
  await runAllSeeds();
}