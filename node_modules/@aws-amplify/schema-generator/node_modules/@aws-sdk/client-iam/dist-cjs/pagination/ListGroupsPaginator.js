"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateListGroups = void 0;
const ListGroupsCommand_1 = require("../commands/ListGroupsCommand");
const IAMClient_1 = require("../IAMClient");
const makePagedClientRequest = async (client, input, ...args) => {
    return await client.send(new ListGroupsCommand_1.ListGroupsCommand(input), ...args);
};
async function* paginateListGroups(config, input, ...additionalArguments) {
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
exports.paginateListGroups = paginateListGroups;
