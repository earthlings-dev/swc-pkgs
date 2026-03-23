import { afterEach, describe, expect, it } from "bun:test";
import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { CompileStatus } from "../constants";
import handleCompile from "../dirWorker";
import { getDest } from "../util";

const tempDirs: string[] = [];

function createFixture() {
    const rootDir = mkdtempSync(join(process.cwd(), ".tmp-dir-worker-"));
    const inputDir = join(rootDir, "input");
    const filename = join(inputDir, "test.ts");
    const outDir = join(rootDir, "out");

    mkdirSync(inputDir, { recursive: true });
    writeFileSync(filename, "const value: number = 1;\n");
    tempDirs.push(rootDir);

    return { filename, outDir };
}

afterEach(() => {
    while (tempDirs.length > 0) {
        rmSync(tempDirs.pop()!, { recursive: true, force: true });
    }
});

describe("dirWorker", () => {
    const baseCliOptions = {
        outDir: "",
        outFile: "",
        filename: "",
        stripLeadingPaths: false,
        filenames: [],
        sync: false,
        workers: undefined,
        sourceMapTarget: undefined,
        extensions: [],
        watch: false,
        copyFiles: false,
        outFileExtension: "",
        includeDotfiles: false,
        deleteDirOnStart: false,
        quiet: true,
        only: [],
        ignore: [],
    };

    const swcOptions = {
        jsc: {
            parser: {
                syntax: "typescript" as const,
            },
        },
    };

    it('writes the corresponding extension when "outFileExtension" is undefined', async () => {
        const { filename, outDir } = createFixture();
        const expectedDest = getDest(filename, outDir, false, ".js");
        const status = await handleCompile({
            filename,
            outDir,
            sync: false,
            cliOptions: {
                ...baseCliOptions,
                outDir,
            },
            swcOptions,
        });

        expect(status).toBe(CompileStatus.Compiled);
        expect(existsSync(expectedDest)).toBe(true);
        expect(await Bun.file(expectedDest).text()).toContain("value = 1;");
    });

    it('writes "outFileExtension" when it is set in options', async () => {
        const { filename, outDir } = createFixture();
        const outFileExtension = "cjs";
        const expectedDest = getDest(
            filename,
            outDir,
            false,
            `.${outFileExtension}`
        );
        const status = await handleCompile({
            filename,
            outDir,
            sync: false,
            cliOptions: {
                ...baseCliOptions,
                outDir,
                outFileExtension,
            },
            swcOptions,
            outFileExtension,
        });

        expect(status).toBe(CompileStatus.Compiled);
        expect(existsSync(expectedDest)).toBe(true);
        expect(await Bun.file(expectedDest).text()).toContain("value = 1;");
    });
});
