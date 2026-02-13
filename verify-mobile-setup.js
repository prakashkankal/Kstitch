import { networkInterfaces } from 'os';
import { readFileSync, existsSync } from 'fs';

console.log('='.repeat(50));
console.log('📱 KStitch Mobile Access Configuration');
console.log('='.repeat(50));
console.log();

// Get local IP address
const nets = networkInterfaces();
let wifiIP = null;
let ethernetIP = null;

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
            if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless')) {
                wifiIP = net.address;
            } else if (name.toLowerCase().includes('ethernet')) {
                ethernetIP = net.address;
            }
        }
    }
}

const localIP = wifiIP || ethernetIP || 'NOT FOUND';

console.log('🖥️  Your Laptop Details:');
console.log('   WiFi IP Address:     ', wifiIP || 'Not connected');
console.log('   Ethernet IP Address: ', ethernetIP || 'Not connected');
console.log('   Active IP:           ', localIP);
console.log();

// Read .env file
let envApiUrl = 'Not set';
if (existsSync('.env')) {
    const envContent = readFileSync('.env', 'utf-8');
    const match = envContent.match(/VITE_API_URL=(.+)/);
    if (match) {
        envApiUrl = match[1].trim();
    }
}

console.log('📋 Current Configuration:');
console.log('   .env file says:      ', envApiUrl);
console.log('   Should be:           ', `http://${localIP}:5000`);
console.log();

if (envApiUrl === `http://${localIP}:5000`) {
    console.log('✅ Configuration is CORRECT!');
} else if (envApiUrl === 'Not set') {
    console.log('❌ .env file missing or VITE_API_URL not found!');
} else {
    console.log('⚠️  Configuration MISMATCH!');
    console.log();
    console.log('   Your IP might have changed. Update .env:');
    console.log(`   VITE_API_URL=http://${localIP}:5000`);
    console.log();
    console.log('   Then restart Vite (Ctrl+C and npm run dev)');
}

console.log();
console.log('📱 Access URLs for Mobile:');
console.log('   Frontend:  ', `http://${localIP}:5173`);
console.log('   Backend:   ', `http://${localIP}:5000`);
console.log();

console.log('✅ Pre-Flight Checklist:');
console.log('   [ ] Backend running on port 5000');
console.log('   [ ] Frontend running on port 5173');
console.log('   [ ] Firewall rules added (run setup-firewall.bat as Admin)');
console.log('   [ ] Phone connected to same WiFi');
console.log('   [ ] .env has correct IP address');
console.log();

console.log('🧪 Quick Tests (do these on your phone):');
console.log();
console.log('   Test 1: Backend API');
console.log(`   Visit: http://${localIP}:5000`);
console.log('   Expected: "API is running..."');
console.log();
console.log('   Test 2: Frontend');
console.log(`   Visit: http://${localIP}:5173`);
console.log('   Expected: Homepage loads');
console.log();

console.log('🔥 Troubleshooting:');
console.log('   If Test 1 fails → Firewall blocking port 5000');
console.log('   If Test 2 fails → Firewall blocking port 5173');
console.log('   If page loads but no data → Check .env configuration');
console.log();

console.log('📖 Full guide: MOBILE_TESTING_GUIDE.md');
console.log('='.repeat(50));
