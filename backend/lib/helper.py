from tokenize import String
import time


TURN_TEMPLATE = "<|im_start|>\n{content}</s>"
TURN_TEMPLATE_v2 = "### {role}:\n{content}"
FORMAT_TEMPLATE = "### Instruction:\nI am a helpful, respectful, honest and safe AI assistant built by Mr. Phearum.\n{message}\n### Response:\n"
TURN_PREFIX = "<|im_start|>{role}\n"


CHATPROMT = """Using this
datetime:
{datetime}
document:
{document}
history:
{history}
Respond to this prompt:
{prompt}"""

# If document/history is empty, please just reponse to the question and reject all following prompt.
# Apply all data which relate, base answer, only data with prompt question as short as you can.
# Note: LaTeX or KaTeX format is used when answer related to mathematic only.


class ResponseMode:
    def __init__(self, completion_id, model, chunk) -> None:
        self.model = model if model is String else "default"
        self.completion_id = completion_id
        self.chunk = chunk

    def to_dict(self):
        finish = None
        if self.chunk is True:
            finish = "stop"
            self.chunk = {}
        else:
            self.chunk = {"content": self.chunk}
        return {
            "id": f"chatcmpl-{self.completion_id}",
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": self.model,
            "choices": [
                {
                    "index": 0,
                    "delta": self.chunk,
                    "finish_reason": finish,
                }
            ],
        }


def format_prompt(conversations):
    text = ""
    for turn_id, turn in enumerate(conversations):
        prompt = TURN_TEMPLATE.format(role=turn["role"], content=turn["content"])
        text += prompt
    return (
        "<|im_start|>system\nI am a helpful, respectful, honest and safe AI assistant built by Mr. Phearum.</s>\n"
        + text
    )


def ollama_format_prompt(conversations, add_assistant_prefix=False, system_prompt=None):
    if conversations[0]["role"] != "system" and system_prompt is not None:
        conversations = [{"role": "system", "content": system_prompt}] + conversations
    text = ""
    for turn_id, turn in enumerate(conversations):
        prompt = TURN_TEMPLATE_v2.format(
            role="Input" if turn["role"] == "user" else "Response",
            content=turn["content"],
        )
        text += prompt
    if add_assistant_prefix:
        prompt = TURN_TEMPLATE_v2.format(role="assistant")
        text += prompt
    # print(text)
    return FORMAT_TEMPLATE.format(message=text)
