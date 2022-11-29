const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({region: process.env.BUCKET_REGION});

async function main (event) {
    if (event.pathParameters.userId.length < 6) return invalidUserId();

    try {
        const date = new Date();
        const fileKey = `${event.pathParameters.userId}/${date.toISOString()}.json`;
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileKey,
            ContentType: "application/json",
            Body: event.body
        };
        await s3.send(new PutObjectCommand(params));
        return {
            body: JSON.stringify({
                userId: event.pathParameters.userId
            }),
            statusCode: 200
        }
    } catch (err) {
        return {
            body: JSON.stringify({
                message: `Interal Server Error`,
                error: `${err.message}`
            }),
            statusCode: 500
        }
    }
}

function invalidUserId() {
    return {
        body: JSON.stringify({
            message: "Invalid userId in path parameter"
        }),
        statusCode: 400
    };
}

module.exports = {main}