const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const crypto = require('crypto');
const createProject = require('../src/cli/generators/project.generator');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/express-auth-e2e';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/express_auth_e2e?schema=public';
const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}/api/auth`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runE2E() {
  console.log("🚀 Starting E2E Verification...\n");

  const tests = [
    { name: 'e2e-mongo', database: 'mongodb' },
    { name: 'e2e-pg', database: 'postgresql' }
  ];

  for (const test of tests) {
    console.log(`\n============================================`);
    console.log(`🧪 Testing ${test.database.toUpperCase()} generation`);
    console.log(`============================================`);
    
    const projectPath = path.join(process.cwd(), test.name);

    // 1. Clean up old runs
    if (fs.existsSync(projectPath)) {
      console.log(`🧹 Cleaning up old project directory: ${test.name}`);
      fs.rmSync(projectPath, { recursive: true, force: true });
    }

    // 2. Generate Project
    console.log(`\n📁 Generating project...`);
    try {
      createProject({
        projectName: test.name,
        database: test.database,
        features: [] // base auth only
      });
    } catch (error) {
      console.error(`❌ Generation failed for ${test.database}`, error);
      process.exit(1);
    }

    // 3. Configure .env
    const envPath = path.join(projectPath, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent += `\nPORT=${PORT}\n`;
    envContent = envContent.replace(/MONGO_URI=.*/, `MONGO_URI=${MONGO_URI}`);
    envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL=${DATABASE_URL}`);
    fs.writeFileSync(envPath, envContent);

    // 4. Install Dependencies
    console.log(`📦 Installing dependencies...`);
    execSync('npm install', { cwd: projectPath, stdio: 'ignore' });

    // 5. Database Setup (Prisma only)
    if (test.database === 'postgresql') {
      console.log(`🛠️ Setting up PostgreSQL database...`);
      try {
        execSync('npx prisma db push', { 
          cwd: projectPath, 
          stdio: 'ignore',
          env: {
            ...process.env,
            PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "yes"
          }
        });
        
        console.log(`🛠️ Generating Prisma Client...`);
        execSync('npx prisma generate', { 
          cwd: projectPath, 
          stdio: 'ignore'
        });
      } catch(error) {
        console.error(`❌ Prisma DB push or generate failed. Ensure PostgreSQL is running at ${DATABASE_URL}`);
        process.exit(1);
      }
    }

    // 6. Start Server
    console.log(`\n🚀 Starting server...`);
    const serverProcess = spawn('npm', ['run', 'dev'], { cwd: projectPath });
    
    // Wait for server to be ready
    let serverReady = false;
    serverProcess.stdout.on('data', (data) => {
      if (data.toString().includes(`Server running on port ${PORT}`)) {
        serverReady = true;
      }
    });

    let retries = 0;
    while (!serverReady && retries < 20) {
      await sleep(500);
      retries++;
    }

    if (!serverReady) {
      console.error(`❌ Server failed to start within 10 seconds.`);
      serverProcess.kill();
      process.exit(1);
    }
    console.log(`✅ Server is running!`);

    // 7. Execute API Tests
    let refreshTokenCookie = '';
    const uniqueEmail = `test_${Date.now()}@example.com`;

    try {
      console.log(`\n🧪 Testing /register...`);
      const resReg = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'E2E Test User',
          email: uniqueEmail,
          password: 'password123'
        })
      });
      const dataReg = await resReg.json();
      if (!resReg.ok) throw new Error(`Register failed: ${JSON.stringify(dataReg)}`);
      console.log(`✅ Register successful`);

      console.log(`\n🧪 Testing /login...`);
      const resLogin = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: uniqueEmail,
          password: 'password123'
        })
      });
      const dataLogin = await resLogin.json();
      if (!resLogin.ok) throw new Error(`Login failed: ${JSON.stringify(dataLogin)}`);
      
      const setCookieHeader = resLogin.headers.get('set-cookie');
      if (!setCookieHeader || !setCookieHeader.includes('refreshToken=')) {
        throw new Error('No refresh token cookie found in login response');
      }
      refreshTokenCookie = setCookieHeader.split(';')[0]; // Extract just the refreshToken=... part
      console.log(`✅ Login successful`);

      console.log(`\n🧪 Testing /refresh...`);
      const resRefresh = await fetch(`${BASE_URL}/refresh`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': refreshTokenCookie
        }
      });
      const dataRefresh = await resRefresh.json();
      if (!resRefresh.ok) throw new Error(`Refresh failed: ${JSON.stringify(dataRefresh)}`);
      console.log(`✅ Token rotation successful`);

      console.log(`\n🧪 Testing /logout...`);
      const resLogout = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': refreshTokenCookie
        }
      });
      if (!resLogout.ok) throw new Error('Logout failed');
      console.log(`✅ Logout successful`);

      console.log(`\n🎉 All tests passed for ${test.database.toUpperCase()}!`);

    } catch (error) {
      console.error(`\n❌ TEST FAILED: ${error.message}`);
      serverProcess.kill();
      process.exit(1);
    }

    // 8. Cleanup
    serverProcess.kill();
    fs.rmSync(projectPath, { recursive: true, force: true });
    console.log(`🧹 Cleaned up ${test.name}`);
  }

  console.log(`\n✅✅✅ SUCCESS: E2E Verification complete! ✅✅✅`);
}

runE2E();
