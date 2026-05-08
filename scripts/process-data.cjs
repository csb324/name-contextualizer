'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const TMP_DIR = path.join(ROOT, 'tmp');
const ZIP_PATH = path.join(TMP_DIR, 'names.zip');
const EXTRACT_DIR = path.join(TMP_DIR, 'names_data');
const OUTPUT_DIR = path.join(ROOT, 'public', 'data');

const ZIP_URL = 'https://www.ssa.gov/oact/babynames/names.zip';
const START_YEAR = 1975;
const TOP_N = 1000;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);
    try {
      execSync(
        `curl -L -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -o "${dest}" "${url}"`,
        { stdio: 'inherit' }
      );
      resolve();
    } catch (err) {
      reject(new Error(`curl failed: ${err.message}`));
    }
  });
}

function parseYearFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8').trim();
  if (!text) return { girls: [], boys: [] };

  const records = text.split('\n').map(line => {
    const parts = line.trim().split(',');
    return { name: parts[0], sex: parts[1], count: parseInt(parts[2], 10) };
  }).filter(r => r.name && r.sex && !isNaN(r.count));

  return {
    girls: records.filter(r => r.sex === 'F'),
    boys: records.filter(r => r.sex === 'M'),
  };
}

async function main() {
  ensureDir(TMP_DIR);
  ensureDir(EXTRACT_DIR);
  ensureDir(OUTPUT_DIR);

  if (!fs.existsSync(ZIP_PATH)) {
    await download(ZIP_URL, ZIP_PATH);
  } else {
    console.log('Using cached zip file (delete tmp/names.zip to re-download).');
  }

  console.log('Extracting...');
  execSync(`unzip -o "${ZIP_PATH}" -d "${EXTRACT_DIR}"`, { stdio: 'pipe' });

  const files = fs.readdirSync(EXTRACT_DIR);
  const availableYears = files
    .map(f => {
      const m = f.match(/^yob(\d{4})\.txt$/);
      return m ? parseInt(m[1], 10) : null;
    })
    .filter(y => y !== null && y >= START_YEAR)
    .sort((a, b) => a - b);

  if (availableYears.length === 0) {
    throw new Error('No year files found in the extracted zip.');
  }

  console.log(
    `Processing ${availableYears.length} years (${availableYears[0]}–${availableYears[availableYears.length - 1]})...`
  );

  const girlsOutput = { years: availableYears, data: {} };
  const boysOutput = { years: availableYears, data: {} };

  for (const year of availableYears) {
    const filePath = path.join(EXTRACT_DIR, `yob${year}.txt`);
    const { girls, boys } = parseYearFile(filePath);
    const yearStr = String(year);

    const girlTotal = girls.reduce((s, r) => s + r.count, 0);
    const boyTotal = boys.reduce((s, r) => s + r.count, 0);

    girls.slice(0, TOP_N).forEach((r, i) => {
      if (!girlsOutput.data[r.name]) girlsOutput.data[r.name] = {};
      girlsOutput.data[r.name][yearStr] = [
        i + 1,
        r.count,
        parseFloat(((r.count / girlTotal) * 100).toFixed(2)),
      ];
    });

    boys.slice(0, TOP_N).forEach((r, i) => {
      if (!boysOutput.data[r.name]) boysOutput.data[r.name] = {};
      boysOutput.data[r.name][yearStr] = [
        i + 1,
        r.count,
        parseFloat(((r.count / boyTotal) * 100).toFixed(2)),
      ];
    });
  }

  const girlsPath = path.join(OUTPUT_DIR, 'girls.json');
  const boysPath = path.join(OUTPUT_DIR, 'boys.json');

  fs.writeFileSync(girlsPath, JSON.stringify(girlsOutput));
  fs.writeFileSync(boysPath, JSON.stringify(boysOutput));

  const girlsMB = (fs.statSync(girlsPath).size / 1024 / 1024).toFixed(2);
  const boysMB = (fs.statSync(boysPath).size / 1024 / 1024).toFixed(2);

  console.log(`Done!`);
  console.log(`  girls.json: ${girlsMB} MB`);
  console.log(`  boys.json:  ${boysMB} MB`);
  console.log(`\nUnique girl names: ${Object.keys(girlsOutput.data).length}`);
  console.log(`Unique boy names:  ${Object.keys(boysOutput.data).length}`);
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
