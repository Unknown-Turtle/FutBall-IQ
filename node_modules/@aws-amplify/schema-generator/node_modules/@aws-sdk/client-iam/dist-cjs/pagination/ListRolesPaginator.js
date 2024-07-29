"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateListRoles = void 0;
const ListRolesCommand_1 = require("../commands/ListRolesCommand");
const IAMClient_1 = require("../IAMClient");
const makePagedClientRequest = async (client, input, ...args) => {
    return await client.send(new ListRolesCommand_1.ListRolesCommand(input), ...args);
};
async function* paginateListRoles(config, input, ...additionalArguments) {
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
exports.paginateListRoles = paginateListRoles;
