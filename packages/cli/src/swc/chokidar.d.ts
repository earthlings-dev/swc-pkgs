/**
 * Local type declarations for chokidar v5.
 *
 * Chokidar v5's FSWatcher extends EventEmitter<T> which requires Node.js 22+ types.
 * Since we support Node.js 20.19+, we provide a simplified type interface here
 * that describes the subset of the API we actually use.
 */
declare module "chokidar" {
    import { Stats } from "fs";

    export type AWF = {
        stabilityThreshold: number;
        pollInterval: number;
    };

    export type MatchFunction = (val: string, stats?: Stats) => boolean;

    export interface MatcherObject {
        path: string;
        recursive?: boolean;
    }

    export type Matcher = string | RegExp | MatchFunction | MatcherObject;

    export type ChokidarOptions = {
        persistent?: boolean;
        ignoreInitial?: boolean;
        followSymlinks?: boolean;
        cwd?: string;
        usePolling?: boolean;
        interval?: number;
        binaryInterval?: number;
        alwaysStat?: boolean;
        depth?: number;
        ignorePermissionErrors?: boolean;
        atomic?: boolean | number;
        ignored?: Matcher | Matcher[];
        awaitWriteFinish?: boolean | Partial<AWF>;
    };

    export type EmitArgs = [string, Stats?];

    export interface FSWatcher {
        on(event: "ready", listener: () => void): this;
        on(event: "add" | "change" | "unlink", listener: (path: string, stats?: Stats) => void): this;
        on(event: "addDir" | "unlinkDir", listener: (path: string, stats?: Stats) => void): this;
        on(event: "error", listener: (error: Error) => void): this;
        on(event: "all", listener: (eventName: string, path: string, stats?: Stats) => void): this;
        on(event: "raw", listener: (eventName: string, path: string, details: any) => void): this;
        on(event: string, listener: (...args: any[]) => void): this;
        add(paths: string | string[]): this;
        unwatch(paths: string | string[]): this;
        close(): Promise<void>;
        getWatched(): Record<string, string[]>;
    }

    export function watch(paths: string | string[], options?: ChokidarOptions): FSWatcher;

    const _default: {
        watch: typeof watch;
        FSWatcher: new (options?: ChokidarOptions) => FSWatcher;
    };

    export default _default;
}
