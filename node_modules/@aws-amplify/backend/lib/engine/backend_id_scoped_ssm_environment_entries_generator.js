import { ParameterPathConversions } from '@aws-amplify/platform-core';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { toScreamingSnakeCase } from './naming_convention_conversions.js';
/**
 * Generates SsmEnvironmentEntry[] with SSM parameters that are scoped to a specific backend identifier
 */
export class BackendIdScopedSsmEnvironmentEntriesGenerator {
    scope;
    backendId;
    /**
     * Initialize with the backend identifier
     */
    constructor(scope, backendId) {
        this.scope = scope;
        this.backendId = backendId;
    }
    /**
     * Creates SSM parameters for CDK tokens in the scope provided to the constructor.
     * This allows values in scopeContext to be fetched from SSM at runtime without a deploy-time dependency between resources.
     * For this to work, the CDK tokens in scopeContext _must_ reside in the scope from the constructor.
     * This method can be called multiple times but an attempt to insert the same contextKey twice will result in an error.
     *
     * The returned SsmEnvironmentEntries must _not_ contain CDK tokens to SSM parameters.
     * Instead the SSM parameters are formatted with a naming convention and the literal string value of the parameter path is returned.
     * @example
     * Consider the following scopeContext input:
     * {
     *   STORAGE_BUCKET_NAME: <CDK token to S3 bucket name>
     * }
     *
     * This function will create an SSM parameter with a value that will resolve to the S3 bucket name at deploy time
     * The SSM parameter will be placed in the provided CDK scope which _must_ be the same as the scope that the CDK tokens in scopeContext come from
     * The return value will be
     * [
     *   {
     *     name: STORAGE_BUCKET_NAME
     *     path: /amplify/resource_reference/<backend namespace>/<backend name>/STORAGE_BUCKET_NAME
     *   }
     * ]
     *
     * The value of this parameter can then be fetched anywhere else without an explicit deploy-time dependency on the storage bucket name
     * @param scopeContext Key/value pairs of values from the scope that should be stored in SSM and retrievable using the key
     */
    generateSsmEnvironmentEntries = (scopeContext) => Object.entries(scopeContext).map(([contextKey, contextValue]) => {
        const sanitizedContextKey = toScreamingSnakeCase(contextKey);
        const parameterPath = ParameterPathConversions.toResourceReferenceFullPath(this.backendId, sanitizedContextKey);
        new StringParameter(this.scope, `${sanitizedContextKey}Parameter`, {
            parameterName: parameterPath,
            stringValue: contextValue,
        });
        return {
            name: sanitizedContextKey,
            path: parameterPath,
        };
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZF9pZF9zY29wZWRfc3NtX2Vudmlyb25tZW50X2VudHJpZXNfZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2VuZ2luZS9iYWNrZW5kX2lkX3Njb3BlZF9zc21fZW52aXJvbm1lbnRfZW50cmllc19nZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFLdEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXRELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBRTFFOztHQUVHO0FBQ0gsTUFBTSxPQUFPLDZDQUE2QztJQU9yQztJQUNBO0lBTG5COztPQUVHO0lBQ0gsWUFDbUIsS0FBZ0IsRUFDaEIsU0FBNEI7UUFENUIsVUFBSyxHQUFMLEtBQUssQ0FBVztRQUNoQixjQUFTLEdBQVQsU0FBUyxDQUFtQjtJQUM1QyxDQUFDO0lBRUo7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BMEJHO0lBQ0gsNkJBQTZCLEdBQUcsQ0FBQyxZQUFvQyxFQUFFLEVBQUUsQ0FDdkUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsRUFBRSxFQUFFO1FBQzlELE1BQU0sbUJBQW1CLEdBQUcsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0QsTUFBTSxhQUFhLEdBQ2pCLHdCQUF3QixDQUFDLDJCQUEyQixDQUNsRCxJQUFJLENBQUMsU0FBUyxFQUNkLG1CQUFtQixDQUNwQixDQUFDO1FBQ0osSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLG1CQUFtQixXQUFXLEVBQUU7WUFDakUsYUFBYSxFQUFFLGFBQWE7WUFDNUIsV0FBVyxFQUFFLFlBQVk7U0FDMUIsQ0FBQyxDQUFDO1FBQ0gsT0FBTztZQUNMLElBQUksRUFBRSxtQkFBbUI7WUFDekIsSUFBSSxFQUFFLGFBQWE7U0FDcEIsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0NBQ04iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQYXJhbWV0ZXJQYXRoQ29udmVyc2lvbnMgfSBmcm9tICdAYXdzLWFtcGxpZnkvcGxhdGZvcm0tY29yZSc7XG5pbXBvcnQge1xuICBCYWNrZW5kSWRlbnRpZmllcixcbiAgU3NtRW52aXJvbm1lbnRFbnRyaWVzR2VuZXJhdG9yLFxufSBmcm9tICdAYXdzLWFtcGxpZnkvcGx1Z2luLXR5cGVzJztcbmltcG9ydCB7IFN0cmluZ1BhcmFtZXRlciB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zc20nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyB0b1NjcmVhbWluZ1NuYWtlQ2FzZSB9IGZyb20gJy4vbmFtaW5nX2NvbnZlbnRpb25fY29udmVyc2lvbnMuanMnO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBTc21FbnZpcm9ubWVudEVudHJ5W10gd2l0aCBTU00gcGFyYW1ldGVycyB0aGF0IGFyZSBzY29wZWQgdG8gYSBzcGVjaWZpYyBiYWNrZW5kIGlkZW50aWZpZXJcbiAqL1xuZXhwb3J0IGNsYXNzIEJhY2tlbmRJZFNjb3BlZFNzbUVudmlyb25tZW50RW50cmllc0dlbmVyYXRvclxuICBpbXBsZW1lbnRzIFNzbUVudmlyb25tZW50RW50cmllc0dlbmVyYXRvclxue1xuICAvKipcbiAgICogSW5pdGlhbGl6ZSB3aXRoIHRoZSBiYWNrZW5kIGlkZW50aWZpZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgc2NvcGU6IENvbnN0cnVjdCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IGJhY2tlbmRJZDogQmFja2VuZElkZW50aWZpZXJcbiAgKSB7fVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIFNTTSBwYXJhbWV0ZXJzIGZvciBDREsgdG9rZW5zIGluIHRoZSBzY29wZSBwcm92aWRlZCB0byB0aGUgY29uc3RydWN0b3IuXG4gICAqIFRoaXMgYWxsb3dzIHZhbHVlcyBpbiBzY29wZUNvbnRleHQgdG8gYmUgZmV0Y2hlZCBmcm9tIFNTTSBhdCBydW50aW1lIHdpdGhvdXQgYSBkZXBsb3ktdGltZSBkZXBlbmRlbmN5IGJldHdlZW4gcmVzb3VyY2VzLlxuICAgKiBGb3IgdGhpcyB0byB3b3JrLCB0aGUgQ0RLIHRva2VucyBpbiBzY29wZUNvbnRleHQgX211c3RfIHJlc2lkZSBpbiB0aGUgc2NvcGUgZnJvbSB0aGUgY29uc3RydWN0b3IuXG4gICAqIFRoaXMgbWV0aG9kIGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgYnV0IGFuIGF0dGVtcHQgdG8gaW5zZXJ0IHRoZSBzYW1lIGNvbnRleHRLZXkgdHdpY2Ugd2lsbCByZXN1bHQgaW4gYW4gZXJyb3IuXG4gICAqXG4gICAqIFRoZSByZXR1cm5lZCBTc21FbnZpcm9ubWVudEVudHJpZXMgbXVzdCBfbm90XyBjb250YWluIENESyB0b2tlbnMgdG8gU1NNIHBhcmFtZXRlcnMuXG4gICAqIEluc3RlYWQgdGhlIFNTTSBwYXJhbWV0ZXJzIGFyZSBmb3JtYXR0ZWQgd2l0aCBhIG5hbWluZyBjb252ZW50aW9uIGFuZCB0aGUgbGl0ZXJhbCBzdHJpbmcgdmFsdWUgb2YgdGhlIHBhcmFtZXRlciBwYXRoIGlzIHJldHVybmVkLlxuICAgKiBAZXhhbXBsZVxuICAgKiBDb25zaWRlciB0aGUgZm9sbG93aW5nIHNjb3BlQ29udGV4dCBpbnB1dDpcbiAgICoge1xuICAgKiAgIFNUT1JBR0VfQlVDS0VUX05BTUU6IDxDREsgdG9rZW4gdG8gUzMgYnVja2V0IG5hbWU+XG4gICAqIH1cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGNyZWF0ZSBhbiBTU00gcGFyYW1ldGVyIHdpdGggYSB2YWx1ZSB0aGF0IHdpbGwgcmVzb2x2ZSB0byB0aGUgUzMgYnVja2V0IG5hbWUgYXQgZGVwbG95IHRpbWVcbiAgICogVGhlIFNTTSBwYXJhbWV0ZXIgd2lsbCBiZSBwbGFjZWQgaW4gdGhlIHByb3ZpZGVkIENESyBzY29wZSB3aGljaCBfbXVzdF8gYmUgdGhlIHNhbWUgYXMgdGhlIHNjb3BlIHRoYXQgdGhlIENESyB0b2tlbnMgaW4gc2NvcGVDb250ZXh0IGNvbWUgZnJvbVxuICAgKiBUaGUgcmV0dXJuIHZhbHVlIHdpbGwgYmVcbiAgICogW1xuICAgKiAgIHtcbiAgICogICAgIG5hbWU6IFNUT1JBR0VfQlVDS0VUX05BTUVcbiAgICogICAgIHBhdGg6IC9hbXBsaWZ5L3Jlc291cmNlX3JlZmVyZW5jZS88YmFja2VuZCBuYW1lc3BhY2U+LzxiYWNrZW5kIG5hbWU+L1NUT1JBR0VfQlVDS0VUX05BTUVcbiAgICogICB9XG4gICAqIF1cbiAgICpcbiAgICogVGhlIHZhbHVlIG9mIHRoaXMgcGFyYW1ldGVyIGNhbiB0aGVuIGJlIGZldGNoZWQgYW55d2hlcmUgZWxzZSB3aXRob3V0IGFuIGV4cGxpY2l0IGRlcGxveS10aW1lIGRlcGVuZGVuY3kgb24gdGhlIHN0b3JhZ2UgYnVja2V0IG5hbWVcbiAgICogQHBhcmFtIHNjb3BlQ29udGV4dCBLZXkvdmFsdWUgcGFpcnMgb2YgdmFsdWVzIGZyb20gdGhlIHNjb3BlIHRoYXQgc2hvdWxkIGJlIHN0b3JlZCBpbiBTU00gYW5kIHJldHJpZXZhYmxlIHVzaW5nIHRoZSBrZXlcbiAgICovXG4gIGdlbmVyYXRlU3NtRW52aXJvbm1lbnRFbnRyaWVzID0gKHNjb3BlQ29udGV4dDogUmVjb3JkPHN0cmluZywgc3RyaW5nPikgPT5cbiAgICBPYmplY3QuZW50cmllcyhzY29wZUNvbnRleHQpLm1hcCgoW2NvbnRleHRLZXksIGNvbnRleHRWYWx1ZV0pID0+IHtcbiAgICAgIGNvbnN0IHNhbml0aXplZENvbnRleHRLZXkgPSB0b1NjcmVhbWluZ1NuYWtlQ2FzZShjb250ZXh0S2V5KTtcbiAgICAgIGNvbnN0IHBhcmFtZXRlclBhdGggPVxuICAgICAgICBQYXJhbWV0ZXJQYXRoQ29udmVyc2lvbnMudG9SZXNvdXJjZVJlZmVyZW5jZUZ1bGxQYXRoKFxuICAgICAgICAgIHRoaXMuYmFja2VuZElkLFxuICAgICAgICAgIHNhbml0aXplZENvbnRleHRLZXlcbiAgICAgICAgKTtcbiAgICAgIG5ldyBTdHJpbmdQYXJhbWV0ZXIodGhpcy5zY29wZSwgYCR7c2FuaXRpemVkQ29udGV4dEtleX1QYXJhbWV0ZXJgLCB7XG4gICAgICAgIHBhcmFtZXRlck5hbWU6IHBhcmFtZXRlclBhdGgsXG4gICAgICAgIHN0cmluZ1ZhbHVlOiBjb250ZXh0VmFsdWUsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IHNhbml0aXplZENvbnRleHRLZXksXG4gICAgICAgIHBhdGg6IHBhcmFtZXRlclBhdGgsXG4gICAgICB9O1xuICAgIH0pO1xufVxuIl19