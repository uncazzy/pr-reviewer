from typing import List, Literal, TypedDict

class ChatMessage(TypedDict):
    role: Literal['system', 'user', 'assistant']
    content: str

# Initialize chat messages as an empty list
chat_messages: List[ChatMessage] = []

def clear_chat_messages() -> None:
    """Clear all chat messages from the list."""
    chat_messages.clear()