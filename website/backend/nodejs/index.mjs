import https from 'node:https';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI);

const fetchImg = (url) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const imgData = [];
      res.on('data', (chunk) => {
        imgData.push(chunk);
      });
      res.on('end', () => {
        resolve({
          imgData: Buffer.concat(imgData),
          contentType: res.headers['content-type'],
        });
      });
    });
  });
};

const fetchCatImg = async (event) => {
  const url = decodeURIComponent(event.queryStringParameters.url);

  try {
    const { imgData, contentType } = await fetchImg(url);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': contentType,
      },
      isBase64Encoded: true,
      body: imgData.toString('base64'),
    };
  } catch (e) {
    console.log(`Error fetching cat image:\n${e}`);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
      body: 'Error fetching cat image.',
    };
  }
};

const updateRuns = async (event) => {
  const db = client.db('main');
  const collection = db.collection('runs');
  try {
    const response = await collection.updateOne(
      { _id: new ObjectId(process.env.OBJECT_ID) },
      { $inc: { count: 1 } }
    );
    if (response.acknowledged) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: 'Updated runs.',
      };
    } else {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
        body: 'Error updating runs',
      };
    }
  } catch (e) {
    console.log(`Error updating runs:\n${e}`);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
      body: 'Error updating runs',
    };
  }
};

const getRuns = async (event) => {
  const db = client.db('main');
  const collection = db.collection('runs');

  try {
    const response = await collection.find({}).toArray();
    const runs = response[0].count;
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count: runs }),
    };
  } catch (e) {
    console.log(`Error fetching runs:\n${e}`);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
      body: 'Error fetching runs',
    };
  }
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'access-control-allow-headers':
          'content-type,x-amz-date,authorization,x-api-key,x-amz-security-token,origin,accept',
        'access-control-allow-methods': 'options,post,get,put,delete',
        'access-control-allow-origin': '*',
      },
    };
  } else if (event.httpMethod === 'GET') {
    switch (event.path) {
      case '/': {
        return fetchCatImg(event);
      }
      case '/run': {
        return getRuns(event);
      }
      case '/run/update': {
        return updateRuns(event);
      }
    }
  }
};
