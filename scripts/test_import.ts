async function main() {
  const bcrypt = await import("bcryptjs");
  console.log("Keys on bcrypt:", Object.keys(bcrypt));
  console.log("Is compare a function on bcrypt?", typeof bcrypt.compare === "function");
  console.log("Is compare a function on bcrypt.default?", bcrypt.default && typeof bcrypt.default.compare === "function");
}
main();
