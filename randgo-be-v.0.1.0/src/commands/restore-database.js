const { MongoClient, BSON } = require('mongodb');
const fs = require('fs');
const Path = require('path');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';
const dbName = 'Go';

let collectionNames = [
  'boards',
  'contacts',
  'friends',
  'gamechats',
  'gamehistories',
  'games',
  'messages',
  'originalboards',
  'users',
];

const client = new MongoClient(uri);

async function importDatabase() {
  try {
    // Connect to the MongoDB client
    await client.connect();

    if (!process.argv[2] || process.argv[2] == '') {
      throw new Error('You must input restore path');
    }
    const path = Path.join(__dirname, '..', '..', process.argv[2]);

    console.log(`The database will be restored from ${path}`);

    // Specify the database and collection
    const database = client.db(dbName);
    let collectionCount = 0;
    for (collectionName of collectionNames) {
      const collection = database.collection(collectionName);
      // Set the input JSON file path to restore.
      let inputFile = `${path}/${collectionName}.json`;
      // If the file doesn't exist, restore next json file.
      if (!fs.existsSync(inputFile)) continue;
      // Read the BSON data from a file
      const bsonData = fs.readFileSync(inputFile);

      // Deserialize the BSON data
      const documents = BSON.deserialize(bsonData);

      // If the documents were originally stored as an array inside an object
      if (documents && documents.documents) {
        // Insert the documents back into the MongoDB collection
        await collection.deleteMany();
        await collection.insertMany(documents.documents);
        collectionCount++;
      } else {
        throw Error('No valid documents found in BSON file.');
      }
    }

    console.log(`${collectionCount} collections are restored!`);
  } catch (error) {
    console.error('Error during data import:', error);
  } finally {
    // Ensure that the client will close when you finish/error
    await client.close();
  }
}

importDatabase();
