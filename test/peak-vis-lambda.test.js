const paramValidator = require("../lib/lambda/validateparam");

const invalidUserIdResponse = {
    body: JSON.stringify({
        message: "Invalid userId in path parameter"
    }),
    statusCode: 400
}

test("ParamValidator rejects userId that is too short", () => {
    expect(paramValidator.validate("1234")).toEqual(invalidUserIdResponse);
});

test("ParamValidator rejects userId that contains non-digit characters", () => {
    expect(paramValidator.validate("12as56")).toEqual(invalidUserIdResponse);
});

test("ParamValidator reject userId that is too long", () => {
    expect(paramValidator.validate("123456789")).toEqual(invalidUserIdResponse);
});

test("ParamValidator accepts valid useId", () => {
    expect(paramValidator.validate("123456")).toEqual({valid: true});
});