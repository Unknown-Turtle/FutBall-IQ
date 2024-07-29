"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateListPolicyVersions = void 0;
const ListPolicyVersionsCommand_1 = require("../commands/ListPolicyVersionsCommand");
const IAMClient_1 = require("../IAMClient");
const makePagedClientRequest = async (client, input, ...args) => {
    return await client.send(new ListPolicyVersionsCommand_1.ListPolicyVersionsCommand(input), ...args);
};
async function* paginateListPolicyVersions(config, input, ...additionalArguments) {
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
exports.paginateListPolicyVersions = paginateListPolicyVersions;
