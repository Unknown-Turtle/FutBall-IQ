import { ListInstanceProfilesForRoleCommand, } from "../commands/ListInstanceProfilesForRoleCommand";
import { IAMClient } from "../IAMClient";
const makePagedClientRequest = async (client, input, ...args) => {
    return await client.send(new ListInstanceProfilesForRoleCommand(input), ...args);
};
export async function* paginateListInstanceProfilesForRole(config, input, ...additionalArguments) {
    let token = config.startingToken || undefined;
    let hasNext = true;
    let page;
    while (hasNext) {
        input.Marker = token;
        input["MaxItems"] = config.pageSize;
        if (config.client instanceof IAMClient) {
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
