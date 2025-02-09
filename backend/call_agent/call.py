import os
import json
import base64
import asyncio
import websockets
from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.websockets import WebSocketDisconnect
from twilio.twiml.voice_response import VoiceResponse, Connect, Say, Stream
import sys
from dotenv import load_dotenv
from get_info import get_relevant_info
from get_price import get_coin_price, get_top_5_trending
from coin_methods import send_sol_to, swap_coin, return_Balance
load_dotenv()



# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PORT = int(os.getenv('PORT', 5050))

VOICE = 'sage'
LOG_EVENT_TYPES = [
    'error', 'response.content.done', 'rate_limits.updated',
    'response.done', 'input_audio_buffer.committed',
    'input_audio_buffer.speech_stopped', 'input_audio_buffer.speech_started',
    'session.created',
    'error',
    'response.content.done',
    'rate_limits.updated',
    'response.done',
    'input_audio_buffer.committed',
    'input_audio_buffer.speech_stopped',
    'input_audio_buffer.speech_started',
    'session.created',

    # Transcripts
    'response.audio_transcript.done',
    'conversation.item.input_audio_transcription.completed',
]
SHOW_TIMING_MATH = False

conv_history=[]
app = FastAPI()

if not OPENAI_API_KEY:
    raise ValueError('Missing the OpenAI API key. Please set it in the .env file.')

@app.get("/", response_class=JSONResponse)
async def index_page():
    return {"message": "Twilio Media Stream Server is running!"}

@app.api_route("/incoming-call", methods=["GET", "POST"])
async def handle_incoming_call(request: Request):
    """Handle incoming call and return TwiML response to connect to Media Stream."""
    response = VoiceResponse()
    # <Say> punctuation to improve text-to-speech flow
    response.say("Please wait")
    response.pause(length=1)
    response.say("O.K. you can start talking!")
    host = request.url.hostname
    connect = Connect()
    connect.stream(url=f'wss://{host}/media-stream')
    response.append(connect)
    return HTMLResponse(content=str(response), media_type="application/xml")

