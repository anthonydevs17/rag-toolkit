import React, { useState, useEffect } from "react";
import RAGToolkit from "../ragToolkit";

const App = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retriever, setRetriever] = useState(null); // Store the retriever

  const largeText = `
    Artificial Intelligence (AI) is a rapidly evolving field that seeks to build machines capable of performing tasks
    that typically require human intelligence. These tasks include problem-solving, decision-making, understanding
    natural language, and recognizing patterns. AI systems are powered by algorithms, and these algorithms can be
    categorized into supervised learning, unsupervised learning, reinforcement learning, and deep learning.
    
    Supervised learning uses labeled data to train models, while unsupervised learning identifies patterns in data without
    explicit labels. Reinforcement learning, on the other hand, focuses on teaching agents to make decisions by rewarding
    desirable outcomes and penalizing undesirable ones. Deep learning, a subset of AI, leverages neural networks with
    multiple layers to process large datasets and make predictions.

    The applications of AI are vast, ranging from healthcare and finance to entertainment and autonomous vehicles.
    Healthcare uses AI to improve diagnostics and personalize treatment plans. In finance, AI enhances fraud detection
    and automates trading. Entertainment platforms like Netflix and Spotify use AI to recommend content tailored to
    user preferences.

    However, as AI advances, it also raises ethical concerns. Issues such as data privacy, algorithmic bias, and
    unemployment due to automation are some of the challenges society must address. Nevertheless, with responsible
    development, AI holds the potential to revolutionize industries and improve lives on a global scale.
  `;

  useEffect(() => {
    // Initialize RAGToolkit and the retriever once when the component mounts
    const initializeToolkit = async () => {
      const toolkit = new RAGToolkit();
      try {
        const initializedRetriever = await toolkit.initializeRAG([
          { source: largeText, type: "string" }
        ]);
        setRetriever(initializedRetriever); // Store the retriever
        console.log("RAGToolkit and retriever initialized successfully.");
      } catch (error) {
        console.error("Error initializing RAGToolkit:", error.message);
      }
    };

    initializeToolkit();
  }, []); // Empty dependency array ensures this runs only once

  const handleQuery = async () => {
    if (!query) {
      setResults([{ response: "Please enter a query.", metadata: {} }]);
      return;
    }
    if (!retriever) {
      setResults([
        {
          response: "RAGToolkit is not initialized yet. Please wait.",
          metadata: {}
        }
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await retriever.invoke(query);
      console.log("Retriever response:", result);
      const formattedResults = result.map(res => ({
        response: res.pageContent,
        metadata: res.metadata
      }));

      setResults(
        Array.isArray(formattedResults)
          ? formattedResults
          : [{ response: "No relevant information found.", metadata: {} }]
      );
    } catch (error) {
      setResults([
        { response: `Error querying retriever: ${error.message}`, metadata: {} }
      ]);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>RAG Toolkit Demo</h1>
      <div>
        <textarea
          rows={10}
          cols={80}
          value={largeText}
          readOnly
          style={{ width: "100%", marginBottom: "20px" }}
        ></textarea>
        <div>
          <input
            type="text"
            placeholder="Enter your query here"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: "70%",
              padding: "10px",
              fontSize: "16px",
              marginBottom: "10px"
            }}
          />
          <button
            onClick={handleQuery}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              marginLeft: "10px",
              cursor: "pointer"
            }}
          >
            {isLoading ? "Loading..." : "Submit Query"}
          </button>
        </div>
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc"
          }}
        >
          <h3>Response:</h3>
          <ul>
            {results.map((result, index) => (
              <li key={index}>
                <p>
                  <strong>Response:</strong> {result.response}
                </p>
                <p>
                  <strong>Metadata:</strong> {JSON.stringify(result.metadata)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
