import { afterEach, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compile } from "../compile";

const tempDirs: string[] = [];

function createFixture() {
    const dir = mkdtempSync(join(tmpdir(), "swc-cli-compile-"));
    const filename = join(dir, "input.ts");

    writeFileSync(filename, "const value: number = 1;\n");
    tempDirs.push(dir);

    return filename;
}

afterEach(() => {
    while (tempDirs.length > 0) {
        rmSync(tempDirs.pop()!, { recursive: true, force: true });
    }
});

describe("compile", () => {
    const options = {
        jsc: {
            parser: {
                syntax: "typescript" as const,
            },
        },
    };

    it("compile with sync transform", async () => {
        const filename = createFixture();
        const result = await compile(filename, options, true, undefined);

        expect(result).toBeDefined();
        expect(result?.code).toContain("value = 1;");
    });

    it("compile with async transform", async () => {
        const filename = createFixture();
        const result = await compile(filename, options, false, undefined);

        expect(result).toBeDefined();
        expect(result?.code).toContain("value = 1;");
    });
});
