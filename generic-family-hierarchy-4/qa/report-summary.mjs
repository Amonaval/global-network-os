import fs from 'node:fs';
console.log(fs.existsSync('qa-results/BUG-REPORT.md')?'QA report: qa-results/BUG-REPORT.md':'No BUG-REPORT.md yet. Run a Playwright QA command first.');
console.log(fs.existsSync('qa-results/html/index.html')?'HTML report: qa-results/html/index.html':'HTML report not generated yet.');
