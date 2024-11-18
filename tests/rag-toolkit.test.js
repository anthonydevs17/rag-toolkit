import RAGToolkit from "../src/ragToolkit";

describe("RAGToolkit", () => {
  it("should register a custom loader", () => {
    const toolkit = new RAGToolkit();
    toolkit.registerLoader("custom", source => ({
      load: () => [{ content: source }]
    }));
    const loader = toolkit.loaders["custom"];
    expect(loader).toBeDefined();
  });
});
