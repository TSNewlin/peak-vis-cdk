const list = require("../lib/lambda/list");

const invalidUserIdResponse = {
    body: JSON.stringify({
        message: "Invalid userId in path parameter"
    }),
    statusCode: 400
}

test("Function to list uploaded datasets rejects userId not of length 6", async () => {
    const event = {
        pathParameters: {
            userId: "1234"
        }
    };
    expect(await list.main(event)).toEqual(invalidUserIdResponse)
});

test("Function to list uploaded datasets rejects userId that contains non-digit characters", async () => {
    const event = {
        pathParameters: {
            userId: "12as56"
        }
    }
    expect(await list.main(event)).toEqual(invalidUserIdResponse)
});