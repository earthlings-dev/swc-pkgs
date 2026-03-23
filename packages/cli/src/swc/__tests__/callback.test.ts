import { afterEach, describe, expect, it, mock } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { swcDir } from "../index";

const tempDirs: string[] = [];

function createFixture(source: string) {
    const rootDir = mkdtempSync(join(process.cwd(), ".tmp-dir-callback-"));
    const inputDir = join(rootDir, "input");
    const filename = join(inputDir, "test.ts");
    const outDir = join(rootDir, "out");

    mkdirSync(inputDir, { recursive: true });
    writeFileSync(filename, source);
    tempDirs.push(rootDir);

    return { filename, outDir };
}

afterEach(() => {
    while (tempDirs.length > 0) {
        rmSync(tempDirs.pop()!, { recursive: true, force: true });
    }
});

const swcOptions = {
    jsc: {
        parser: {
            syntax: "typescript" as const,
        },
    },
};

describe("dir callbacks", () => {
    it("onSuccess should be called", async () => {
        const { filename, outDir } = createFixture("const value: number = 1;\n");
        const onSuccess = mock();
        const onFail = mock();

        await swcDir({
            cliOptions: {
                outDir,
                watch: false,
                filenames: [filename],
                extensions: [".ts"],
                stripLeadingPaths: false,
                sync: true,
                outFile: "",
                filename: "",
                workers: undefined,
                sourceMapTarget: undefined,
                copyFiles: false,
                outFileExtension: "",
                includeDotfiles: false,
                deleteDirOnStart: false,
                quiet: true,
                only: [],
                ignore: [],
            },
            swcOptions,
            callbacks: {
                onSuccess,
                onFail,
            },
        });

        expect(onSuccess.mock.calls).toHaveLength(1);
        expect(onFail.mock.calls).toHaveLength(0);
    });

    it("onFail should be called", async () => {
        const { filename, outDir } = createFixture("const value: = ;\n");
        const onSuccess = mock();
        const onFail = mock();

        await swcDir({
            cliOptions: {
                outDir,
                watch: false,
                filenames: [filename],
                extensions: [".ts"],
                stripLeadingPaths: false,
                sync: true,
                outFile: "",
                filename: "",
                workers: undefined,
                sourceMapTarget: undefined,
                copyFiles: false,
                outFileExtension: "",
                includeDotfiles: false,
                deleteDirOnStart: false,
                quiet: true,
                only: [],
                ignore: [],
            },
            swcOptions,
            callbacks: {
                onSuccess,
                onFail,
            },
        });

        expect(onSuccess.mock.calls).toHaveLength(0);
        expect(onFail.mock.calls).toHaveLength(1);
    });
});
