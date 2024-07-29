import { customOutputKey, } from '@aws-amplify/backend-output-schemas';
import { Lazy } from 'aws-cdk-lib';
import { AmplifyUserError, ObjectAccumulatorPropertyAlreadyExistsError, ObjectAccumulatorVersionMismatchError, } from '@aws-amplify/platform-core';
/**
 * Accumulates custom outputs as they're added to the backend.
 */
export class CustomOutputsAccumulator {
    outputStorageStrategy;
    clientConfigAccumulator;
    hasBackendOutputEntry = false;
    /**
     * Creates custom outputs accumulator.
     */
    constructor(outputStorageStrategy, clientConfigAccumulator) {
        this.outputStorageStrategy = outputStorageStrategy;
        this.clientConfigAccumulator = clientConfigAccumulator;
    }
    addOutput = (clientConfigPart) => {
        try {
            this.clientConfigAccumulator.accumulate(clientConfigPart);
        }
        catch (error) {
            if (error instanceof ObjectAccumulatorPropertyAlreadyExistsError) {
                throw new AmplifyUserError('OutputEntryAlreadyExistsError', {
                    message: `Output entry with key ${error.key} already exists`,
                    resolution: "Check if 'backend.addOutput' is called multiple times with overlapping inputs",
                }, error);
            }
            if (error instanceof ObjectAccumulatorVersionMismatchError) {
                throw new AmplifyUserError('VersionMismatchError', {
                    message: `Conflicting versions of client configuration found.`,
                    resolution: "Ensure that the version specified in 'backend.addOutput' is consistent" +
                        ' and is same as the one used for generating the client config',
                }, error);
            }
            throw error;
        }
        this.ensureBackendOutputEntry();
    };
    ensureBackendOutputEntry = () => {
        if (this.hasBackendOutputEntry) {
            return;
        }
        this.outputStorageStrategy.addBackendOutputEntry(customOutputKey, {
            version: '1',
            payload: {
                customOutputs: Lazy.string({
                    produce: () => {
                        return JSON.stringify(this.clientConfigAccumulator.getAccumulatedObject());
                    },
                }),
            },
        });
        this.hasBackendOutputEntry = true;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tX291dHB1dHNfYWNjdW11bGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZW5naW5lL2N1c3RvbV9vdXRwdXRzX2FjY3VtdWxhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtBLE9BQU8sRUFFTCxlQUFlLEdBQ2hCLE1BQU0scUNBQXFDLENBQUM7QUFDN0MsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNuQyxPQUFPLEVBQ0wsZ0JBQWdCLEVBRWhCLDJDQUEyQyxFQUMzQyxxQ0FBcUMsR0FDdEMsTUFBTSw0QkFBNEIsQ0FBQztBQUVwQzs7R0FFRztBQUNILE1BQU0sT0FBTyx3QkFBd0I7SUFPaEI7SUFDQTtJQVBYLHFCQUFxQixHQUFHLEtBQUssQ0FBQztJQUV0Qzs7T0FFRztJQUNILFlBQ21CLHFCQUFpRSxFQUNqRSx1QkFBd0Q7UUFEeEQsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUE0QztRQUNqRSw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQWlDO0lBQ3hFLENBQUM7SUFFSixTQUFTLEdBQUcsQ0FDVixnQkFBa0UsRUFDbEUsRUFBRTtRQUNGLElBQUk7WUFDRixJQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDM0Q7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLElBQUksS0FBSyxZQUFZLDJDQUEyQyxFQUFFO2dCQUNoRSxNQUFNLElBQUksZ0JBQWdCLENBQ3hCLCtCQUErQixFQUMvQjtvQkFDRSxPQUFPLEVBQUUseUJBQXlCLEtBQUssQ0FBQyxHQUFHLGlCQUFpQjtvQkFDNUQsVUFBVSxFQUNSLCtFQUErRTtpQkFDbEYsRUFDRCxLQUFLLENBQ04sQ0FBQzthQUNIO1lBQ0QsSUFBSSxLQUFLLFlBQVkscUNBQXFDLEVBQUU7Z0JBQzFELE1BQU0sSUFBSSxnQkFBZ0IsQ0FDeEIsc0JBQXNCLEVBQ3RCO29CQUNFLE9BQU8sRUFBRSxxREFBcUQ7b0JBQzlELFVBQVUsRUFDUix3RUFBd0U7d0JBQ3hFLCtEQUErRDtpQkFDbEUsRUFDRCxLQUFLLENBQ04sQ0FBQzthQUNIO1lBQ0QsTUFBTSxLQUFLLENBQUM7U0FDYjtRQUNELElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO0lBQ2xDLENBQUMsQ0FBQztJQUVNLHdCQUF3QixHQUFHLEdBQUcsRUFBRTtRQUN0QyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUM5QixPQUFPO1NBQ1I7UUFDRCxJQUFJLENBQUMscUJBQXFCLENBQUMscUJBQXFCLENBQUMsZUFBZSxFQUFFO1lBQ2hFLE9BQU8sRUFBRSxHQUFHO1lBQ1osT0FBTyxFQUFFO2dCQUNQLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDO29CQUN6QixPQUFPLEVBQUUsR0FBRyxFQUFFO3dCQUNaLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FDbkIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLG9CQUFvQixFQUFFLENBQ3BELENBQUM7b0JBQ0osQ0FBQztpQkFDRixDQUFDO2FBQ0g7U0FDRixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO0lBQ3BDLENBQUMsQ0FBQztDQUNIIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQmFja2VuZE91dHB1dFN0b3JhZ2VTdHJhdGVneSxcbiAgRGVlcFBhcnRpYWxBbXBsaWZ5R2VuZXJhdGVkQ29uZmlncyxcbn0gZnJvbSAnQGF3cy1hbXBsaWZ5L3BsdWdpbi10eXBlcyc7XG5pbXBvcnQgeyBDbGllbnRDb25maWcgfSBmcm9tICdAYXdzLWFtcGxpZnkvY2xpZW50LWNvbmZpZyc7XG5pbXBvcnQge1xuICBDdXN0b21PdXRwdXQsXG4gIGN1c3RvbU91dHB1dEtleSxcbn0gZnJvbSAnQGF3cy1hbXBsaWZ5L2JhY2tlbmQtb3V0cHV0LXNjaGVtYXMnO1xuaW1wb3J0IHsgTGF6eSB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7XG4gIEFtcGxpZnlVc2VyRXJyb3IsXG4gIE9iamVjdEFjY3VtdWxhdG9yLFxuICBPYmplY3RBY2N1bXVsYXRvclByb3BlcnR5QWxyZWFkeUV4aXN0c0Vycm9yLFxuICBPYmplY3RBY2N1bXVsYXRvclZlcnNpb25NaXNtYXRjaEVycm9yLFxufSBmcm9tICdAYXdzLWFtcGxpZnkvcGxhdGZvcm0tY29yZSc7XG5cbi8qKlxuICogQWNjdW11bGF0ZXMgY3VzdG9tIG91dHB1dHMgYXMgdGhleSdyZSBhZGRlZCB0byB0aGUgYmFja2VuZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1c3RvbU91dHB1dHNBY2N1bXVsYXRvciB7XG4gIHByaXZhdGUgaGFzQmFja2VuZE91dHB1dEVudHJ5ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgY3VzdG9tIG91dHB1dHMgYWNjdW11bGF0b3IuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJlYWRvbmx5IG91dHB1dFN0b3JhZ2VTdHJhdGVneTogQmFja2VuZE91dHB1dFN0b3JhZ2VTdHJhdGVneTxDdXN0b21PdXRwdXQ+LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2xpZW50Q29uZmlnQWNjdW11bGF0b3I6IE9iamVjdEFjY3VtdWxhdG9yPENsaWVudENvbmZpZz5cbiAgKSB7fVxuXG4gIGFkZE91dHB1dCA9IChcbiAgICBjbGllbnRDb25maWdQYXJ0OiBEZWVwUGFydGlhbEFtcGxpZnlHZW5lcmF0ZWRDb25maWdzPENsaWVudENvbmZpZz5cbiAgKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuY2xpZW50Q29uZmlnQWNjdW11bGF0b3IuYWNjdW11bGF0ZShjbGllbnRDb25maWdQYXJ0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgT2JqZWN0QWNjdW11bGF0b3JQcm9wZXJ0eUFscmVhZHlFeGlzdHNFcnJvcikge1xuICAgICAgICB0aHJvdyBuZXcgQW1wbGlmeVVzZXJFcnJvcihcbiAgICAgICAgICAnT3V0cHV0RW50cnlBbHJlYWR5RXhpc3RzRXJyb3InLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBPdXRwdXQgZW50cnkgd2l0aCBrZXkgJHtlcnJvci5rZXl9IGFscmVhZHkgZXhpc3RzYCxcbiAgICAgICAgICAgIHJlc29sdXRpb246XG4gICAgICAgICAgICAgIFwiQ2hlY2sgaWYgJ2JhY2tlbmQuYWRkT3V0cHV0JyBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgd2l0aCBvdmVybGFwcGluZyBpbnB1dHNcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBPYmplY3RBY2N1bXVsYXRvclZlcnNpb25NaXNtYXRjaEVycm9yKSB7XG4gICAgICAgIHRocm93IG5ldyBBbXBsaWZ5VXNlckVycm9yKFxuICAgICAgICAgICdWZXJzaW9uTWlzbWF0Y2hFcnJvcicsXG4gICAgICAgICAge1xuICAgICAgICAgICAgbWVzc2FnZTogYENvbmZsaWN0aW5nIHZlcnNpb25zIG9mIGNsaWVudCBjb25maWd1cmF0aW9uIGZvdW5kLmAsXG4gICAgICAgICAgICByZXNvbHV0aW9uOlxuICAgICAgICAgICAgICBcIkVuc3VyZSB0aGF0IHRoZSB2ZXJzaW9uIHNwZWNpZmllZCBpbiAnYmFja2VuZC5hZGRPdXRwdXQnIGlzIGNvbnNpc3RlbnRcIiArXG4gICAgICAgICAgICAgICcgYW5kIGlzIHNhbWUgYXMgdGhlIG9uZSB1c2VkIGZvciBnZW5lcmF0aW5nIHRoZSBjbGllbnQgY29uZmlnJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgdGhpcy5lbnN1cmVCYWNrZW5kT3V0cHV0RW50cnkoKTtcbiAgfTtcblxuICBwcml2YXRlIGVuc3VyZUJhY2tlbmRPdXRwdXRFbnRyeSA9ICgpID0+IHtcbiAgICBpZiAodGhpcy5oYXNCYWNrZW5kT3V0cHV0RW50cnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5vdXRwdXRTdG9yYWdlU3RyYXRlZ3kuYWRkQmFja2VuZE91dHB1dEVudHJ5KGN1c3RvbU91dHB1dEtleSwge1xuICAgICAgdmVyc2lvbjogJzEnLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBjdXN0b21PdXRwdXRzOiBMYXp5LnN0cmluZyh7XG4gICAgICAgICAgcHJvZHVjZTogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgICB0aGlzLmNsaWVudENvbmZpZ0FjY3VtdWxhdG9yLmdldEFjY3VtdWxhdGVkT2JqZWN0KClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIHRoaXMuaGFzQmFja2VuZE91dHB1dEVudHJ5ID0gdHJ1ZTtcbiAgfTtcbn1cbiJdfQ==