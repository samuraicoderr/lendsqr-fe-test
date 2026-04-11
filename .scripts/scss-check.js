const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// find all .scss files
const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith(".scss")) {
      results.push(filePath);
    }
  });

  return results;
};

const files = walk("src");
const CONCURRENCY = 4;

let active = 0;
let index = 0;
let errorCount = 0;
let hasError = false;

// 🧠 store results by index
const results = new Array(files.length);

console.log(`\n🔍 Checking ${files.length} SCSS files (concurrent: ${CONCURRENCY})...\n`);

const runNext = () => {
  if (index >= files.length && active === 0) {
    // ✅ PRINT CLEAN RESULTS IN ORDER
    results.forEach((res, i) => {
      if (!res) return;

      if (res.ok) {
        console.log(`✅ [${i + 1}/${files.length}] ${res.file}`);
      } else {
        console.log(`❌ [${i + 1}/${files.length}] ${res.file}\n`);
        console.log(res.error);
        console.log("\n-----------------------------\n");
      }
    });

    console.log("\n=============================");

    if (hasError) {
      console.error(`🚨 SCSS CHECK FAILED (${errorCount} files broken)\n`);
      process.exit(1);
    } else {
      console.log("✅ All SCSS files compiled successfully\n");
    }

    return;
  }

  while (active < CONCURRENCY && index < files.length) {
    const fileIndex = index;
    const file = files[index++];

    active++;

    exec(`npx sass "${file}" > NUL`, (err, stdout, stderr) => {
      active--;

      if (err) {
        hasError = true;
        errorCount++;

        const cleaned = stderr
          .split("\n")
          .filter((line) => !line.includes("node_modules"))
          .slice(0, 12)
          .join("\n");

        results[fileIndex] = {
          ok: false,
          file,
          error: cleaned,
        };
      } else {
        results[fileIndex] = {
          ok: true,
          file,
        };
      }

      runNext();
    });
  }
};

runNext();