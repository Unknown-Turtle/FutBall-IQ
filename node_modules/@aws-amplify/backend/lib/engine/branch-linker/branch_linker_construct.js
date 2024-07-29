import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime as LambdaRuntime } from 'aws-cdk-lib/aws-lambda';
import { CustomResource, Duration } from 'aws-cdk-lib';
import { fileURLToPath } from 'node:url';
import path from 'path';
import { Provider } from 'aws-cdk-lib/custom-resources';
import * as iam from 'aws-cdk-lib/aws-iam';
import { BackendEnvironmentVariables } from '../../environment_variables.js';
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const resourcesRoot = path.normalize(path.join(dirname, 'lambda'));
const linkerLambdaFilePath = path.join(resourcesRoot, 'branch_linker.js');
/**
 * Type of the backend custom CFN resource.
 */
const LINKER_RESOURCE_TYPE = 'Custom::AmplifyBranchLinkerResource';
/**
 * Adds a custom resources that links and un-links branch deployments
 * to Amplify Console.
 */
export class AmplifyBranchLinkerConstruct extends Construct {
    /**
     * Creates Amplify Console linker construct.
     */
    constructor(scope, backendIdentifier) {
        super(scope, 'AmplifyBranchLinker');
        const environment = {};
        if (process.env[BackendEnvironmentVariables.AWS_ENDPOINT_URL_AMPLIFY]) {
            // Passing a standard AWS SDK environment variable if present to override
            // Amplify service endpoint.
            // See https://docs.aws.amazon.com/sdkref/latest/guide/feature-ss-endpoints.html
            environment[BackendEnvironmentVariables.AWS_ENDPOINT_URL_AMPLIFY] =
                process.env[BackendEnvironmentVariables.AWS_ENDPOINT_URL_AMPLIFY];
        }
        const linkerLambda = new NodejsFunction(this, 'CustomResourceLambda', {
            runtime: LambdaRuntime.NODEJS_18_X,
            timeout: Duration.seconds(10),
            entry: linkerLambdaFilePath,
            handler: 'handler',
            environment,
            bundling: {
                // TODO Remove it when Lambda serves SDK 3.440.0+
                // https://github.com/aws-amplify/amplify-backend/issues/561
                // This is added to force bundler to include local version of AWS SDK.
                // Lambda provided version does not have 'backend.stackArn' yet.
                externalModules: [],
            },
        });
        linkerLambda.grantPrincipal.addToPrincipalPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['amplify:GetBranch', 'amplify:UpdateBranch'],
            resources: [
                `arn:aws:amplify:*:*:apps/${backendIdentifier.namespace}/branches/${backendIdentifier.name}`,
            ],
        }));
        const customResourceProvider = new Provider(this, 'CustomResourceProvider', {
            onEventHandler: linkerLambda,
        });
        const customResourceProps = {
            appId: backendIdentifier.namespace,
            branchName: backendIdentifier.name,
        };
        new CustomResource(this, 'CustomResource', {
            serviceToken: customResourceProvider.serviceToken,
            properties: customResourceProps,
            resourceType: LINKER_RESOURCE_TYPE,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmNoX2xpbmtlcl9jb25zdHJ1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZW5naW5lL2JyYW5jaC1saW5rZXIvYnJhbmNoX2xpbmtlcl9jb25zdHJ1Y3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN2QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDL0QsT0FBTyxFQUFFLE9BQU8sSUFBSSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUN2RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3pDLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFeEQsT0FBTyxLQUFLLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUc3RSxNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUNuRSxNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFFMUU7O0dBRUc7QUFDSCxNQUFNLG9CQUFvQixHQUFHLHFDQUFxQyxDQUFDO0FBRW5FOzs7R0FHRztBQUNILE1BQU0sT0FBTyw0QkFBNkIsU0FBUSxTQUFTO0lBQ3pEOztPQUVHO0lBQ0gsWUFBWSxLQUFnQixFQUFFLGlCQUFvQztRQUNoRSxLQUFLLENBQUMsS0FBSyxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFFcEMsTUFBTSxXQUFXLEdBQTJCLEVBQUUsQ0FBQztRQUMvQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsd0JBQXdCLENBQUMsRUFBRTtZQUNyRSx5RUFBeUU7WUFDekUsNEJBQTRCO1lBQzVCLGdGQUFnRjtZQUNoRixXQUFXLENBQUMsMkJBQTJCLENBQUMsd0JBQXdCLENBQUM7Z0JBQy9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsd0JBQXdCLENBQUMsQ0FBQztTQUNyRTtRQUNELE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUNwRSxPQUFPLEVBQUUsYUFBYSxDQUFDLFdBQVc7WUFDbEMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzdCLEtBQUssRUFBRSxvQkFBb0I7WUFDM0IsT0FBTyxFQUFFLFNBQVM7WUFDbEIsV0FBVztZQUNYLFFBQVEsRUFBRTtnQkFDUixpREFBaUQ7Z0JBQ2pELDREQUE0RDtnQkFDNUQsc0VBQXNFO2dCQUN0RSxnRUFBZ0U7Z0JBQ2hFLGVBQWUsRUFBRSxFQUFFO2FBQ3BCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsWUFBWSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FDOUMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3RCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDeEIsT0FBTyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsc0JBQXNCLENBQUM7WUFDdEQsU0FBUyxFQUFFO2dCQUNULDRCQUE0QixpQkFBaUIsQ0FBQyxTQUFTLGFBQWEsaUJBQWlCLENBQUMsSUFBSSxFQUFFO2FBQzdGO1NBQ0YsQ0FBQyxDQUNILENBQUM7UUFFRixNQUFNLHNCQUFzQixHQUFHLElBQUksUUFBUSxDQUN6QyxJQUFJLEVBQ0osd0JBQXdCLEVBQ3hCO1lBQ0UsY0FBYyxFQUFFLFlBQVk7U0FDN0IsQ0FDRixDQUFDO1FBRUYsTUFBTSxtQkFBbUIsR0FBMkM7WUFDbEUsS0FBSyxFQUFFLGlCQUFpQixDQUFDLFNBQVM7WUFDbEMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLElBQUk7U0FDbkMsQ0FBQztRQUVGLElBQUksY0FBYyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN6QyxZQUFZLEVBQUUsc0JBQXNCLENBQUMsWUFBWTtZQUNqRCxVQUFVLEVBQUUsbUJBQW1CO1lBQy9CLFlBQVksRUFBRSxvQkFBb0I7U0FDbkMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBOb2RlanNGdW5jdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtbm9kZWpzJztcbmltcG9ydCB7IFJ1bnRpbWUgYXMgTGFtYmRhUnVudGltZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgQ3VzdG9tUmVzb3VyY2UsIER1cmF0aW9uIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgUHJvdmlkZXIgfSBmcm9tICdhd3MtY2RrLWxpYi9jdXN0b20tcmVzb3VyY2VzJztcbmltcG9ydCB7IEFtcGxpZnlCcmFuY2hMaW5rZXJDdXN0b21SZXNvdXJjZVByb3BzIH0gZnJvbSAnLi9sYW1iZGEvYnJhbmNoX2xpbmtlcl90eXBlcy5qcyc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBCYWNrZW5kRW52aXJvbm1lbnRWYXJpYWJsZXMgfSBmcm9tICcuLi8uLi9lbnZpcm9ubWVudF92YXJpYWJsZXMuanMnO1xuaW1wb3J0IHsgQmFja2VuZElkZW50aWZpZXIgfSBmcm9tICdAYXdzLWFtcGxpZnkvcGx1Z2luLXR5cGVzJztcblxuY29uc3QgZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XG5jb25zdCBkaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGVuYW1lKTtcbmNvbnN0IHJlc291cmNlc1Jvb3QgPSBwYXRoLm5vcm1hbGl6ZShwYXRoLmpvaW4oZGlybmFtZSwgJ2xhbWJkYScpKTtcbmNvbnN0IGxpbmtlckxhbWJkYUZpbGVQYXRoID0gcGF0aC5qb2luKHJlc291cmNlc1Jvb3QsICdicmFuY2hfbGlua2VyLmpzJyk7XG5cbi8qKlxuICogVHlwZSBvZiB0aGUgYmFja2VuZCBjdXN0b20gQ0ZOIHJlc291cmNlLlxuICovXG5jb25zdCBMSU5LRVJfUkVTT1VSQ0VfVFlQRSA9ICdDdXN0b206OkFtcGxpZnlCcmFuY2hMaW5rZXJSZXNvdXJjZSc7XG5cbi8qKlxuICogQWRkcyBhIGN1c3RvbSByZXNvdXJjZXMgdGhhdCBsaW5rcyBhbmQgdW4tbGlua3MgYnJhbmNoIGRlcGxveW1lbnRzXG4gKiB0byBBbXBsaWZ5IENvbnNvbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbXBsaWZ5QnJhbmNoTGlua2VyQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgQW1wbGlmeSBDb25zb2xlIGxpbmtlciBjb25zdHJ1Y3QuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBiYWNrZW5kSWRlbnRpZmllcjogQmFja2VuZElkZW50aWZpZXIpIHtcbiAgICBzdXBlcihzY29wZSwgJ0FtcGxpZnlCcmFuY2hMaW5rZXInKTtcblxuICAgIGNvbnN0IGVudmlyb25tZW50OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgaWYgKHByb2Nlc3MuZW52W0JhY2tlbmRFbnZpcm9ubWVudFZhcmlhYmxlcy5BV1NfRU5EUE9JTlRfVVJMX0FNUExJRlldKSB7XG4gICAgICAvLyBQYXNzaW5nIGEgc3RhbmRhcmQgQVdTIFNESyBlbnZpcm9ubWVudCB2YXJpYWJsZSBpZiBwcmVzZW50IHRvIG92ZXJyaWRlXG4gICAgICAvLyBBbXBsaWZ5IHNlcnZpY2UgZW5kcG9pbnQuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL3Nka3JlZi9sYXRlc3QvZ3VpZGUvZmVhdHVyZS1zcy1lbmRwb2ludHMuaHRtbFxuICAgICAgZW52aXJvbm1lbnRbQmFja2VuZEVudmlyb25tZW50VmFyaWFibGVzLkFXU19FTkRQT0lOVF9VUkxfQU1QTElGWV0gPVxuICAgICAgICBwcm9jZXNzLmVudltCYWNrZW5kRW52aXJvbm1lbnRWYXJpYWJsZXMuQVdTX0VORFBPSU5UX1VSTF9BTVBMSUZZXTtcbiAgICB9XG4gICAgY29uc3QgbGlua2VyTGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsICdDdXN0b21SZXNvdXJjZUxhbWJkYScsIHtcbiAgICAgIHJ1bnRpbWU6IExhbWJkYVJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5zZWNvbmRzKDEwKSxcbiAgICAgIGVudHJ5OiBsaW5rZXJMYW1iZGFGaWxlUGF0aCxcbiAgICAgIGhhbmRsZXI6ICdoYW5kbGVyJyxcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgYnVuZGxpbmc6IHtcbiAgICAgICAgLy8gVE9ETyBSZW1vdmUgaXQgd2hlbiBMYW1iZGEgc2VydmVzIFNESyAzLjQ0MC4wK1xuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXdzLWFtcGxpZnkvYW1wbGlmeS1iYWNrZW5kL2lzc3Vlcy81NjFcbiAgICAgICAgLy8gVGhpcyBpcyBhZGRlZCB0byBmb3JjZSBidW5kbGVyIHRvIGluY2x1ZGUgbG9jYWwgdmVyc2lvbiBvZiBBV1MgU0RLLlxuICAgICAgICAvLyBMYW1iZGEgcHJvdmlkZWQgdmVyc2lvbiBkb2VzIG5vdCBoYXZlICdiYWNrZW5kLnN0YWNrQXJuJyB5ZXQuXG4gICAgICAgIGV4dGVybmFsTW9kdWxlczogW10sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgbGlua2VyTGFtYmRhLmdyYW50UHJpbmNpcGFsLmFkZFRvUHJpbmNpcGFsUG9saWN5KFxuICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgIGFjdGlvbnM6IFsnYW1wbGlmeTpHZXRCcmFuY2gnLCAnYW1wbGlmeTpVcGRhdGVCcmFuY2gnXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgICAgYGFybjphd3M6YW1wbGlmeToqOio6YXBwcy8ke2JhY2tlbmRJZGVudGlmaWVyLm5hbWVzcGFjZX0vYnJhbmNoZXMvJHtiYWNrZW5kSWRlbnRpZmllci5uYW1lfWAsXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICk7XG5cbiAgICBjb25zdCBjdXN0b21SZXNvdXJjZVByb3ZpZGVyID0gbmV3IFByb3ZpZGVyKFxuICAgICAgdGhpcyxcbiAgICAgICdDdXN0b21SZXNvdXJjZVByb3ZpZGVyJyxcbiAgICAgIHtcbiAgICAgICAgb25FdmVudEhhbmRsZXI6IGxpbmtlckxhbWJkYSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgY3VzdG9tUmVzb3VyY2VQcm9wczogQW1wbGlmeUJyYW5jaExpbmtlckN1c3RvbVJlc291cmNlUHJvcHMgPSB7XG4gICAgICBhcHBJZDogYmFja2VuZElkZW50aWZpZXIubmFtZXNwYWNlLFxuICAgICAgYnJhbmNoTmFtZTogYmFja2VuZElkZW50aWZpZXIubmFtZSxcbiAgICB9O1xuXG4gICAgbmV3IEN1c3RvbVJlc291cmNlKHRoaXMsICdDdXN0b21SZXNvdXJjZScsIHtcbiAgICAgIHNlcnZpY2VUb2tlbjogY3VzdG9tUmVzb3VyY2VQcm92aWRlci5zZXJ2aWNlVG9rZW4sXG4gICAgICBwcm9wZXJ0aWVzOiBjdXN0b21SZXNvdXJjZVByb3BzLFxuICAgICAgcmVzb3VyY2VUeXBlOiBMSU5LRVJfUkVTT1VSQ0VfVFlQRSxcbiAgICB9KTtcbiAgfVxufVxuIl19