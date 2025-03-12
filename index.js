#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const projectName = process.argv[2] || "vindictive-node-app";
const projectPath = path.join(process.cwd(), projectName);

console.log(`🚀 Creating a new Express + MongoDB project in ${projectPath}...`);

// Ensure the project folder is created
if (!fs.existsSync(projectPath)) {
  fs.mkdirSync(projectPath);
} else {
  console.error("❌ Error: A folder with that name already exists.");
  process.exit(1);
}

// Define the package.json content with all dependencies
const packageJson = {
  name: projectName,
  version: "1.0.0",
  scripts: {
    start: "node index.js"
  },
  dependencies: {
    express: "^4.21.2",
    dotenv: "^16.4.7",
    mongodb: "^6.14.2",
    cors: "^2.8.5",
    mongoose: "^8.12.1",
    nodemon: "^3.1.9"
  }
};

// Write the package.json file
fs.writeFileSync(
  path.join(projectPath, "package.json"),
  JSON.stringify(packageJson, null, 2)
);

// Create the .env file
fs.writeFileSync(
  path.join(projectPath, ".env"),
  "MONGO_URI=mongodb+srv://<Username>:<Password>@cluster.mongodb.net/?retryWrites=true&w=majority\n"
);

// Create the Express server file
const serverCode = `import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";

dotenv.config();
const app = express();
const port = 3000;
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ MONGO_URI is missing in .env file. Please add your MongoDB URI.");
  process.exit(1);
}

const client = new MongoClient(uri);
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("yourDatabaseName");
    const collection = database.collection("yourCollectionName");
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.post("/", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("yourDatabaseName");
    const collection = database.collection("yourCollectionName");
    const result = await collection.insertOne(req.body);
    res.status(200).json({ message: "Successfully Added!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(\`🚀 Server is running at http://localhost:\${port}\`);
});`;

// Write index.js
fs.writeFileSync(path.join(projectPath, "index.js"), serverCode);

// Install dependencies (ESCAPED PATH WITH QUOTES)
console.log("📦 Installing dependencies...");
execSync(`cd "${projectPath}" && npm install`, { stdio: "inherit" });

console.log(`✅ Project created successfully!`);
console.log(`📌 Next steps:`);
console.log(`  cd "${projectName}"`);
console.log(`  npm start`);
