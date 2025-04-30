const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
    url: `${process.env.redisuri}`,
});

// Connect to Redis
client.connect()
    .then(() => {
        console.log('Connected to Redis');
    })
    .catch((err) => {
        console.error(`Error connecting to Redis: ${err}`);
    });

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

// Function to set data with an expiration time (TTL)
const setCache = async (key, value, expirationInSeconds = 3600) => {
    try {
        return await client.set(`culturewebinar:${key}`, JSON.stringify(value), {
            EX: expirationInSeconds // Expiration time in seconds
        });
    } catch (err) {
        console.error('Error setting data:', err);
    }
};

// Function to get data from Redis
const getCache = async (key) => {
    try {
        const reply = await client.get(`culturewebinar:${key}`);
        return reply ? JSON.parse(reply) : null; // Return parsed data or null
    } catch (err) {
        console.error('Error getting data:', err);
        return null;
    }
};

// Function to delete data from Redis
const deleteCache = async (key) => {
    try {
        return await client.del(`culturewebinar:${key}`);
    } catch (err) {
        console.error('Error deleting data:', err);
    }
};

const flushCompleteCache = async (query) => {
    try {
        if(query == "flushfull") return await client.flushAll();
        const keys = await client.keys('culturewebinar:*');
        if (keys.length > 0) return await client.del(keys);
    } catch (err) {
        console.error('Error deleting data:', err);
    }
};

const deleteCacheByPattern = async (pattern) => {
    try {
        const keys = await client.keys(`culturewebinar:${pattern}`);
        if (keys.length > 0) return await client.del(keys);
    } catch (err) {
        console.error('Error deleting data:', err);
    }
};

// Close Redis connection gracefully
const closeConnection = async () => {
    try {
        await client.quit();
        console.log('Connection closed');
    } catch (err) {
        console.error('Error closing connection:', err);
    }
};

// Export the cache functions
module.exports = {
    setCache,
    getCache,
    deleteCache,
    closeConnection,
    flushCompleteCache,
    deleteCacheByPattern,
};