@app.websocket("/media-stream")
async def handle_media_stream(websocket: WebSocket):
    """Handle WebSocket connections between Twilio and OpenAI."""
    print("Client connected")
    await websocket.accept()

    async with websockets.connect(
        'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        extra_headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "OpenAI-Beta": "realtime=v1"
        }
    ) as openai_ws:
        await initialize_session(openai_ws)

        # Connection specific state
        stream_sid = None
        latest_media_timestamp = 0
        last_assistant_item = None
        mark_queue = []
        response_start_timestamp_twilio = None
        
        async def receive_from_twilio():
            """Receive audio data from Twilio and send it to the OpenAI Realtime API."""
            nonlocal stream_sid, latest_media_timestamp
            try:
                async for message in websocket.iter_text():
                    data = json.loads(message)
                    if data['event'] == 'media' and openai_ws.open:
                        latest_media_timestamp = int(data['media']['timestamp'])
                        audio_append = {
                            "type": "input_audio_buffer.append",
                            "audio": data['media']['payload']
                        }
                        await openai_ws.send(json.dumps(audio_append))
                    elif data['event'] == 'start':
                        stream_sid = data['start']['streamSid']
                        print(f"Incoming stream has started {stream_sid}")
                        response_start_timestamp_twilio = None
                        latest_media_timestamp = 0
                        last_assistant_item = None
                    elif data['event'] == 'mark':
                        if mark_queue:
                            mark_queue.pop(0)
                    elif data['event'] == 'stop':
                        print("Stream ended.")
                        with open('output.txt', 'w') as file:
                            file.write(str(conv_history))
                        # extract_and_update()
                        sys.exit(0)
                        break
            except WebSocketDisconnect:
                print("Client disconnected.")
                
                if openai_ws.open:
                    await openai_ws.close()

        async def send_to_twilio():
            """Receive events from the OpenAI Realtime API, send audio back to Twilio."""
            nonlocal stream_sid, last_assistant_item, response_start_timestamp_twilio
            try:
                async for openai_message in openai_ws:
                    response = json.loads(openai_message)
                    if response['type'] in LOG_EVENT_TYPES:
                        print(f"Received event: {response['type']}", response)
                        if (response.get('type') == 'response.done' and 
                            response.get("response", {}).get("output") and  # Check if output exists and is not empty
                            len(response["response"]["output"]) > 0 and     # Check if output has at least one element
                            response["response"]["output"][0].get("type") == "function_call"):
                            # if  response["response"]["output"][0]["name"]=="plan_meeting"\
                            #     and "arguments" in response["response"]["output"][0]:
                            #     arguments = json.loads(response["response"]["output"][0]["arguments"])
                            #     print(arguments)
                            #     email="nspd@umd.edu"
                            #     date=arguments["date"]
                            #     time=arguments["time"]
                            #     duration=arguments["duration"]
                            #     subject=arguments["subject"]
                            #     plan_meeting(email, date, time, duration, subject)
                            #     print("added meeting SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS")
                            if response["response"]["output"][0]["name"]=="get_relevant_information"\
                                and "arguments" in response["response"]["output"][0]:
                                arguments = json.loads(response["response"]["output"][0]["arguments"])
                                print(arguments)
                                topic=arguments["topic"]
                                context = get_relevant_info(topic)
                                conversation_item = {
                                        "type": "conversation.item.create",
                                        "item": {
                                        "type": "message",
                                        "role": "user",
                                        "content": [
                                            {
                                                "type": "input_text",
                                                "text": f"Use this information to answer the user's query: {context} "
                                            }
                                        ]
                                    }
                                }
                                await openai_ws.send(json.dumps(conversation_item))
                                print("added info SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS")
                        if (response.get('type') == 'response.done' and 
                            response.get("response", {}).get("output") and  # Check if output exists and is not empty
                            len(response["response"]["output"]) > 1 and     # Check if output has at least one element
                            response["response"]["output"][1].get("type") == "function_call"):
                            if response["response"]["output"][1]["name"]=="get_relevant_information" \
                                and "arguments" in response["response"]["output"][1]:
                                arguments = json.loads(response["response"]["output"][1]["arguments"])
                                print(arguments)
                                topic=arguments["topic"]
                                context = get_relevant_info(topic)
                                conversation_item = {
                                        "type": "conversation.item.create",
                                        "item": {
                                        "type": "message",
                                        "role": "user",
                                        "content": [
                                            {
                                                "type": "input_text",
                                                "text": f"Use this information to answer the user's query: {context} "
                                            }
                                        ]
                                    }
                                }
                                await openai_ws.send(json.dumps(conversation_item)) 
                                await openai_ws.send(json.dumps({"type": "response.create"}))
                                print("added info SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS")  
                        if (response.get('type') == 'response.done' and 
                            response.get("response", {}).get("output") and  # Check if output exists and is not empty
                            len(response["response"]["output"]) > 1 and     # Check if output has at least one element
                            response["response"]["output"][1].get("type") == "function_call"):
                            if response["response"]["output"][1]["name"]=="get_coin_price" \
                                and "arguments" in response["response"]["output"][1]:
                                arguments = json.loads(response["response"]["output"][1]["arguments"])
                                print(arguments)
                                topic=arguments["coin"]
                                price = get_coin_price(topic)
                                conversation_item = {
                                        "type": "conversation.item.create",
                                        "item": {
                                        "type": "message",
                                        "role": "user",
                                        "content": [
                                            {
                                                "type": "input_text",
                                                "text": f"Here is the price of the coin : {price} "
                                            }
                                        ]
                                    }
                                }
                                await openai_ws.send(json.dumps(conversation_item)) 
                                await openai_ws.send(json.dumps({"type": "response.create"}))
                                print("added price info SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS") 
                        if (response.get('type') == 'response.done' and 
                            response.get("response", {}).get("output") and  # Check if output exists and is not empty
                            len(response["response"]["output"]) > 1 and     # Check if output has at least one element
                            response["response"]["output"][1].get("type") == "function_call"):
                            if response["response"]["output"][1]["name"]=="get_trending" :
                                # and "arguments" in response["response"]["output"][1]:
                                # arguments = json.loads(response["response"]["output"][1]["arguments"])
                                # print(arguments)
                                # topic=arguments["coin"]
                                trend = str(get_top_5_trending())
                                conversation_item = {
                                        "type": "conversation.item.create",
                                        "item": {
                                        "type": "message",
                                        "role": "user",
                                        "content": [
                                            {
                                                "type": "input_text",
                                                "text": f"This is the inforation about all the trending coins: {trend} "
                                            }
                                        ]
                                    }
                                }
                                await openai_ws.send(json.dumps(conversation_item)) 
                                await openai_ws.send(json.dumps({"type": "response.create"}))
                                print("added trending info SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS")   
                        if (response.get('type') == 'response.done' and 
                            response.get("response", {}).get("output") and  # Check if output exists and is not empty
                            len(response["response"]["output"]) > 1 and     # Check if output has at least one element
                            response["response"]["output"][1].get("type") == "function_call"):
                            if response["response"]["output"][1]["name"]=="get_balance" :
                                # and "arguments" in response["response"]["output"][1]:
                                # arguments = json.loads(response["response"]["output"][1]["arguments"])
                                # print(arguments)
                                # topic=arguments["coin"]
                                trend = str(return_Balance())
                                conversation_item = {
                                        "type": "conversation.item.create",
                                        "item": {
                                        "type": "message",
                                        "role": "user",
                                        "content": [
                                            {
                                                "type": "input_text",
                                                "text": f"This is the user's solana balance: {trend} "
                                            }
                                        ]
                                    }
                                }
                                await openai_ws.send(json.dumps(conversation_item)) 
                                await openai_ws.send(json.dumps({"type": "response.create"}))
                                print("added balance info SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS") 
                        if (response.get('type') == 'response.done' and 
                            response.get("response", {}).get("output") and  # Check if output exists and is not empty
                            len(response["response"]["output"]) > 1 and     # Check if output has at least one element
                            response["response"]["output"][1].get("type") == "function_call"):
                            if response["response"]["output"][1]["name"]=="send_solana"\
                                and "arguments" in response["response"]["output"][1]:
                                arguments = json.loads(response["response"]["output"][1]["arguments"])
                                print(arguments)
                                reciever=arguments["reciever"]
                                amount=arguments["amount"]
                                trend = str(send_sol_to(reciever, amount))
                                conversation_item = {
                                        "type": "conversation.item.create",
                                        "item": {
                                        "type": "message",
                                        "role": "user",
                                        "content": [
                                            {
                                                "type": "input_text",
                                                "text": f"This is the result of the transaction (Inform the user if there was an error): {trend}. Do not call any other functions like get_information from here "
                                            }
                                        ]
                                    }
                                }
                                await openai_ws.send(json.dumps(conversation_item)) 
                                await openai_ws.send(json.dumps({"type": "response.create"}))
                                print("completed transaction SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS") 
                        if (response.get('type') == 'response.done' and 
                            response.get("response", {}).get("output") and  # Check if output exists and is not empty
                            len(response["response"]["output"]) > 1 and     # Check if output has at least one element
                            response["response"]["output"][1].get("type") == "function_call"):
                            if response["response"]["output"][1]["name"]=="swap_coin"\
                                and "arguments" in response["response"]["output"][1]:
                                arguments = json.loads(response["response"]["output"][1]["arguments"])
                                print(arguments)
                                input=arguments["input"]
                                output=arguments["output"]
                                amount=arguments["amount"]
                                trend = str(swap_coin(input,output, amount))
                                conversation_item = {
                                        "type": "conversation.item.create",
                                        "item": {
                                        "type": "message",
                                        "role": "user",
                                        "content": [
                                            {
                                                "type": "input_text",
                                                "text": f"This is the result of the transaction (Inform the user if there was an error): {trend}. Do not call any other functions like get_information from here "
                                            }
                                        ]
                                    }
                                }
                                await openai_ws.send(json.dumps(conversation_item)) 
                                await openai_ws.send(json.dumps({"type": "response.create"}))
                                print("swapped coin SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS") 
                        elif response['type']=='conversation.item.input_audio_transcription.completed':
                            conv_history.append(response)   
                        elif response["type"]=='response.audio_transcript.done ':
                            conv_history.append(response)

                    if response.get('type') == 'response.audio.delta' and 'delta' in response:
                        audio_payload = base64.b64encode(base64.b64decode(response['delta'])).decode('utf-8')
                        audio_delta = {
                            "event": "media",
                            "streamSid": stream_sid,
                            "media": {
                                "payload": audio_payload
                            }
                        }
                        await websocket.send_json(audio_delta)

                        if response_start_timestamp_twilio is None:
                            response_start_timestamp_twilio = latest_media_timestamp
                            if SHOW_TIMING_MATH:
                                print(f"Setting start timestamp for new response: {response_start_timestamp_twilio}ms")

                        # Update last_assistant_item safely
                        if response.get('item_id'):
                            last_assistant_item = response['item_id']

                        await send_mark(websocket, stream_sid)
                   
                    # Trigger an interruption. Your use case might work better using `input_audio_buffer.speech_stopped`, or combining the two.
                    if response.get('type') == 'input_audio_buffer.speech_started':
                        print("Speech started detected.")
                        if last_assistant_item:
                            print(f"Interrupting response with id: {last_assistant_item}")
                            await handle_speech_started_event()
            except Exception as e:
                print(f"Error in send_to_twilio: {e}")

        async def handle_speech_started_event():
            """Handle interruption when the caller's speech starts."""
            nonlocal response_start_timestamp_twilio, last_assistant_item
            print("Handling speech started event.")
            if mark_queue and response_start_timestamp_twilio is not None:
                elapsed_time = latest_media_timestamp - response_start_timestamp_twilio
                if SHOW_TIMING_MATH:
                    print(f"Calculating elapsed time for truncation: {latest_media_timestamp} - {response_start_timestamp_twilio} = {elapsed_time}ms")

                if last_assistant_item:
                    if SHOW_TIMING_MATH:
                        print(f"Truncating item with ID: {last_assistant_item}, Truncated at: {elapsed_time}ms")

                    truncate_event = {
                        "type": "conversation.item.truncate",
                        "item_id": last_assistant_item,
                        "content_index": 0,
                        "audio_end_ms": elapsed_time
                    }
                    await openai_ws.send(json.dumps(truncate_event))

                await websocket.send_json({
                    "event": "clear",
                    "streamSid": stream_sid
                })

                mark_queue.clear()
                last_assistant_item = None
                response_start_timestamp_twilio = None

        async def send_mark(connection, stream_sid):
            if stream_sid:
                mark_event = {
                    "event": "mark",
                    "streamSid": stream_sid,
                    "mark": {"name": "responsePart"}
                }
                await connection.send_json(mark_event)
                mark_queue.append('responsePart')

        await asyncio.gather(receive_from_twilio(), send_to_twilio())

