function validate(pathParam) {
    if (pathParam.length === 6 && pathParam.match(/^\d*$/) != null) {
        return {
            valid: true
        };
    }
    return  {
        body: JSON.stringify({
            message: "Invalid userId in path parameter"
        }),
            statusCode: 400
    }
}

module.exports = {validate}