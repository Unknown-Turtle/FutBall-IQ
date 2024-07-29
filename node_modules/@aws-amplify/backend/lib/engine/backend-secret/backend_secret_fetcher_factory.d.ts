import { Construct } from 'constructs';
import { BackendSecretFetcherProviderFactory } from './backend_secret_fetcher_provider_factory.js';
import { CustomResource } from 'aws-cdk-lib';
import { BackendIdentifier } from '@aws-amplify/plugin-types';
/**
 * Resource provider ID for the backend secret resource.
 */
export declare const SECRET_RESOURCE_PROVIDER_ID = "SecretFetcherResourceProvider";
/**
 * The factory to create backend secret-fetcher resource.
 */
export declare class BackendSecretFetcherFactory {
    private readonly secretProviderFactory;
    /**
     * Creates a backend secret-fetcher resource factory.
     */
    constructor(secretProviderFactory: BackendSecretFetcherProviderFactory);
    /**
     * Returns a resource if it exists in the input scope. Otherwise,
     * creates a new one.
     */
    getOrCreate: (scope: Construct, secretName: string, backendIdentifier: BackendIdentifier) => CustomResource;
}
//# sourceMappingURL=backend_secret_fetcher_factory.d.ts.map