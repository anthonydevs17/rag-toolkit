/// <reference types="vite/client" />
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { VectorStore } from "@langchain/core/vectorstores";
import { TextInputLoader } from "./utils/loaders/TextInputLoader";
import { BrowserPDFLoader } from "./utils/loaders/BrowserPDFLoader";
import { Document } from "langchain/document";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Embeddings } from "@langchain/core/embeddings";

interface LoaderOptions {
  [key: string]: any;
}

interface ChunkOptions {
  chunkSize: number;
  chunkOverlap: number;
  batchSize?: number; // Optional batch size for processing documents in batches
}

interface RetryOptions {
  retries: number;
  delay: number;
}

interface Source {
  source: string;
  type: string;
}

interface RAGToolkitOptions {
  loaderOptions?: LoaderOptions;
  chunkOptions?: ChunkOptions;
  embeddings?: Embeddings;
  vectorStore?: typeof VectorStore;
  retryOptions?: RetryOptions;
  storeConfig?: Object;
}

class RAGToolkit {
  private loaderOptions: LoaderOptions;
  private storeConfig: Object;
  private chunkOptions: ChunkOptions;
  private embeddings: Embeddings;
  private vectorStore: typeof VectorStore;
  private retryOptions: RetryOptions;
  private isBrowser: boolean;
  private isNode: boolean;
  private loaders: { [key: string]: (source: string) => BaseDocumentLoader };

  constructor(options: RAGToolkitOptions = {}) {
    this.loaderOptions = options.loaderOptions || {};
    this.storeConfig = options.storeConfig || {};
    this.chunkOptions = options.chunkOptions || {
      chunkSize: 1000,
      chunkOverlap: 200,
      batchSize: 100 // Default batch size
    };
    this.embeddings =
      options.embeddings ||
      new OpenAIEmbeddings({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });

    this.vectorStore = options.vectorStore || MemoryVectorStore;
    this.retryOptions = options.retryOptions || { retries: 3, delay: 4000 };

    this.isBrowser =
      typeof window !== "undefined" && typeof window.document !== "undefined";
    this.isNode =
      typeof process !== "undefined" &&
      process.versions != null &&
      process.versions.node != null;

    this.loaders = {
      string: source => new TextInputLoader(source),
      text: source => new TextLoader(source),
      pdf: source =>
        this.isBrowser
          ? new BrowserPDFLoader(new File([source as any], "document.pdf"))
          : new PDFLoader(source),
      web: source => new CheerioWebBaseLoader(source)
    };
  }

  registerLoader(
    type: string,
    loaderFunction: (source: string) => BaseDocumentLoader
  ) {
    if (this.loaders[type]) {
      throw new Error(`Loader type '${type}' is already registered.`);
    }
    this.loaders[type] = loaderFunction;
  }

  async withRetries<T>(
    fn: () => Promise<T>,
    retries: number,
    delay: number
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (error instanceof Error) {
          console.log(`Error: ${error.message}`);
        } else {
          console.log(`Error: ${String(error)}`);
        }
        console.log({ error });

        if (attempt < retries) {
          console.warn(`Retrying... (${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
    throw new Error("Function did not succeed within the retry limit");
  }

  async loadDocuments(sources: Source[]): Promise<Document[]> {
    const promises = sources.map(({ source, type }) => {
      const loaderFn = this.loaders[type];
      if (!loaderFn) {
        console.error(`Unsupported loader type '${type}'.`);
        return Promise.resolve([]); // Skip unsupported types
      }

      const loader = loaderFn(source);

      return this.withRetries(
        async () => {
          const documents = await loader.load();
          console.log(
            `Loaded ${documents.length} documents from ${source} (${type}).`
          );
          return documents;
        },
        this.retryOptions.retries,
        this.retryOptions.delay
      ).catch(error => {
        console.error(
          `Error loading source '${source}' (${type}): ${error.message}`
        );
        return []; // Return empty array on failure
      });
    });

    const results = await Promise.all(promises);
    return results.flat();
  }

  async chunkDocuments(documents: Document[]): Promise<Document[]> {
    const textSplitter = new RecursiveCharacterTextSplitter(this.chunkOptions);
    const batchSize = this.chunkOptions.batchSize || 100; // Default batch size if not provided
    const chunks: Document[] = [];

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchChunks = await textSplitter.splitDocuments(batch);
      chunks.push(...batchChunks);
    }

    return chunks;
  }

  async storeEmbeddings(documents: Document[]): Promise<VectorStore> {
    const chunks = await this.chunkDocuments(documents);
    return await this.vectorStore.fromDocuments(
      chunks,
      this.embeddings,
      this.storeConfig
    );
  }

  async initializeRAG(sources: Source[]): Promise<any> {
    try {
      const documents = await this.loadDocuments(sources);
      if (documents.length === 0) {
        throw new Error(
          "No documents were loaded. Check your sources and types."
        );
      }
      const vectorStoreInstance = await this.storeEmbeddings(documents);
      return this.createRetriever(vectorStoreInstance);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error initializing RAG: ${error.message}`);
      } else {
        console.error(`Error initializing RAG: ${String(error)}`);
      }
      throw error;
    }
  }

  createRetriever(vectorStoreInstance: VectorStore): any {
    return vectorStoreInstance.asRetriever();
  }
}

export default RAGToolkit;
