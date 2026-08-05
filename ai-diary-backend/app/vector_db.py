# import chromadb

# client = chromadb.Client()

# collection = client.get_or_create_collection(
#     name="diary_embeddings"
# )

# import chromadb
# from chromadb.config import Settings

# client = chromadb.Client(
#     Settings(
#         persist_directory="./chroma_db"
#     )
# )

# collection = client.get_or_create_collection(
#     name="diary_embeddings"
# )

import chromadb

# Modern way to ensure persistence
client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="diary_embeddings"
)