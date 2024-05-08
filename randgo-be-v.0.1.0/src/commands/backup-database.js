const { MongoClient, BSON } = require('mongodb');
const fs = require('fs').promises;
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

async function exportDatabase() {
  try {
    // Connect to the MongoDB client
    await client.connect();
    if (!process.argv[2] || process.argv[2] == '') {
      throw new Error('You must input backup path');
    }
    const path = Path.join(__dirname, '..', '..', process.argv[2]);

    console.log(`The database will be backup to ${path}`);

    await fs.mkdir(path, { recursive: true });
    // Specify the database and collection
    const database = client.db(dbName);
    for (collectionName of collectionNames) {
      const collection = database.collection(collectionName);

      // Fetch all documents from the collection
      const cursor = collection.find({});

      // Convert the cursor to an array
      const data = await cursor.toArray();

      // Serialize data using BSON to preserve types
      // Wrap the array in an object
      const bsonData = BSON.serialize({ documents: data });

      // Set the outputFile path
      let outputFile = `${path}/${collectionName}.json`;

      // Write BSON data to a file
      fs.writeFile(outputFile, bsonData);
    }
    console.log(`Database is exported!`);
  } catch (error) {
    console.error('Error during data export:', error);
  } finally {
    // Ensure that the client will close when you finish/error
    await client.close();
  }
}

exportDatabase();
