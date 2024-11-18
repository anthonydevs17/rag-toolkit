# RAG Toolkit

## Description

RAG Toolkit is a library designed to facilitate the use of Retrieval-Augmented Generation (RAG) techniques. It provides various loaders, embeddings, and storage options using the LangChain library.

## Installation

To install the RAG Toolkit, you need to have Node.js and npm installed. Then, you can install the dependencies using the following command:

```bash
npm install
```

## Usage

### Building the Project

To build the project, run:

```bash
npm run build
```

### Development Server

To start the development server, run:

```bash
npm run dev
```

### Type Checking

To perform type checking, run:

```bash
npm run type-check
```

## Examples

### Creating a RAG Toolkit Instance

Here is an example of how to create a RAG Toolkit instance with different embeddings and storage options using the LangChain library:

```javascript
import RAGToolkit from "rag-toolkit";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const embeddings = new OpenAIEmbeddings({
  apiKey: "your-openai-api-key"
});

const vectorStore = MemoryVectorStore;

const ragToolkit = new RAGToolkit({
  embeddings,
  vectorStore
});

console.log("RAG Toolkit instance created:", ragToolkit);
```

### Using Different Loaders

#### Text Loader

```javascript
import RAGToolkit from "rag-toolkit";

const ragToolkit = new RAGToolkit();
const sources = [{ source: "path/to/your/file.txt", type: "text" }];

ragToolkit.initializeRAG(sources).then(retriever => {
  console.log("Retriever initialized:", retriever);
});
```

#### PDF Loader

```javascript
import RAGToolkit from "rag-toolkit";

const ragToolkit = new RAGToolkit();
const sources = [{ source: "path/to/your/file.pdf", type: "pdf" }];

ragToolkit.initializeRAG(sources).then(retriever => {
  console.log("Retriever initialized:", retriever);
});
```

#### Web Loader

```javascript
import RAGToolkit from "rag-toolkit";

const ragToolkit = new RAGToolkit();
const sources = [{ source: "https://example.com", type: "web" }];

ragToolkit.initializeRAG(sources).then(retriever => {
  console.log("Retriever initialized:", retriever);
});
```

### Using Different Vector Stores

#### Pinecone Vector Store

```javascript
import RAGToolkit from "rag-toolkit";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeVectorStore } from "@langchain/pinecone";

const embeddings = new OpenAIEmbeddings({
  apiKey: "your-openai-api-key"
});

const vectorStore = PineconeVectorStore;

const ragToolkit = new RAGToolkit({
  embeddings,
  vectorStore
});

console.log(
  "RAG Toolkit instance with Pinecone Vector Store created:",
  ragToolkit
);
```

#### Chroma Vector Store

```javascript
import RAGToolkit from "rag-toolkit";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChromaVectorStore } from "@langchain/chroma";

const embeddings = new OpenAIEmbeddings({
  apiKey: "your-openai-api-key"
});

const vectorStore = ChromaVectorStore;

const ragToolkit = new RAGToolkit({
  embeddings,
  vectorStore
});

console.log(
  "RAG Toolkit instance with Chroma Vector Store created:",
  ragToolkit
);
```

## License

This project is licensed under the ISC License.
