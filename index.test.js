const postcss = require("postcss");

const plugin = require("./");

async function run(input, output) {
  let result = await postcss([plugin()]).process(input, {
    from: undefined,
  });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(0);
}

it("inserts values from config", async () => {
  await run(
    "@themevalues test",
    "--border: 2px solid blue;--brand: #5e81f4;--blue-500: blue"
  );
});

it("does nothing when theme is invalid", async () => {
  await run("@themevalues nonexistent", "@themevalues nonexistent");
});

it("replaces $ with var", async () => {
  await run("color: $blue;", "color: var(--blue);");
});
