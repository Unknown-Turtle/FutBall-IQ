"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateListAttachedRolePolicies = void 0;
const ListAttachedRolePoliciesCommand_1 = require("../commands/ListAttachedRolePoliciesCommand");
const IAMClient_1 = require("../IAMClient");
const makePagedClientRequest = async (client, input, ...args) => {
    return await client.send(new ListAttachedRolePoliciesCommand_1.ListAttachedRolePoliciesCommand(input), ...args);
};
async function* paginateListAttachedRolePolicies(config, input, ...additionalArguments) {
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
exports.paginateListAttachedRolePolicies = paginateListAttachedRolePolicies;
