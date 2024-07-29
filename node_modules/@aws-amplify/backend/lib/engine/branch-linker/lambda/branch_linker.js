import { randomUUID } from 'node:crypto';
import { AmplifyClient, GetBranchCommand, NotFoundException, UpdateBranchCommand, } from '@aws-sdk/client-amplify';
/**
 * Handles custom resource events.
 */
export class AmplifyBranchLinkerCustomResourceEventHandler {
    amplifyClient;
    /**
     * Creates the custom resource events handler.
     */
    constructor(amplifyClient) {
        this.amplifyClient = amplifyClient;
    }
    handleCustomResourceEvent = async (event) => {
        console.info(`Received '${event.RequestType}' event`);
        const physicalId = event.RequestType === 'Create' ? randomUUID() : event.PhysicalResourceId;
        const props = event.ResourceProperties;
        switch (event.RequestType) {
            case 'Create':
            case 'Update':
                console.info(`Setting stack reference for appId=${props.appId},branchName=${props.branchName} to ${event.StackId}`);
                await this.updateOrUnsetStackReference(props.appId, props.branchName, event.StackId);
                break;
            case 'Delete':
                console.info(`Un-setting stack reference for appId=${props.appId},branchName=${props.branchName}`);
                try {
                    await this.updateOrUnsetStackReference(props.appId, props.branchName, undefined);
                }
                catch (e) {
                    if (e instanceof NotFoundException) {
                        console.info(`Branch branchName=${props.branchName} of appId=${props.appId} was not found while handling delete event`);
                    }
                    else {
                        throw e;
                    }
                }
                break;
        }
        return {
            RequestId: event.RequestId,
            LogicalResourceId: event.LogicalResourceId,
            PhysicalResourceId: physicalId,
            StackId: event.StackId,
            Status: 'SUCCESS',
        };
    };
    updateOrUnsetStackReference = async (appId, branchName, stackId) => {
        // Stack id is in ARN format.
        if (stackId && !stackId?.startsWith('arn:')) {
            throw new Error(`Provided stackId ${stackId} is not in ARN format`);
        }
        const branch = await this.getBranch(appId, branchName);
        console.info(`Received details of branchName=${branchName} of appId=${appId}`);
        // Populate update command input with existing values, so we don't lose them.
        const updateBranchCommandInput = {
            appId,
            ...branch,
        };
        // This is a known bug in the service. I.e. branch can be created without stage
        // but service returns 'NONE' instead of undefined which is not part of
        // Stage enum...
        if (updateBranchCommandInput.stage === 'NONE') {
            updateBranchCommandInput.stage = undefined;
        }
        // Set or unset stackId
        if (stackId) {
            if (!updateBranchCommandInput.backend) {
                updateBranchCommandInput.backend = {};
            }
            updateBranchCommandInput.backend.stackArn = stackId;
        }
        else {
            if (updateBranchCommandInput.backend?.stackArn) {
                delete updateBranchCommandInput.backend.stackArn;
            }
        }
        console.info(`Sending update of branchName=${branchName} of appId=${appId}`);
        await this.amplifyClient.send(new UpdateBranchCommand(updateBranchCommandInput));
    };
    getBranch = async (appId, branchName) => {
        const branch = (await this.amplifyClient.send(new GetBranchCommand({ appId, branchName }))).branch;
        if (!branch) {
            throw new Error(`Unable to get branch ${branchName} for app ${appId}`);
        }
        return branch;
    };
}
const customResourceEventHandler = new AmplifyBranchLinkerCustomResourceEventHandler(new AmplifyClient());
/**
 * Entry point for the lambda-backend custom resource to link deployment to branch.
 */
