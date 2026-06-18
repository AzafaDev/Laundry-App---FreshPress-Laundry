export default async function globalSetup() {
  process.env.NODE_ENV = "test";
  console.log("\n[Test Suite] Starting — hits Neon production DB. Each test cleans up after itself.");
}
