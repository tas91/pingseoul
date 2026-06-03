const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });

const hookPath = path.join('.githooks', 'pre-push');
if (fs.existsSync(hookPath)) {
  fs.chmodSync(hookPath, '755');
}

console.log('✅ Git hooks 설정 완료');
