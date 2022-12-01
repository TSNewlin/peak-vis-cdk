const { S3Client, ListObjectsCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({region: process.env.BUCKET_REGION});

async function main(event) {
    const userId  = event.pathParameters.userId;
    if (userId.length != 6) return invalidUserId();

    try {
        const listParams = { 
            Bucket: process.env.BUCKET_NAME,
            Prefix: userId
        }
        const data = await s3.send(new ListObjectsCommand(listParams));
        if (!data.Contents){
            return {
                statusCode: 404,
                body: JSON.stringify({message: `No user with id ${userId} found`})
            }
        }
        return formatResponse(data.Contents);
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

function formatResponse (bucketContents) {
    const fileValues = [];
    bucketContents.forEach((file) => {
        const fileName  = file.Key.split("/")[1]
        fileValues.push({
            s3Key: file.Key,
            uploaded: file.LastModified,
            name: fileName
        });
    });
    return {
        statusCode: 200,
        body: JSON.stringify({
            files: fileValues
        })
    }
}


module.exports = {main}