# from groq import Groq
 
# client = Groq()
 
# chat_completion = client.chat.completions.create(
#     messages=[
#         {
#             "role": "system",
#             "content": """
#                 <s>[INST] <<SYS>>\n You are a helpful, respectful and honest assistant. Your task is to generate summary of the provided text tabular data.  <</SYS>> 
#                 [INST] Your job is to create a DETAILED DESCRIPTIVE textual description of a table passed to you in Markdown format. Only create the description on the basis of the table passed to you. Do not add any additional information. Do not give abstract summary.
#                 Link all the columns and corresponding values in the rows within the table using sentences. Keep the description very specific and include all the terminologies or terms from the given table. Do not return the table. Only return the description in paragraphs. 
#                 Take a deep breath and think step by step.
#             """
#         },
#         {
#             "role": "user",
#             "content": "Please describe the markdown table that will be given to you." ,
#         }
#     ],
 
#     model="llama-3.3-70b-versatile",
#     stream=False,
# )
 
# # Print the completion returned by the LLM.
# print(chat_completion.choices[0].message.content)

import os

from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "you are a helpful assistant."
        },
        {
            "role": "user",
            "content": "Explain the importance of fast language models",
        }
    ],
    model="llama-3.3-70b-versatile",
)

print("Response: !!!! ", chat_completion.choices[0].message.content)