export const handler = (event) => {
    return customResourceEventHandler.handleCustomResourceEvent(event);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmNoX2xpbmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9lbmdpbmUvYnJhbmNoLWxpbmtlci9sYW1iZGEvYnJhbmNoX2xpbmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3pDLE9BQU8sRUFDTCxhQUFhLEVBRWIsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQixtQkFBbUIsR0FFcEIsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQzs7R0FFRztBQUNILE1BQU0sT0FBTyw2Q0FBNkM7SUFJM0I7SUFIN0I7O09BRUc7SUFDSCxZQUE2QixhQUE0QjtRQUE1QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUFHLENBQUM7SUFFN0QseUJBQXlCLEdBQUcsS0FBSyxFQUMvQixLQUF3QyxFQUNjLEVBQUU7UUFDeEQsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssQ0FBQyxXQUFXLFNBQVMsQ0FBQyxDQUFDO1FBRXRELE1BQU0sVUFBVSxHQUNkLEtBQUssQ0FBQyxXQUFXLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBRTNFLE1BQU0sS0FBSyxHQUNULEtBQUssQ0FBQyxrQkFBdUUsQ0FBQztRQUVoRixRQUFRLEtBQUssQ0FBQyxXQUFXLEVBQUU7WUFDekIsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLFFBQVE7Z0JBQ1gsT0FBTyxDQUFDLElBQUksQ0FDVixxQ0FBcUMsS0FBSyxDQUFDLEtBQUssZUFBZSxLQUFLLENBQUMsVUFBVSxPQUFPLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FDdEcsQ0FBQztnQkFDRixNQUFNLElBQUksQ0FBQywyQkFBMkIsQ0FDcEMsS0FBSyxDQUFDLEtBQUssRUFDWCxLQUFLLENBQUMsVUFBVSxFQUNoQixLQUFLLENBQUMsT0FBTyxD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Q0FBQyx3QkFBd0IsVUFBVSxZQUFZLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDeEU7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDLENBQUM7Q0FDSDtBQUVELE1BQU0sMEJBQTBCLEdBQzlCLElBQUksNkNBQTZDLENBQUMsSUFBSSxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBRXpFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQ3JCLEtBQXdDLEVBQ2MsRUFBRTtJQUN4RCxPQUFPLDBCQUEwQixDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENsb3VkRm9ybWF0aW9uQ3VzdG9tUmVzb3VyY2VFdmVudCxcbiAgQ2xvdWRGb3JtYXRpb25DdXN0b21SZXNvdXJjZVN1Y2Nlc3NSZXNwb25zZSxcbn0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyByYW5kb21VVUlEIH0gZnJvbSAnbm9kZTpjcnlwdG8nO1xuaW1wb3J0IHtcbiAgQW1wbGlmeUNsaWVudCxcbiAgQnJhbmNoLFxuICBHZXRCcmFuY2hDb21tYW5kLFxuICBOb3RGb3VuZEV4Y2VwdGlvbixcbiAgVXBkYXRlQnJhbmNoQ29tbWFuZCxcbiAgVXBkYXRlQnJhbmNoQ29tbWFuZElucHV0LFxufSBmcm9tICdAYXdzLXNkay9jbGllbnQtYW1wbGlmeSc7XG5pbXBvcnQgeyBBbXBsaWZ5QnJhbmNoTGlua2VyQ3VzdG9tUmVzb3VyY2VQcm9wcyB9IGZyb20gJy4vYnJhbmNoX2xpbmtlcl90eXBlcy5qcyc7XG5cbi8qKlxuICogSGFuZGxlcyBjdXN0b20gcmVzb3VyY2UgZXZlbnRzLlxuICovXG5leHBvcnQgY2xhc3MgQW1wbGlmeUJyYW5jaExpbmtlckN1c3RvbVJlc291cmNlRXZlbnRIYW5kbGVyIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIGN1c3RvbSByZXNvdXJjZSBldmVudHMgaGFuZGxlci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYW1wbGlmeUNsaWVudDogQW1wbGlmeUNsaWVudCkge31cblxuICBoYW5kbGVDdXN0b21SZXNvdXJjZUV2ZW50ID0gYXN5bmMgKFxuICAgIGV2ZW50OiBDbG91ZEZvcm1hdGlvbkN1c3RvbVJlc291cmNlRXZlbnRcbiAgKTogUHJvbWlzZTxDbG91ZEZvcm1hdGlvbkN1c3RvbVJlc291cmNlU3VjY2Vzc1Jlc3BvbnNlPiA9PiB7XG4gICAgY29uc29sZS5pbmZvKGBSZWNlaXZlZCAnJHtldmVudC5SZXF1ZXN0VHlwZX0nIGV2ZW50YCk7XG5cbiAgICBjb25zdCBwaHlzaWNhbElkID1cbiAgICAgIGV2ZW50LlJlcXVlc3RUeXBlID09PSAnQ3JlYXRlJyA/IHJhbmRvbVVVSUQoKSA6IGV2ZW50LlBoeXNpY2FsUmVzb3VyY2VJZDtcblxuICAgIGNvbnN0IHByb3BzID1cbiAgICAgIGV2ZW50LlJlc291cmNlUHJvcGVydGllcyBhcyB1bmtub3duIGFzIEFtcGxpZnlCcmFuY2hMaW5rZXJDdXN0b21SZXNvdXJjZVByb3BzO1xuXG4gICAgc3dpdGNoIChldmVudC5SZXF1ZXN0VHlwZSkge1xuICAgICAgY2FzZSAnQ3JlYXRlJzpcbiAgICAgIGNhc2UgJ1VwZGF0ZSc6XG4gICAgICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgICBgU2V0dGluZyBzdGFjayByZWZlcmVuY2UgZm9yIGFwcElkPSR7cHJvcHMuYXBwSWR9LGJyYW5jaE5hbWU9JHtwcm9wcy5icmFuY2hOYW1lfSB0byAke2V2ZW50LlN0YWNrSWR9YFxuICAgICAgICApO1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZU9yVW5zZXRTdGFja1JlZmVyZW5jZShcbiAgICAgICAgICBwcm9wcy5hcHBJZCxcbiAgICAgICAgICBwcm9wcy5icmFuY2hOYW1lLFxuICAgICAgICAgIGV2ZW50LlN0YWNrSWRcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdEZWxldGUnOlxuICAgICAgICBjb25zb2xlLmluZm8oXG4gICAgICAgICAgYFVuLXNldHRpbmcgc3RhY2sgcmVmZXJlbmNlIGZvciBhcHBJZD0ke3Byb3BzLmFwcElkfSxicmFuY2hOYW1lPSR7cHJvcHMuYnJhbmNoTmFtZX1gXG4gICAgICAgICk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVPclVuc2V0U3RhY2tSZWZlcmVuY2UoXG4gICAgICAgICAgICBwcm9wcy5hcHBJZCxcbiAgICAgICAgICAgIHByb3BzLmJyYW5jaE5hbWUsXG4gICAgICAgICAgICB1bmRlZmluZWRcbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBOb3RGb3VuZEV4Y2VwdGlvbikge1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICAgICAgICBgQnJhbmNoIGJyYW5jaE5hbWU9JHtwcm9wcy5icmFuY2hOYW1lfSBvZiBhcHBJZD0ke3Byb3BzLmFwcElkfSB3YXMgbm90IGZvdW5kIHdoaWxlIGhhbmRsaW5nIGRlbGV0ZSBldmVudGBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBSZXF1ZXN0SWQ6IGV2ZW50LlJlcXVlc3RJZCxcbiAgICAgIExvZ2ljYWxSZXNvdXJjZUlkOiBldmVudC5Mb2dpY2FsUmVzb3VyY2VJZCxcbiAgICAgIFBoeXNpY2FsUmVzb3VyY2VJZDogcGh5c2ljYWxJZCxcbiAgICAgIFN0YWNrSWQ6IGV2ZW50LlN0YWNrSWQsXG4gICAgICBTdGF0dXM6ICdTVUNDRVNTJyxcbiAgICB9IGFzIENsb3VkRm9ybWF0aW9uQ3VzdG9tUmVzb3VyY2VTdWNjZXNzUmVzcG9uc2U7XG4gIH07XG5cbiAgcHJpdmF0ZSB1cGRhdGVPclVuc2V0U3RhY2tSZWZlcmVuY2UgPSBhc3luYyAoXG4gICAgYXBwSWQ6IHN0cmluZyxcbiAgICBicmFuY2hOYW1lOiBzdHJpbmcsXG4gICAgc3RhY2tJZDogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIC8vIFN0YWNrIGlkIGlzIGluIEFSTiBmb3JtYXQuXG4gICAgaWYgKHN0YWNrSWQgJiYgIXN0YWNrSWQ/LnN0YXJ0c1dpdGgoJ2FybjonKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm92aWRlZCBzdGFja0lkICR7c3RhY2tJZH0gaXMgbm90IGluIEFSTiBmb3JtYXRgKTtcbiAgICB9XG5cbiAgICBjb25zdCBicmFuY2g6IEJyYW5jaCA9IGF3YWl0IHRoaXMuZ2V0QnJhbmNoKGFwcElkLCBicmFuY2hOYW1lKTtcbiAgICBjb25zb2xlLmluZm8oXG4gICAgICBgUmVjZWl2ZWQgZGV0YWlscyBvZiBicmFuY2hOYW1lPSR7YnJhbmNoTmFtZX0gb2YgYXBwSWQ9JHthcHBJZH1gXG4gICAgKTtcbiAgICAvLyBQb3B1bGF0ZSB1cGRhdGUgY29tbWFuZCBpbnB1dCB3aXRoIGV4aXN0aW5nIHZhbHVlcywgc28gd2UgZG9uJ3QgbG9zZSB0aGVtLlxuICAgIGNvbnN0IHVwZGF0ZUJyYW5jaENvbW1hbmRJbnB1dDogVXBkYXRlQnJhbmNoQ29tbWFuZElucHV0ID0ge1xuICAgICAgYXBwSWQsXG4gICAgICAuLi5icmFuY2gsXG4gICAgfTtcblxuICAgIC8vIFRoaXMgaXMgYSBrbm93biBidWcgaW4gdGhlIHNlcnZpY2UuIEkuZS4gYnJhbmNoIGNhbiBiZSBjcmVhdGVkIHdpdGhvdXQgc3RhZ2VcbiAgICAvLyBidXQgc2VydmljZSByZXR1cm5zICdOT05FJyBpbnN0ZWFkIG9mIHVuZGVmaW5lZCB3aGljaCBpcyBub3QgcGFydCBvZlxuICAgIC8vIFN0YWdlIGVudW0uLi5cbiAgICBpZiAoKHVwZGF0ZUJyYW5jaENvbW1hbmRJbnB1dC5zdGFnZSBhcyBzdHJpbmcpID09PSAnTk9ORScpIHtcbiAgICAgIHVwZGF0ZUJyYW5jaENvbW1hbmRJbnB1dC5zdGFnZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBTZXQgb3IgdW5zZXQgc3RhY2tJZFxuICAgIGlmIChzdGFja0lkKSB7XG4gICAgICBpZiAoIXVwZGF0ZUJyYW5jaENvbW1hbmRJbnB1dC5iYWNrZW5kKSB7XG4gICAgICAgIHVwZGF0ZUJyYW5jaENvbW1hbmRJbnB1dC5iYWNrZW5kID0ge307XG4gICAgICB9XG4gICAgICB1cGRhdGVCcmFuY2hDb21tYW5kSW5wdXQuYmFja2VuZC5zdGFja0FybiA9IHN0YWNrSWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh1cGRhdGVCcmFuY2hDb21tYW5kSW5wdXQuYmFja2VuZD8uc3RhY2tBcm4pIHtcbiAgICAgICAgZGVsZXRlIHVwZGF0ZUJyYW5jaENvbW1hbmRJbnB1dC5iYWNrZW5kLnN0YWNrQXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgIGBTZW5kaW5nIHVwZGF0ZSBvZiBicmFuY2hOYW1lPSR7YnJhbmNoTmFtZX0gb2YgYXBwSWQ9JHthcHBJZH1gXG4gICAgKTtcbiAgICBhd2FpdCB0aGlzLmFtcGxpZnlDbGllbnQuc2VuZChcbiAgICAgIG5ldyBVcGRhdGVCcmFuY2hDb21tYW5kKHVwZGF0ZUJyYW5jaENvbW1hbmRJbnB1dClcbiAgICApO1xuICB9O1xuXG4gIHByaXZhdGUgZ2V0QnJhbmNoID0gYXN5bmMgKFxuICAgIGFwcElkOiBzdHJpbmcsXG4gICAgYnJhbmNoTmFtZTogc3RyaW5nXG4gICk6IFByb21pc2U8QnJhbmNoPiA9PiB7XG4gICAgY29uc3QgYnJhbmNoOiBCcmFuY2ggfCB1bmRlZmluZWQgPSAoXG4gICAgICBhd2FpdCB0aGlzLmFtcGxpZnlDbGllbnQuc2VuZChuZXcgR2V0QnJhbmNoQ29tbWFuZCh7IGFwcElkLCBicmFuY2hOYW1lIH0pKVxuICAgICkuYnJhbmNoO1xuICAgIGlmICghYnJhbmNoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBnZXQgYnJhbmNoICR7YnJhbmNoTmFtZX0gZm9yIGFwcCAke2FwcElkfWApO1xuICAgIH1cbiAgICByZXR1cm4gYnJhbmNoO1xuICB9O1xufVxuXG5jb25zdCBjdXN0b21SZXNvdXJjZUV2ZW50SGFuZGxlciA9XG4gIG5ldyBBbXBsaWZ5QnJhbmNoTGlua2VyQ3VzdG9tUmVzb3VyY2VFdmVudEhhbmRsZXIobmV3IEFtcGxpZnlDbGllbnQoKSk7XG5cbi8qKlxuICogRW50cnkgcG9pbnQgZm9yIHRoZSBsYW1iZGEtYmFja2VuZCBjdXN0b20gcmVzb3VyY2UgdG8gbGluayBkZXBsb3ltZW50IHRvIGJyYW5jaC5cbiAqL1xuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSAoXG4gIGV2ZW50OiBDbG91ZEZvcm1hdGlvbkN1c3RvbVJlc291cmNlRXZlbnRcbik6IFByb21pc2U8Q2xvdWRGb3JtYXRpb25DdXN0b21SZXNvdXJjZVN1Y2Nlc3NSZXNwb25zZT4gPT4ge1xuICByZXR1cm4gY3VzdG9tUmVzb3VyY2VFdmVudEhhbmRsZXIuaGFuZGxlQ3VzdG9tUmVzb3VyY2VFdmVudChldmVudCk7XG59O1xuIl19