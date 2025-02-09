import os
from dotenv import load_dotenv
from langchain_openai.chat_models import ChatOpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain_pinecone import PineconeVectorStore
from langchain_text_splitters import MarkdownHeaderTextSplitter
from pinecone import Pinecone
from langchain_community.vectorstores import Pinecone as Pine
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from openai import OpenAI
import requests

load_dotenv(override=True)
OPENAI_KEY=os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY=os.getenv("PINECONE_API_KEY")
stack_api_key = os.getenv('STACK_API_KEY')
parser = StrOutputParser()

pc=Pinecone(api_key=PINECONE_API_KEY)
index=pc.Index("solana")
embeddings = OpenAIEmbeddings( model="text-embedding-3-small", openai_api_key=OPENAI_KEY)
vectorstore=PineconeVectorStore(index, embeddings)

messages=[{
             'role': 'system',
                'content': f""""You are a blockchain expert for Solana who helps assistants answer user queries.
                You have acces to documents and stack exchange that will help you give the right answers to the user queries.
                The user has asked the assistant a questiona and you need to instruct the assistant to answer the user's query based on the context provided.
                You will have two types of context 1) Internal Documents 2) Stack Exchange
                You need to see what information from each category needs to be used to abswer the user's query.
                Instruct the assistant properly so that it can go ahead and help the user.
                """
            }]

client=OpenAI(api_key=OPENAI_KEY)

def load_data():
    loader = TextLoader(r"document.txt")
    text = loader.load()[0].page_content

    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"), 
        ("###", "Header 3"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    header_splits = markdown_splitter.split_text(text)

    from langchain.text_splitter import RecursiveCharacterTextSplitter
    
    recursive_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000, 
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    final_docs = []
    for doc in header_splits:
        metadata = doc.metadata
        splits = recursive_splitter.create_documents(
            [doc.page_content], 
            metadatas=[metadata]
        )
        final_docs.extend(splits)
    
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=OPENAI_KEY)
    index_name = "solana"
    batch_size = 100
    for i in range(0, len(final_docs), batch_size):
        batch = final_docs[i:i + batch_size]
        if i == 0:
            Pinecone = PineconeVectorStore.from_documents(
                batch,
                embeddings,
                index_name=index_name
            )
        else:
            Pinecone.add_documents(batch)
    
    results = Pinecone.similarity_search("mutual funds", k=8)
    print(results)
    

def search_stack_exchange(query, site='solana.stackexchange.com'):
    search_url = f"https://api.stackexchange.com/2.3/search/advanced"
    params = {
        'key': stack_api_key,
        'site': site,
        'q': query,
        'sort': 'relevance',
        'order': 'desc',
        'filter': 'withbody',
        'pagesize': 2  # Fetch top 2 most relevant questions
    }
    
    response = requests.get(search_url, params=params)
    if response.status_code != 200:
        raise Exception(f"Error: {response.status_code}")
    
    data = response.json()
    questions = data.get('items', [])
    
    results = []
    for question in questions:
        question_id = question['question_id']
        question_title = question['title']
        question_body = question['body']
        
        # Fetch answers for the question
        answers_url = f"https://api.stackexchange.com/2.3/questions/{question_id}/answers"
        answers_params = {
            'key': stack_api_key,
            'site': site,
            'sort': 'votes',
            'order': 'desc',
            'filter': 'withbody',
            'pagesize': 2  # Fetch top 2 answers
        }
        
        answers_response = requests.get(answers_url, params=answers_params)
        if answers_response.status_code != 200:
            raise Exception(f"Error: {answers_response.status_code}")
        
        answers_data = answers_response.json()
        answers = answers_data.get('items', [])
        
        # Extract top 2 answers
        top_answers = []
        for answer in answers:
            top_answers.append({
                'body': answer['body'],
                'score': answer['score']
            })
        
        results.append({
            'question_title': question_title,
            'question_body': question_body,
            'answers': top_answers
        })
    
    return results

def get_relevant_info(query):
    context=vectorstore.similarity_search(query, k=6)
    stack_context=search_stack_exchange(query)
    formatted_user_query = f"""
        This is the User's Query:\n
        {query}
        This is the context retrieved based on the internal documents:\n
        {context}
        This is the context retrieved based on the stack exchange:\n
        {stack_context}
    """
    messages.append(
            {
                'role': 'user',
                'content': formatted_user_query
            })
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
    )
    out = response.choices[0].message.content
    print(out)
    return out



if __name__=="__main__":
    query="What are the use cases of Program Derived Addresses?"
    output=get_relevant_info(query)
    print(output)
    # load_data()