await Bun.build({
  entrypoints: ["./bin/bimc.ts"],
  outdir: "./dist",
  target: "node",
  format: "esm",
  sourcemap: "none",
  minify: true,
});
