import { MODEL, queryText } from "./frontier-config.mjs";

let extractorPromise;

async function extractor() {
  extractorPromise ??= import("@huggingface/transformers").then(({ pipeline }) =>
    pipeline("feature-extraction", MODEL.id, {
      revision: MODEL.revision,
      dtype: MODEL.dtype
    })
  );
  return extractorPromise;
}

export async function embedDocuments(texts, { batchSize = 8 } = {}) {
  const model = await extractor();
  const vectors = [];
  for (let offset = 0; offset < texts.length; offset += batchSize) {
    const output = await model(texts.slice(offset, offset + batchSize), {
      pooling: MODEL.pooling,
      normalize: MODEL.normalize
    });
    vectors.push(...output.tolist());
  }
  return vectors;
}

export async function embedQueries(queries) {
  return embedDocuments(queries.map(queryText));
}
