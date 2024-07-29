import { BackendIdentifier } from '@aws-amplify/plugin-types';
export type SecretResourceProps = Omit<BackendIdentifier, 'hash'> & {
    secretName: string;
};
//# sourceMappingURL=backend_secret_fetcher_types.d.ts.map