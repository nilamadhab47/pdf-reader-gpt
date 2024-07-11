import { env } from "./config";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PineconeClient } from "@pinecone-database/pinecone";

export async function pineconeEmbedAndStore(
  client: PineconeClient,
  // @ts-ignore docs type error
  docs: Document<Record<string, any>>[]
) {
  /*create and store the embeddings in the vectorStore*/
  try {
    const embeddings = new OpenAIEmbeddings();
    const index = client.Index(env.PINECONE_INDEX_NAME);

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });
  } catch (error) {
    console.log("error ", error);
    throw new Error("Failed to load your docs !");
  }
}

export async function getVectorStore(client: PineconeClient) {
  try {
    const embeddings = new OpenAIEmbeddings();
    const index = client.Index(env.PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });

    return vectorStore;
  } catch (error) {
    console.log("error ", error);
    throw new Error("Something went wrong while getting vector store !");
  }
}


// import { env } from "./config";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { PineconeStore } from "langchain/vectorstores/pinecone";
// import { PineconeClient } from "@pinecone-database/pinecone";

// export async function pineconeEmbedAndStore(
//   client: PineconeClient,
//   // @ts-ignore docs type error
//   docs: Document<Record<string, any>>[]
// ) {
//   /*create and store the embeddings in the vectorStore*/
//   try {
//     const embeddings = new OpenAIEmbeddings();
//     const index = client.Index(env.PINECONE_INDEX_NAME);

//     //embed the PDF documents
//     await PineconeStore.fromDocuments(docs, embeddings, {
//       pineconeIndex: index,
//       textKey: "text",
//       contentKey: "pageContent", // Add this line to include the page content
//     });
//   } catch (error) {
//     console.log("error ", error);
//     throw new Error("Failed to load your docs !");
//   }
// }