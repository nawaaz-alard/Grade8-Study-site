const { BlobServiceClient } = require("@azure/storage-blob");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AzureWebJobsStorage;

if (!connectionString) {
    throw new Error("Azure Storage Connection String is missing.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

async function getContainerClient(containerName) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Optimistic creation or check - usually better to ensure these exist ahead of time or just catch error
    await containerClient.createIfNotExists();
    return containerClient;
}

async function readJson(container, blobName) {
    try {
        const containerClient = await getContainerClient(container);
        const blobClient = containerClient.getBlockBlobClient(blobName);

        if (!await blobClient.exists()) {
            return null;
        }

        const downloadBlockBlobResponse = await blobClient.download(0);
        const downloaded = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
        return JSON.parse(downloaded.toString());
    } catch (error) {
        console.error(`Error reading ${blobName} from ${container}:`, error);
        throw error;
    }
}

async function writeJson(container, blobName, data) {
    try {
        const containerClient = await getContainerClient(container);
        const blobClient = containerClient.getBlockBlobClient(blobName);

        const content = JSON.stringify(data, null, 2);
        await blobClient.upload(content, content.length);
        return true;
    } catch (error) {
        console.error(`Error writing ${blobName} from ${container}:`, error);
        throw error;
    }
}

// Helper to convert stream to buffer
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}

module.exports = {
    readJson,
    writeJson
};
