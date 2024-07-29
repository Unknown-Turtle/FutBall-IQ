"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateSimulateCustomPolicy = void 0;
const SimulateCustomPolicyCommand_1 = require("../commands/SimulateCustomPolicyCommand");
const IAMClient_1 = require("../IAMClient");
const makePagedClientRequest = async (client, input, ...args) => {
    return await client.send(new SimulateCustomPolicyCommand_1.SimulateCustomPolicyCommand(input), ...args);
};
async function* paginateSimulateCustomPolicy(config, input, ...additionalArguments) {
    let token = config.startingToken || undefined;
    let hasNext = true;
    let page;
    while (hasNext) {
        input.Marker = token;
        input["MaxItems"] = config.pageSize;
        if (config.client instanceof IAMClient_1.IAMClient) {
            page = await makePagedClientRequest(config.client, input, ...additionalArguments);
        }
        else {
            throw new Error("Invalid client, expected IAM | IAMClient");
        }
        yield page;
        const prevToken = token;
        token = page.Marker;
        hasNext = !!(token && (!config.stopOnSameToken || token !== prevToken));
    }
    return undefined;
}
exports.paginateSimulateCustomPolicy = paginateSimulateCustomPolicy;
