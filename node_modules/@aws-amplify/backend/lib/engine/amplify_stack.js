import { AmplifyFault } from '@aws-amplify/platform-core';
import { Aspects, Stack } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';
/**
 * Amplify-specific Stack implementation to handle cross-cutting concerns for all Amplify stacks
 */
export class AmplifyStack extends Stack {
    /**
     * Default constructor
     */
    constructor(scope, id) {
        super(scope, id);
        Aspects.of(this).add(new CognitoRoleTrustPolicyValidator());
    }
    /**
     * Overrides Stack.allocateLogicalId to prevent redundant nested stack logical IDs
     */
    allocateLogicalId = (element) => {
        // Nested stack logical IDs have a redundant structure of <name>NestedStack<name>NestedStackResource<hash>
        // This rewrites the nested stack logical ID to <name><hash>
        const defaultId = super.allocateLogicalId(element);
        const match = /(?<name>.*)NestedStack.+NestedStackResource(?<hash>.*)/.exec(defaultId);
        if (match && match.groups && Object.keys(match.groups || {}).length === 2) {
            return `${match.groups.name}${match.groups.hash}`;
        }
        return defaultId;
    };
}
class CognitoRoleTrustPolicyValidator {
    visit = (node) => {
        if (!(node instanceof Role)) {
            return;
        }
        const assumeRolePolicyDocument = node.assumeRolePolicy?.toJSON();
        if (!assumeRolePolicyDocument) {
            return;
        }
        assumeRolePolicyDocument.Statement.forEach(this.cognitoTrustPolicyStatementValidator);
    };
    cognitoTrustPolicyStatementValidator = ({ Action: action, Condition: condition, Effect: effect, Principal: principal, }) => {
        if (action !== 'sts:AssumeRoleWithWebIdentity') {
            return;
        }
        if (principal?.Federated !== 'cognito-identity.amazonaws.com') {
            return;
        }
        if (effect === 'Deny') {
            return;
        }
        // if we got here, we have a policy that allows AssumeRoleWithWebIdentity with Cognito
        // need to validate that the policy has an appropriate condition
        const audCondition = condition?.StringEquals?.['cognito-identity.amazonaws.com:aud'];
        if (typeof audCondition !== 'string' || audCondition.length === 0) {
            throw new AmplifyFault('InvalidTrustPolicyFault', {
                message: 'Cannot create a Role trust policy with Cognito that does not have a StringEquals condition for cognito-identity.amazonaws.com:aud',
            });
        }
        const amrCondition = condition?.['ForAnyValue:StringLike']?.['cognito-identity.amazonaws.com:amr'];
        if (typeof amrCondition !== 'string' || amrCondition.length === 0) {
            throw new AmplifyFault('InvalidTrustPolicyFault', {
                message: 'Cannot create a Role trust policy with Cognito that does not have a StringLike condition for cognito-identity.amazonaws.com:amr',
            });
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW1wbGlmeV9zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lbmdpbmUvYW1wbGlmeV9zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLE9BQU8sRUFBdUIsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUczQzs7R0FFRztBQUNILE1BQU0sT0FBTyxZQUFhLFNBQVEsS0FBSztJQUNyQzs7T0FFRztJQUNILFlBQVksS0FBZ0IsRUFBRSxFQUFVO1FBQ3RDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakIsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSwrQkFBK0IsRUFBRSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUNEOztPQUVHO0lBQ0gsaUJBQWlCLEdBQUcsQ0FBQyxPQUFtQixFQUFVLEVBQUU7UUFDbEQsMEdBQTBHO1FBQzFHLDREQUE0RDtRQUM1RCxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkQsTUFBTSxLQUFLLEdBQUcsd0RBQXdELENBQUMsSUFBSSxDQUN6RSxTQUFTLENBQ1YsQ0FBQztRQUNGLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDekUsT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDbkQ7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDLENBQUM7Q0FDSDtBQUVELE1BQU0sK0JBQStCO0lBQ25DLEtBQUssR0FBRyxDQUFDLElBQWdCLEVBQUUsRUFBRTtRQUMzQixJQUFJLENBQUMsQ0FBQyxJQUFJLFlBQVksSUFBSSxDQUFDLEVBQUU7WUFDM0IsT0FBTztTQUNSO1FBQ0QsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDakUsSUFBSSxDQUFDLHdCQUF3QixFQUFFO1lBQzdCLE9BQU87U0FDUjtRQUVELHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQ3hDLElBQUksQ0FBQyxvQ0FBb0MsQ0FDMUMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUVNLG9DQUFvQyxHQUFHLENBQUMsRUFDOUMsTUFBTSxFQUFFLE1BQU0sRUFDZCxTQUFTLEVBQUUsU0FBUyxFQUNwQixNQUFNLEVBQUUsTUFBTSxFQUNkLFNBQVMsRUFBRSxTQUFTLEdBU3JCLEVBQUUsRUFBRTtRQUNILElBQUksTUFBTSxLQUFLLCtCQUErQixFQUFFO1lBQzlDLE9BQU87U0FDUjtRQUNELElBQUksU0FBUyxFQUFFLFNBQVMsS0FBSyxnQ0FBZ0MsRUFBRTtZQUM3RCxPQUFPO1NBQ1I7UUFDRCxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUU7WUFDckIsT0FBTztTQUNSO1FBQ0Qsc0ZBQXNGO1FBQ3RGLGdFQUFnRTtRQUVoRSxNQUFNLFlBQVksR0FDaEIsU0FBUyxFQUFFLFlBQVksRUFBRSxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDbEUsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLElBQUksWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDakUsTUFBTSxJQUFJLFlBQVksQ0FBQyx5QkFBeUIsRUFBRTtnQkFDaEQsT0FBTyxFQUNMLG1JQUFtSTthQUN0SSxDQUFDLENBQUM7U0FDSjtRQUVELE1BQU0sWUFBWSxHQUNoQixTQUFTLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQ3JDLG9DQUFvQyxDQUNyQyxDQUFDO1FBQ0osSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLElBQUksWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDakUsTUFBTSxJQUFJLFlBQVksQ0FBQyx5QkFBeUIsRUFBRTtnQkFDaEQsT0FBTyxFQUNMLGlJQUFpSTthQUNwSSxDQUFDLENBQUM7U0FDSjtJQUNILENBQUMsQ0FBQztDQUNIIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQW1wbGlmeUZhdWx0IH0gZnJvbSAnQGF3cy1hbXBsaWZ5L3BsYXRmb3JtLWNvcmUnO1xuaW1wb3J0IHsgQXNwZWN0cywgQ2ZuRWxlbWVudCwgSUFzcGVjdCwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBSb2xlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QsIElDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuLyoqXG4gKiBBbXBsaWZ5LXNwZWNpZmljIFN0YWNrIGltcGxlbWVudGF0aW9uIHRvIGhhbmRsZSBjcm9zcy1jdXR0aW5nIGNvbmNlcm5zIGZvciBhbGwgQW1wbGlmeSBzdGFja3NcbiAqL1xuZXhwb3J0IGNsYXNzIEFtcGxpZnlTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgLyoqXG4gICAqIERlZmF1bHQgY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuICAgIEFzcGVjdHMub2YodGhpcykuYWRkKG5ldyBDb2duaXRvUm9sZVRydXN0UG9saWN5VmFsaWRhdG9yKCkpO1xuICB9XG4gIC8qKlxuICAgKiBPdmVycmlkZXMgU3RhY2suYWxsb2NhdGVMb2dpY2FsSWQgdG8gcHJldmVudCByZWR1bmRhbnQgbmVzdGVkIHN0YWNrIGxvZ2ljYWwgSURzXG4gICAqL1xuICBhbGxvY2F0ZUxvZ2ljYWxJZCA9IChlbGVtZW50OiBDZm5FbGVtZW50KTogc3RyaW5nID0+IHtcbiAgICAvLyBOZXN0ZWQgc3RhY2sgbG9naWNhbCBJRHMgaGF2ZSBhIHJlZHVuZGFudCBzdHJ1Y3R1cmUgb2YgPG5hbWU+TmVzdGVkU3RhY2s8bmFtZT5OZXN0ZWRTdGFja1Jlc291cmNlPGhhc2g+XG4gICAgLy8gVGhpcyByZXdyaXRlcyB0aGUgbmVzdGVkIHN0YWNrIGxvZ2ljYWwgSUQgdG8gPG5hbWU+PGhhc2g+XG4gICAgY29uc3QgZGVmYXVsdElkID0gc3VwZXIuYWxsb2NhdGVMb2dpY2FsSWQoZWxlbWVudCk7XG4gICAgY29uc3QgbWF0Y2ggPSAvKD88bmFtZT4uKilOZXN0ZWRTdGFjay4rTmVzdGVkU3RhY2tSZXNvdXJjZSg/PGhhc2g+LiopLy5leGVjKFxuICAgICAgZGVmYXVsdElkXG4gICAgKTtcbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2guZ3JvdXBzICYmIE9iamVjdC5rZXlzKG1hdGNoLmdyb3VwcyB8fCB7fSkubGVuZ3RoID09PSAyKSB7XG4gICAgICByZXR1cm4gYCR7bWF0Y2guZ3JvdXBzLm5hbWV9JHttYXRjaC5ncm91cHMuaGFzaH1gO1xuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdElkO1xuICB9O1xufVxuXG5jbGFzcyBDb2duaXRvUm9sZVRydXN0UG9saWN5VmFsaWRhdG9yIGltcGxlbWVudHMgSUFzcGVjdCB7XG4gIHZpc2l0ID0gKG5vZGU6IElDb25zdHJ1Y3QpID0+IHtcbiAgICBpZiAoIShub2RlIGluc3RhbmNlb2YgUm9sZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYXNzdW1lUm9sZVBvbGljeURvY3VtZW50ID0gbm9kZS5hc3N1bWVSb2xlUG9saWN5Py50b0pTT04oKTtcbiAgICBpZiAoIWFzc3VtZVJvbGVQb2xpY3lEb2N1bWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFzc3VtZVJvbGVQb2xpY3lEb2N1bWVudC5TdGF0ZW1lbnQuZm9yRWFjaChcbiAgICAgIHRoaXMuY29nbml0b1RydXN0UG9saWN5U3RhdGVtZW50VmFsaWRhdG9yXG4gICAgKTtcbiAgfTtcblxuICBwcml2YXRlIGNvZ25pdG9UcnVzdFBvbGljeVN0YXRlbWVudFZhbGlkYXRvciA9ICh7XG4gICAgQWN0aW9uOiBhY3Rpb24sXG4gICAgQ29uZGl0aW9uOiBjb25kaXRpb24sXG4gICAgRWZmZWN0OiBlZmZlY3QsXG4gICAgUHJpbmNpcGFsOiBwcmluY2lwYWwsXG4gIH06IHtcbiAgICAvLyBUaGVzZSBwcm9wZXJ0eSBuYW1lcyBjb21lIGZyb20gdGhlIElBTSBwb2xpY3kgZG9jdW1lbnQgd2hpY2ggd2UgZG8gbm90IGNvbnRyb2xcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb24gKi9cbiAgICBBY3Rpb246IHN0cmluZztcbiAgICBDb25kaXRpb24/OiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PjtcbiAgICBFZmZlY3Q6ICdBbGxvdycgfCAnRGVueSc7XG4gICAgUHJpbmNpcGFsPzogeyBGZWRlcmF0ZWQ/OiBzdHJpbmcgfTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvbiAqL1xuICB9KSA9PiB7XG4gICAgaWYgKGFjdGlvbiAhPT0gJ3N0czpBc3N1bWVSb2xlV2l0aFdlYklkZW50aXR5Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAocHJpbmNpcGFsPy5GZWRlcmF0ZWQgIT09ICdjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb20nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChlZmZlY3QgPT09ICdEZW55Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBpZiB3ZSBnb3QgaGVyZSwgd2UgaGF2ZSBhIHBvbGljeSB0aGF0IGFsbG93cyBBc3N1bWVSb2xlV2l0aFdlYklkZW50aXR5IHdpdGggQ29nbml0b1xuICAgIC8vIG5lZWQgdG8gdmFsaWRhdGUgdGhhdCB0aGUgcG9saWN5IGhhcyBhbiBhcHByb3ByaWF0ZSBjb25kaXRpb25cblxuICAgIGNvbnN0IGF1ZENvbmRpdGlvbiA9XG4gICAgICBjb25kaXRpb24/LlN0cmluZ0VxdWFscz8uWydjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb206YXVkJ107XG4gICAgaWYgKHR5cGVvZiBhdWRDb25kaXRpb24gIT09ICdzdHJpbmcnIHx8IGF1ZENvbmRpdGlvbi5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBBbXBsaWZ5RmF1bHQoJ0ludmFsaWRUcnVzdFBvbGljeUZhdWx0Jywge1xuICAgICAgICBtZXNzYWdlOlxuICAgICAgICAgICdDYW5ub3QgY3JlYXRlIGEgUm9sZSB0cnVzdCBwb2xpY3kgd2l0aCBDb2duaXRvIHRoYXQgZG9lcyBub3QgaGF2ZSBhIFN0cmluZ0VxdWFscyBjb25kaXRpb24gZm9yIGNvZ25pdG8taWRlbnRpdHkuYW1hem9uYXdzLmNvbTphdWQnLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgYW1yQ29uZGl0aW9uID1cbiAgICAgIGNvbmRpdGlvbj8uWydGb3JBbnlWYWx1ZTpTdHJpbmdMaWtlJ10/LltcbiAgICAgICAgJ2NvZ25pdG8taWRlbnRpdHkuYW1hem9uYXdzLmNvbTphbXInXG4gICAgICBdO1xuICAgIGlmICh0eXBlb2YgYW1yQ29uZGl0aW9uICE9PSAnc3RyaW5nJyB8fCBhbXJDb25kaXRpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgQW1wbGlmeUZhdWx0KCdJbnZhbGlkVHJ1c3RQb2xpY3lGYXVsdCcsIHtcbiAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAnQ2Fubm90IGNyZWF0ZSBhIFJvbGUgdHJ1c3QgcG9saWN5IHdpdGggQ29nbml0byB0aGF0IGRvZXMgbm90IGhhdmUgYSBTdHJpbmdMaWtlIGNvbmRpdGlvbiBmb3IgY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmFtcicsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG4iXX0=