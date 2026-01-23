const net = require('net');
const { URL } = require('url');

// Parse DATABASE_URL
// Format: postgres://user:password@host:port/dbname
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL is not defined.");
  process.exit(1);
}

let host, port;

try {
  const parsedUrl = new URL(dbUrl);
  host = parsedUrl.hostname;
  port = parsedUrl.port || 5432;
} catch (error) {
  console.error("❌ Invalid DATABASE_URL format.");
  process.exit(1);
}

console.log(`⏳ Waiting for database at ${host}:${port}...`);

const checkConnection = () => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    
    socket.setTimeout(2000); // 2 second timeout for connection attempt

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timed out'));
    });

    socket.on('error', (err) => {
      socket.destroy();
      reject(err);
    });

    socket.connect(port, host);
  });
};

const wait = async () => {
  const maxRetries = 30; // 30 attempts
  const delay = 1000; // 1 second between attempts

  for (let i = 0; i < maxRetries; i++) {
    try {
      await checkConnection();
      console.log("✅ Database is ready!");
      process.exit(0);
    } catch (err) {
      if (i === maxRetries - 1) {
        console.error(`❌ Could not connect to database after ${maxRetries} attempts.`);
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

wait();
