'use strict'

const { ReasonPhrases, StatusCodes } = require("./httpStatusCode");

class SuccessResponse {
    constructor({message, statusCode = StatusCodes.OK, resonSatusCode = ReasonPhrases.OK, metadata = {}}){
        this.message = !message ? resonSatusCode : message;
        this.status = statusCode;
        this.metadata = metadata;
    }

    send(res, headers ={}){
        return res.status(this.status).json(this);
    }
}


class OK extends SuccessResponse {
    constructor({message, metadata}){
        super(message, metadata);
    }
}

class CREATED extends SuccessResponse {
    constructor({options = {}, message, statusCode = StatusCodes.CREATED, resonSatusCode = ReasonPhrases.CREATED, metadata = {}}){
        super({message, statusCode, resonSatusCode, metadata})
        this.options = options;
    }
}


module.exports = {
    OK,
    CREATED,
};
