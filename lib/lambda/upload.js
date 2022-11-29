const AWS = require("aws-sdk");

async function main (event) {
    return {
        body: JSON.stringify({
            userId: event.pathParameters.userId
        }),
        statusCode: 200
    }
}

module.exports = {main}