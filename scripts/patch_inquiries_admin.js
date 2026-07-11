// patch_inquiries_admin.js
const fs = require('fs');
const path = 'd:/freelance/phucuong-server/src/modules/inquiries/inquiries-admin.service.ts';
let src = fs.readFileSync(path, 'utf8');

const oldBlock = /const \[\r?\n      totals,\r?\n      byStep,\r?\n      daySeries,\r?\n      topCountries,\r?\n      topProducts,\r?\n      staffPerf,\r?\n      emails,\r?\n      emailsPending,\r?\n    \] = await Promise\.all\(\[\r?\n      this\.countTotals\(\),\r?\n      this\.buildFunnel\(\),\r?\n      this\.buildDaySeries\(since\),\r?\n      this\.buildTopCountries\(10\),\r?\n      this\.buildTopProducts\(10\),\r?\n      this\.buildStaffPerformance\(10\),\r?\n      this\.countEmails\(\),\r?\n      Promise\.all\(\[\r?\n        this\.emailOutboxRepo\.count\(\{ where: \{ status: EmailOutboxStatus\.PENDING \} \}\),\r?\n        this\.emailOutboxRepo\.count\(\{ where: \{ status: EmailOutboxStatus\.FAILED \} \}\),\r?\n      \]\),\r?\n    \]\);/;

const newBlock = `const totals = await this.countTotals();
    const byStep = await this.buildFunnel();
    const daySeries = await this.buildDaySeries(since);
    const topCountries = await this.buildTopCountries(10);
    const topProducts = await this.buildTopProducts(10);
    const staffPerf = await this.buildStaffPerformance(10);
    const emails = await this.countEmails();
    const pendingOutbox = await this.emailOutboxRepo.count({
      where: { status: EmailOutboxStatus.PENDING },
    });
    const failedOutbox = await this.emailOutboxRepo.count({
      where: { status: EmailOutboxStatus.FAILED },
    });`;

const matches = src.match(oldBlock);
if (!matches) {
  console.error('NO MATCH found for getStats. Aborting.');
  process.exit(1);
}
console.log('Matches found:', matches.length);
if (matches.length > 1) {
  console.error('Multiple matches. Aborting.');
  process.exit(2);
}

let replaced = src.replace(oldBlock, newBlock);

// Remove the now-unused "const [pendingOutbox, failedOutbox] = emailsPending;" line
const dangling = /\r?\n    const \[pendingOutbox, failedOutbox\] = emailsPending;\r?\n/;
if (replaced.match(dangling)) {
  replaced = replaced.replace(dangling, '\r\n');
  console.log('Removed dangling destructure line.');
}

fs.writeFileSync(path, replaced, 'utf8');
console.log('OK. New file length:', replaced.length);