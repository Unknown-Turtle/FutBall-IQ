import path from 'path';
import * as os from 'os';
import { FilePathExtractor } from '@aws-amplify/platform-core';
/**
 * ImportPathVerifier that can be turned into a noop by passing `false` to the constructor
 */
export class ToggleableImportPathVerifier {
    doVerify;
    /**
     * Defaults to verifying, but can be turned into a noop by passing in false.
     */
    constructor(doVerify = true) {
        this.doVerify = doVerify;
    }
    /**
     * @inheritDoc
     */
    verify = (importStack, expectedImportSuffix, errorMessage) => {
        if (!this.doVerify) {
            return;
        }
        if (!importStack) {
            return;
        }
        // normalize EOL to \n so that parsing is consistent across platforms
        importStack = importStack.replaceAll(os.EOL, '\n');
        const stacktraceLines = importStack
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.startsWith('at')) || [];
        if (stacktraceLines.length < 2) {
            return;
        }
        const stackTraceImportLine = stacktraceLines[1]; // the first entry is the file where the error was initialized (our code). The second entry is where the customer called our code which is what we are interested in
        const filePath = new FilePathExtractor(stackTraceImportLine).extract();
        if (!filePath) {
            // don't fail if for some reason we can't parse the stack trace
            return;
        }
        const parts = path.parse(filePath);
        const pathWithoutExtension = path.join(parts.dir, parts.name);
        if (!pathWithoutExtension.endsWith(expectedImportSuffix)) {
            throw new Error(errorMessage);
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlYWJsZV9pbXBvcnRfcGF0aF92ZXJpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9lbmdpbmUvdmFsaWRhdGlvbnMvdG9nZ2xlYWJsZV9pbXBvcnRfcGF0aF92ZXJpZmllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDekIsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFL0Q7O0dBRUc7QUFDSCxNQUFNLE9BQU8sNEJBQTRCO0lBSVY7SUFIN0I7O09BRUc7SUFDSCxZQUE2QixXQUFXLElBQUk7UUFBZixhQUFRLEdBQVIsUUFBUSxDQUFPO0lBQUcsQ0FBQztJQUVoRDs7T0FFRztJQUNILE1BQU0sR0FBRyxDQUNQLFdBQStCLEVBQy9CLG9CQUE0QixFQUM1QixZQUFvQixFQUNkLEVBQUU7UUFDUixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNsQixPQUFPO1NBQ1I7UUFDRCxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2hCLE9BQU87U0FDUjtRQUNELHFFQUFxRTtRQUNyRSxXQUFXLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRW5ELE1BQU0sZUFBZSxHQUNuQixXQUFXO2FBQ1IsS0FBSyxDQUFDLElBQUksQ0FBQzthQUNYLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQzFCLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuRCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlCLE9BQU87U0FDUjtRQUNELE1BQU0sb0JBQW9CLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsb0tBQW9LO1FBRXJOLE1BQU0sUUFBUSxHQUFHLElBQUksaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUV2RSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2IsK0RBQStEO1lBQy9ELE9BQU87U0FDUjtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRTtZQUN4RCxNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQy9CO0lBQ0gsQ0FBQyxDQUFDO0NBQ0giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbXBvcnRQYXRoVmVyaWZpZXIgfSBmcm9tICdAYXdzLWFtcGxpZnkvcGx1Z2luLXR5cGVzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHsgRmlsZVBhdGhFeHRyYWN0b3IgfSBmcm9tICdAYXdzLWFtcGxpZnkvcGxhdGZvcm0tY29yZSc7XG5cbi8qKlxuICogSW1wb3J0UGF0aFZlcmlmaWVyIHRoYXQgY2FuIGJlIHR1cm5lZCBpbnRvIGEgbm9vcCBieSBwYXNzaW5nIGBmYWxzZWAgdG8gdGhlIGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBjbGFzcyBUb2dnbGVhYmxlSW1wb3J0UGF0aFZlcmlmaWVyIGltcGxlbWVudHMgSW1wb3J0UGF0aFZlcmlmaWVyIHtcbiAgLyoqXG4gICAqIERlZmF1bHRzIHRvIHZlcmlmeWluZywgYnV0IGNhbiBiZSB0dXJuZWQgaW50byBhIG5vb3AgYnkgcGFzc2luZyBpbiBmYWxzZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZG9WZXJpZnkgPSB0cnVlKSB7fVxuXG4gIC8qKlxuICAgKiBAaW5oZXJpdERvY1xuICAgKi9cbiAgdmVyaWZ5ID0gKFxuICAgIGltcG9ydFN0YWNrOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgZXhwZWN0ZWRJbXBvcnRTdWZmaXg6IHN0cmluZyxcbiAgICBlcnJvck1lc3NhZ2U6IHN0cmluZ1xuICApOiB2b2lkID0+IHtcbiAgICBpZiAoIXRoaXMuZG9WZXJpZnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFpbXBvcnRTdGFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBub3JtYWxpemUgRU9MIHRvIFxcbiBzbyB0aGF0IHBhcnNpbmcgaXMgY29uc2lzdGVudCBhY3Jvc3MgcGxhdGZvcm1zXG4gICAgaW1wb3J0U3RhY2sgPSBpbXBvcnRTdGFjay5yZXBsYWNlQWxsKG9zLkVPTCwgJ1xcbicpO1xuXG4gICAgY29uc3Qgc3RhY2t0cmFjZUxpbmVzID1cbiAgICAgIGltcG9ydFN0YWNrXG4gICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgLm1hcCgobGluZSkgPT4gbGluZS50cmltKCkpXG4gICAgICAgIC5maWx0ZXIoKGxpbmUpID0+IGxpbmUuc3RhcnRzV2l0aCgnYXQnKSkgfHwgW107XG4gICAgaWYgKHN0YWNrdHJhY2VMaW5lcy5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHN0YWNrVHJhY2VJbXBvcnRMaW5lID0gc3RhY2t0cmFjZUxpbmVzWzFdOyAvLyB0aGUgZmlyc3QgZW50cnkgaXMgdGhlIGZpbGUgd2hlcmUgdGhlIGVycm9yIHdhcyBpbml0aWFsaXplZCAob3VyIGNvZGUpLiBUaGUgc2Vjb25kIGVudHJ5IGlzIHdoZXJlIHRoZSBjdXN0b21lciBjYWxsZWQgb3VyIGNvZGUgd2hpY2ggaXMgd2hhdCB3ZSBhcmUgaW50ZXJlc3RlZCBpblxuXG4gICAgY29uc3QgZmlsZVBhdGggPSBuZXcgRmlsZVBhdGhFeHRyYWN0b3Ioc3RhY2tUcmFjZUltcG9ydExpbmUpLmV4dHJhY3QoKTtcblxuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIC8vIGRvbid0IGZhaWwgaWYgZm9yIHNvbWUgcmVhc29uIHdlIGNhbid0IHBhcnNlIHRoZSBzdGFjayB0cmFjZVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnRzID0gcGF0aC5wYXJzZShmaWxlUGF0aCk7XG4gICAgY29uc3QgcGF0aFdpdGhvdXRFeHRlbnNpb24gPSBwYXRoLmpvaW4ocGFydHMuZGlyLCBwYXJ0cy5uYW1lKTtcbiAgICBpZiAoIXBhdGhXaXRob3V0RXh0ZW5zaW9uLmVuZHNXaXRoKGV4cGVjdGVkSW1wb3J0U3VmZml4KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgfVxuICB9O1xufVxuIl19