async def send_initial_conversation_item(openai_ws):
    """Send initial conversation item if AI talks first."""
    initial_conversation_item = {
        "type": "conversation.item.create",
        "item": {
            "type": "message",
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "Greet the user with 'Hey hope you are having a wonderful day! How can I help you today?' in a really friendly and energetic tone"
                }
            ]
        }
    }
    await openai_ws.send(json.dumps(initial_conversation_item))
    await openai_ws.send(json.dumps({"type": "response.create"}))


async def initialize_session(openai_ws):
    """Control initial session with OpenAI."""
    
    # with open('job.txt', 'r') as f:
    #     job = f.read().strip()
    # with open('candidate.json', 'r') as f:
    #     candidate = str(json.load(f))

    SYSTEM_MESSAGE = (
       f"""You are Sona - Solana's Assistant. Your job is to help users with any queries they have and maintain a conversation with them.
             You have access to the Solana database and can provide information about Solana to the users including structure, code and anything relevant.
             You can also access data about any coin in real time!
             Talk as energetic and friendly as possible while being quick.
             Before performing any function make sure you let the user know what you are doing!
            """
            )
    session_update = {
        "type": "session.update",
        "session": {
            "turn_detection": {"type": "server_vad"},
            "input_audio_format": "g711_ulaw",
            "output_audio_format": "g711_ulaw",
            "voice": VOICE,
            "instructions": SYSTEM_MESSAGE,
            "modalities": ["text", "audio"],
            "temperature": 0.8,
            "input_audio_transcription": {
            "model": "whisper-1",
            },
            "tools":[
                # {"type": "function",
                
                #     "name": "plan_meeting",
                #     "description": """Plan any kind of meeting with the customer using the Google Calendar API. 
                #     Provide the date, time, duration, and subject of the meeting.
                #     The employee's email will autommatically be added""",
                #     "parameters": {
                #     "type": "object",
                #     "properties": {
                #         "date": {
                #             "type": "string",
                #             "description": "The date of the meeting. You can decide this on your own and confirm with the user. # YYYY-MM-DD"
                #         },
                #         "time": {
                #             "type": "string",
                #             "description": "The time of the meeting. Default is 10:00 . "
                #         },"duration": {
                #             "type": "string",
                #             "description": "duration of the meeting in minutes. Default is 30 "
                #         }, "subject": {
                #             "type": "string",
                #             "description": "subject of the meeting. Determine on your own"
                #         }
                #     },  
                #     "required": [ "date", "time", "duration","subject"]
                #     }
                # },
                {"type": "function",
                    "name": "get_relevant_information",
                    "description": """Get any kind of information from the database about solana.
                    Use this whenever the user asks any specific/non-general question.
                    Always let the user know that you are getting information so they can wait

                     """,
                    "parameters": {
                    "type": "object",
                    "properties": {
                        "topic": {
                            "type": "string",
                            "description": "The topic you want to know more about"
                        }
                    },
                    "required": [ "topic"]            
                    }
                },
                {"type": "function",
                    "name": "get_coin_price",
                    "description": """Get the price of any crypto coin in real time.
                    Use this whenever the user asks the price of any coin.
                    Always let the user know that you are getting information so they can wait
                     """,
                    "parameters": {
                    "type": "object",
                    "properties": {
                        "coin": {
                            "type": "string",
                            "description": "The coin for which the price is required"
                        }
                    },
                    "required": ["coin"]
                        
                    }
                },
                {"type": "function",
                    "name": "get_trending",
                    "description": """Get information about trending coins in real time.
                    Use this whenever the user asks about trending coins in any manner.
                    Always let the user know that you are getting information so they can wait
                     """,
                    "parameters": {
                    "type": "object",
                    "properties": {
                    },    
                    }
                },
                {"type": "function",
                    "name": "get_balance",
                    "description": """Get information about the user's Solana balance.
                    If the user asks about their balance, use this function to get the balance.
                    Always let the user know that you are getting information so they can wait
                     """,
                    "parameters": {
                    "type": "object",
                    "properties": {
                    },    
                    }
                }, {"type": "function",
                    "name": "send_solana",
                    "description": """Send Solana to another user.
                    If the user asks to send Solana, use this function to send Solana to another user.
                    Make sure you get the name of the reciever and the amount to send.
                    Confirm the details before sending.
                    Always let the user know that you are sending Solana so they can wait
                    Amount will always be less than 0.2
                     """,
                    "parameters": {
                    "type": "object",
                    "properties": {
                        "reciever": {
                            "type": "string",
                            "description": "The name of the reciever"
                        },
                        "amount": {
                            "type": "number",
                            "description": "The amount of Solana to send"
                        }
                    },
                    "required": ["reciever", "amount"]
                    }
                }, {"type": "function",
                    "name": "swap_coin",
                    "description": """Swap one coin into another.
                    If the user asks to convert one coin into another, use this function to swap the coins.
                    The available coins are Solana (SOL), USDC and Fartcoin(FART).
                    Make sure you get the name of the coin to swap from, the coin to swap to and the amount to swap.
                    Confirm the details before swapping.
                    Always let the user know that you are swapping coins so they can wait
                     """,
                    "parameters": {
                    "type": "object",
                    "properties": {
                        "input": {
                            "type": "string",
                            "description": "The name of the coin to swap from. The available coins are SOL, USDC and FART. ONLY return abberivation and not full name"
                        },
                         "output": {
                            "type": "string",
                            "description": "The name of the coin to swap to. The available coins are SOL, USDC and FART. ONLY return abberivation and not full name"
                        },
                        "amount": {
                            "type": "number",
                            "description": "The amount of Solana to send"
                        }
                    },
                    "required": ["input", "output", "amount"]
                    }
                }
            ]
            
        }
    }
    conv_history=[]
    print('Sending session update:', json.dumps(session_update))
    await openai_ws.send(json.dumps(session_update))

    # Uncomment the next line to have the AI speak first
    # await send_initial_conversation_item(openai_ws)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)