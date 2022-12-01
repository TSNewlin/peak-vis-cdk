const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const axios = require("axios");
const s3 = new S3Client({region: process.env.BUCKET_REGION});

async function main(event) {
    const userId  = event.pathParameters.userId;
    if (userId.length != 6) return invalidUserId();
    const fileKey = `${userId}/${event.pathParameters.fileName}`

    try {
        const getObjCommand = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: fileKey
        });
        const signedUrl = await getSignedUrl(s3, getObjCommand);
        const s3Response  = await axios.get(signedUrl);
        if (s3Response.status == 200) {
            return {
                statusCode: 200,
                body: JSON.stringify(s3Response.data)
            }
        } else {
            return {
                statusCode: s3Response.status,
                message: s3Response.statusText
            }
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