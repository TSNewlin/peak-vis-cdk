const list = require("../lib/lambda/list");

test("Function rejects useId not of length 6", async () => {
    const event = {
        pathParameters: {
            userId: "1234"
        }
    };
    const errorResponse = {
        body: JSON.stringify({
            message: "Invalid userId in path parameter"
        }),
        statusCode: 400
    };
    expect(await list.main(event)).toEqual(errorResponse)
});