import { jest } from "bun:test";

type MockStats = {
    isDirectory: () => boolean;
};

type StatCallback = (err: Error | null, stats?: MockStats) => void;

export function createFsMock() {
    let mockStats: Record<string, MockStats | Error> = {};
    let mockFiles: Record<string, string> = {};

    const stat = jest.fn((filePath: string, cb: StatCallback) => {
        const result = mockStats[filePath];
        if (result instanceof Error) {
            cb(result);
            return;
        }

        cb(null, result);
    });

    const readFileSync = jest.fn((filePath: string) => {
        if (!(filePath in mockFiles)) {
            throw new Error("Non existent.");
        }

        return mockFiles[filePath];
    });

    return {
        readFileSync,
        resetMockFiles() {
            mockFiles = {};
            readFileSync.mockClear();
        },
        resetMockStats() {
            mockStats = {};
            stat.mockClear();
        },
        setMockFile(filePath: string, contents: string) {
            mockFiles[filePath] = contents;
        },
        setMockStats(stats: Record<string, MockStats | Error>) {
            Object.assign(mockStats, stats);
        },
        stat,
    };
}
