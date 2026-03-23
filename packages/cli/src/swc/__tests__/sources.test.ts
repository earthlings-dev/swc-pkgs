import { afterAll, beforeEach, describe, expect, it, jest, mock } from "bun:test";
import { createFsMock } from "./helpers/mockFs";

const actualFs = await import("node:fs");
const fsMock = createFsMock();
const globMock = jest.fn();

const createMockedFsModule = () => ({
    ...actualFs,
    default: {
        ...(actualFs.default ?? {}),
        readFileSync: fsMock.readFileSync,
        stat: fsMock.stat,
    },
    readFileSync: fsMock.readFileSync,
    stat: fsMock.stat,
});

mock.module("fs", createMockedFsModule);
mock.module("node:fs", createMockedFsModule);

mock.module("tinyglobby", () => ({
    glob: globMock,
}));

const { globSources, splitCompilableAndCopyable } = await import("../sources");

afterAll(() => {
    mock.restore();
});

describe("globSources", () => {
    beforeEach(() => {
        fsMock.resetMockFiles();
        fsMock.resetMockStats();
        globMock.mockReset();
    });

    it("exclude dotfiles sources when includeDotfiles=false", async () => {
        const files = await globSources([".dotfile"], [], [], false);

        expect([...files]).toEqual([]);
    });

    it("include dotfiles sources when includeDotfiles=true", async () => {
        fsMock.setMockStats({ ".dotfile": { isDirectory: () => false } });
        const files = await globSources([".dotfile"], [], [], true);

        expect([...files]).toEqual([".dotfile"]);
    });

    it("include multiple file sources", async () => {
        fsMock.setMockStats({ ".dotfile": { isDirectory: () => false } });
        fsMock.setMockStats({ file: { isDirectory: () => false } });
        const files = await globSources([".dotfile", "file"], [], [], true);

        expect([...files]).toEqual([".dotfile", "file"]);
    });

    it("exclude files that errors on stats", async () => {
        fsMock.setMockStats({ ".dotfile": { isDirectory: () => false } });
        fsMock.setMockStats({ file: new Error("Failed stat") });
        const files = await globSources([".dotfile", "file"], [], [], true);

        expect([...files]).toEqual([".dotfile"]);
    });

    it("includes all files from directory", async () => {
        fsMock.setMockStats({ directory: { isDirectory: () => true } });
        fsMock.setMockStats({ file: { isDirectory: () => false } });
        globMock.mockResolvedValue(["fileDir1", "fileDir2"]);

        const files = await globSources(["file", "directory"], [], [], true);

        expect([...files]).toEqual(["file", "fileDir1", "fileDir2"]);
    });

    it("exclude files from directory that fail to glob", async () => {
        fsMock.setMockStats({ directory: { isDirectory: () => true } });
        fsMock.setMockStats({ file: { isDirectory: () => false } });
        globMock.mockRejectedValue(new Error("Failed"));

        const files = await globSources(["file", "directory"], [], [], true);

        expect([...files]).toEqual(["file"]);
    });
});

describe("splitCompilableAndCopyable", () => {
    const extensions = [".ts"];

    it("separate compilable and copyable when copyFiles=true", () => {
        const files = ["test.ts", "test.txt"];
        const [compilable, copyable] = splitCompilableAndCopyable(
            files,
            extensions,
            true
        );

        expect(compilable).toEqual(["test.ts"]);
        expect(copyable).toEqual(["test.txt"]);
    });

    it("separate compilable and copyable when copyFiles=false", () => {
        const files = ["test.ts", "test.txt"];
        const [compilable, copyable] = splitCompilableAndCopyable(
            files,
            extensions,
            false
        );

        expect(compilable).toEqual(["test.ts"]);
        expect(copyable).toEqual([]);
    });
});
