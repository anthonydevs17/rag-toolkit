import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "langchain/document";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs";

interface Metadata {
  [key: string]: any;
}

class BrowserPDFLoader extends BaseDocumentLoader {
  private file: File;
  private metadata: Metadata;

  constructor(file: File, metadata: Metadata = {}) {
    super();
    this.file = file;
    this.metadata = metadata;
  }

  async load(): Promise<Document[]> {
    if (!this.file) {
      console.log("No file selected.");
      return [];
    }

    try {
      const fileReader = new FileReader();

      const fileReaderPromise = new Promise<Uint8Array>((resolve, reject) => {
        fileReader.onload = () => {
          resolve(new Uint8Array(fileReader.result as ArrayBuffer));
        };
        fileReader.onerror = error => {
          reject(error);
        };
      });

      fileReader.readAsArrayBuffer(this.file);

      const typedArray = await fileReaderPromise;
      const pdf = await getDocument(typedArray).promise;
      const pagesContent: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => ("str" in item ? item.str : ""))
          .join(" ");
        pagesContent.push(pageText);
      }

      const documents = pagesContent.map(
        (content, index) =>
          new Document({
            pageContent: content,
            metadata: { ...this.metadata, page: index + 1 }
          })
      );

      return documents;
    } catch (error) {
      console.log("Error loading PDF:", error);
      throw new Error("Error loading PDF.");
    }
  }
}

export { BrowserPDFLoader };
