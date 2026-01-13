-- Gemini Text Embedding models output 768 dimensions, not 1536 (which is OpenAI)
-- We need to resize the column and recreate the search function

-- 1. Resize the column
alter table documents alter column embedding type vector(768);

-- 2. Drop the old function (it references the old type)
drop function if exists match_documents;

-- 3. Recreate the function with 768 dimensions
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
