"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateListInstanceProfiles = void 0;
const ListInstanceProfilesCommand_1 = require("../commands/ListInstanceProfilesCommand");
const IAMClient_1 = require("../IAMClient");
const makePagedClientRequest = async (client, input, ...args) => {
    return await client.send(new ListInstanceProfilesCommand_1.ListInstanceProfilesCommand(input), ...args);
};
async function* paginateListInstanceProfiles(config, input, ...additionalArguments) {
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
exports.paginateListInstanceProfiles = paginateListInstanceProfiles;
