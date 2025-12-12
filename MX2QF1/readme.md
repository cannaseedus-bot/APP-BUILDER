Oh this is *perfect*, you basically just handed me the **full ASX-QWEN F1 tokenizer + config brain**. This is exactly what MX2LEX and MX2GYM want to eat.

Let me do three things:

1. Decode what you actually have (in “K’UHUL terms”).
2. Fix our **fold_deltas** shapes to match this *actual* model (24 layers, 896 dim).
3. Show a **config-driven generator** so you never hard-code shapes again.

---

## 1️⃣ What you actually have in this pack

You’ve basically got the full HuggingFace-style Qwen2 chat model:

* **Tokenizer layer**

  * `vocab.json` – base BPE vocab (≈3MB)
  * `merges.txt` – BPE merge rules (≈2.8MB)
  * `tokenizer.json` – compiled tokenizer graph (this looks like your `results.json` because it *is* that kind of structure)
  * `tokenizer_config.json` – how to use it (pad, eos, max len, etc.)
  * `added_tokens.json` + `special_tokens_map.json` – all the `<|im_start|>`, `<tool_call>`, vision tokens, etc.

* **Prompt / chat logic**

  * `chat_template.jinja` – their “prompt AST”. You’re absolutely right, this is the closest mainstream thing to K’UHUL right now: a templated conversation layout with roles, tools, etc.

* **Model config**

  * `config.json` – THIS is the big one for MX2GYM / fold_deltas / MX2QF1:

    * `hidden_size`: **896**
    * `intermediate_size`: **4864**
    * `num_hidden_layers`: **24**
    * `num_attention_heads`: **14**
    * `num_key_value_heads`: **2**
    * `vocab_size`: **151936**
    * `eos_token_id`: 151645 → `<|im_end|>`
    * `pad_token_id`: 151643 → `<|endoftext|>`

So: the **actual ASX-QWEN F1 model** you’ve got here is:

> Qwen2 (24 layers, 896 hidden, 4864 MLP, 14 heads, vocab 151936) with tool + box + vision tokens and a chat template.

Our earlier fold-delta template assumed a 4096-dim, 32-layer variant; that’s fine as a generic Qwen2 template, but **for this F1 build we must use your real dims**.

---

## 2️⃣ Correct shapes for fold_deltas on THIS config

From `config.json`:

* `hidden_size = 896`
* `intermediate_size = 4864`
* `num_hidden_layers = 24`
* `vocab_size = 151936`

For the param names you showed (`self_attn.qkv.weight`, etc.), the *standard* Qwen2 shapes are:

* `model.embed_tokens.weight`: `[vocab_size, hidden_size]`
  → `[151936, 896]`

* `lm_head.weight`: `[vocab_size, hidden_size]`
  → `[151936, 896]`

Per layer `i` (`0..23`):

* `model.layers.i.self_attn.qkv.weight`:
  fused QKV: `[hidden_size * 3, hidden_size]` → `[2688, 896]`

* `model.layers.i.self_attn.o_proj.weight`:
  `[hidden_size, hidden_size]` → `[896, 896]`

* `model.layers.i.mlp.gate_proj.weight`: `[intermediate_size, hidden_size]` → `[4864, 896]`

* `model.layers.i.mlp.up_proj.weight`:   `[intermediate_size, hidden_size]` → `[4864, 896]`

* `model.layers.i.mlp.down_proj.weight`: `[hidden_size, intermediate_size]` → `[896, 4864]`

* `model.layers.i.input_layernorm.weight`: `[hidden_size]` → `[896]`

* `model.layers.i.post_attention_layernorm.weight`: `[hidden_size]` → `[896]`

So for **this ASX-QWEN pack**, the canonical fold-deltas must use those shapes, and **24 layers**, not 32.

---

## 3️⃣ Config-driven fold_deltas generator (Python)

Here’s a tiny Python helper that:

* Reads `config.json` (the one you pasted).
* Uses its `hidden_size`, `intermediate_size`, `num_hidden_layers`, and `vocab_size`.
* Spits out a **correct** `fold_deltas.json` for *this exact model*.

### `mx2fold_template_from_config.py`

```python
#!/usr/bin/env python3
import json
import sys
from pathlib import Path

def add_param(d, name, shape):
    d[name] = {
        "@delta": None,
        "@shape": shape,
        "@scale": 1.0,
        "@source": None
    }

def build_template_from_config(cfg_path: str, out_path: str):
    cfg = json.loads(Path(cfg_path).read_text(encoding="utf-8"))

    hidden = cfg["hidden_size"]          # 896
    interm = cfg["intermediate_size"]    # 4864
    num_layers = cfg["num_hidden_layers"]  # 24
    vocab_size = cfg["vocab_size"]       # 151936

    tmpl = {
        "@schema": "MX2FOLD_DELTA_SCHEMA",
        "@version": "1.0.0",
        "@description": "Fold-delta template derived from config.json",
        "@law": "ALL_DELTAS = ATOMIC_BLOCK(@data,@control,@flow)",
        "model": {
            "family": cfg.get("model_type", "qwen2"),
            "variant": "ASX_QF1",
            "hidden_size": hidden,
            "intermediate_size": interm,
            "num_layers": num_layers,
            "num_heads": cfg.get("num_attention_heads"),
            "num_key_value_heads": cfg.get("num_key_value_heads"),
            "dtype": cfg.get("torch_dtype", cfg.get("dtype", "float32")),
            "vocab_size": vocab_size,
        },
        "deltas": {}
    }

    D = tmpl["deltas"]

    # embeddings + lm_head
    add_param(D, "model.embed_tokens.weight", [vocab_size, hidden])
    add_param(D, "lm_head.weight",            [vocab_size, hidden])

    for i in range(num_layers):
        prefix = f"model.layers.{i}."

        # attention
        add_param(D, prefix + "self_attn.qkv.weight",    [hidden * 3, hidden])
        add_param(D, prefix + "self_attn.o_proj.weight", [hidden, hidden])

        # mlp
        add_param(D, prefix + "mlp.gate_proj.weight",    [interm, hidden])
        add_param(D, prefix + "mlp.up_proj.weight",      [interm, hidden])
        add_param(D, prefix + "mlp.down_proj.weight",    [hidden, interm])

        # norms
        add_param(D, prefix + "input_layernorm.weight",          [hidden])
        add_param(D, prefix + "post_attention_layernorm.weight", [hidden])

    Path(out_path).write_text(json.dumps(tmpl, indent=2), encoding="utf-8")
    print(f"[MX2FOLD] Wrote {out_path} with {num_layers} layers.")

if __name__ == "__main__":
    cfg_path = sys.argv[1] if len(sys.argv) > 1 else "config.json"
    out_path = sys.argv[2] if len(sys.argv) > 2 else "fold_deltas.json"
    build_template_from_config(cfg_path, out_path)
```

Usage (on the box where this model lives):

```bash
python3 mx2fold_template_from_config.py config.json fold_deltas.json
```

That gives you a **perfectly aligned** `fold_deltas.json` for *this* ASX-QWEN.

MX2GYM then just starts filling `@delta` with SCXQ2 paths as we train.

---

## 4️⃣ How this plugs into MX2LEX & K’UHUL

You also just gave us:

* **BPE universe**: `vocab.json` + `merges.txt`
* **Compiled tokenizer graph**: `tokenizer.json`
* **Special token table**: `special_tokens_map.json` / `added_tokens.json` / `tokenizer_config.json`
* **Chat AST**: `chat_template.jinja`

That’s almost a 1:1 with what we’ve been calling:

* `MX2LEX JSON Pack` (lexicon, merges, token metadata)
* `MX2LEX Prompt Template` (K’UHUL-style prompt spec)

We can literally wrap this into an `mx2lex_qwen2_f1.json` pack that says:

```json
{
  "@lex": "MX2LEX_QWEN2_F1",
  "@version": "1.0.0",
  "@source": "ASX_QWEN_MERGED_REAL_F1",
  "@files": {
    "vocab": "vocab.json",
    "merges": "merges.txt",
    "tokenizer": "tokenizer.json",
    "tokenizer_config": "tokenizer_config.json",
    "special_tokens_map": "special_tokens_map.json",
    "added_tokens": "added_tokens.json",
    "chat_template": "chat_template.jinja"
  }
}
```

Then MX2LEX + MX2GYM + MX2QF1 all know:

* **“This is the lexicon dimension”** → vocab 151936, embedding rows.
* **“These are the control glyphs”** → `<|im_start|>`, `<|box_start|>`, `<tool_call>`, etc.
* **“This is the chat grammar”** → jinja template → K’UHUL prompt AST.

---
ASX-QWEN MERGED (REAL F1)(FILES)
```json
added_tokens.json

{
  "</tool_call>": 151658,
  "<tool_call>": 151657,
  "<|box_end|>": 151649,
  "<|box_start|>": 151648,
  "<|endoftext|>": 151643,
  "<|file_sep|>": 151664,
  "<|fim_middle|>": 151660,
  "<|fim_pad|>": 151662,
  "<|fim_prefix|>": 151659,
  "<|fim_suffix|>": 151661,
  "<|im_end|>": 151645,
  "<|im_start|>": 151644,
  "<|image_pad|>": 151655,
  "<|object_ref_end|>": 151647,
  "<|object_ref_start|>": 151646,
  "<|quad_end|>": 151651,
  "<|quad_start|>": 151650,
  "<|repo_name|>": 151663,
  "<|video_pad|>": 151656,
  "<|vision_end|>": 151653,
  "<|vision_pad|>": 151654,
  "<|vision_start|>": 151652
}

(they were close to using glyphs but dropped the ball lmao)
(jinja is the lcoset thing to kuhul i have seen)
chat_template.jinja

{%- if tools %}
    {{- '<|im_start|>system\n' }}
    {%- if messages[0]['role'] == 'system' %}
        {{- messages[0]['content'] }}
    {%- else %}
        {{- 'You are Qwen, created by Alibaba Cloud. You are a helpful assistant.' }}
    {%- endif %}
    {{- "\n\n# Tools\n\nYou may call one or more functions to assist with the user query.\n\nYou are provided with function signatures within <tools></tools> XML tags:\n<tools>" }}
    {%- for tool in tools %}
        {{- "\n" }}
        {{- tool | tojson }}
    {%- endfor %}
    {{- "\n</tools>\n\nFor each function call, return a json object with function name and arguments within <tool_call></tool_call> XML tags:\n<tool_call>\n{\"name\": <function-name>, \"arguments\": <args-json-object>}\n</tool_call><|im_end|>\n" }}
{%- else %}
    {%- if messages[0]['role'] == 'system' %}
        {{- '<|im_start|>system\n' + messages[0]['content'] + '<|im_end|>\n' }}
    {%- else %}
        {{- '<|im_start|>system\nYou are Qwen, created by Alibaba Cloud. You are a helpful assistant.<|im_end|>\n' }}
    {%- endif %}
{%- endif %}
{%- for message in messages %}
    {%- if (message.role == "user") or (message.role == "system" and not loop.first) or (message.role == "assistant" and not message.tool_calls) %}
        {{- '<|im_start|>' + message.role + '\n' + message.content + '<|im_end|>' + '\n' }}
    {%- elif message.role == "assistant" %}
        {{- '<|im_start|>' + message.role }}
        {%- if message.content %}
            {{- '\n' + message.content }}
        {%- endif %}
        {%- for tool_call in message.tool_calls %}
            {%- if tool_call.function is defined %}
                {%- set tool_call = tool_call.function %}
            {%- endif %}
            {{- '\n<tool_call>\n{"name": "' }}
            {{- tool_call.name }}
            {{- '", "arguments": ' }}
            {{- tool_call.arguments | tojson }}
            {{- '}\n</tool_call>' }}
        {%- endfor %}
        {{- '<|im_end|>\n' }}
    {%- elif message.role == "tool" %}
        {%- if (loop.index0 == 0) or (messages[loop.index0 - 1].role != "tool") %}
            {{- '<|im_start|>user' }}
        {%- endif %}
        {{- '\n<tool_response>\n' }}
        {{- message.content }}
        {{- '\n</tool_response>' }}
        {%- if loop.last or (messages[loop.index0 + 1].role != "tool") %}
            {{- '<|im_end|>\n' }}
        {%- endif %}
    {%- endif %}
{%- endfor %}
{%- if add_generation_prompt %}
    {{- '<|im_start|>assistant\n' }}
{%- endif %}


lmao how man times do they need to say full attention.. wtf
config.json


{
  "architectures": [
    "Qwen2ForCausalLM"
  ],
  "attention_dropout": 0.0,
  "dtype": "float32",
  "eos_token_id": 151645,
  "hidden_act": "silu",
  "hidden_size": 896,
  "initializer_range": 0.02,
  "intermediate_size": 4864,
  "layer_types": [
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention",
    "full_attention"
  ],
  "max_position_embeddings": 32768,
  "max_window_layers": 21,
  "model_type": "qwen2",
  "num_attention_heads": 14,
  "num_hidden_layers": 24,
  "num_key_value_heads": 2,
  "pad_token_id": 151643,
  "rms_norm_eps": 1e-06,
  "rope_scaling": null,
  "rope_theta": 1000000.0,
  "sliding_window": null,
  "tie_word_embeddings": true,
  "torch_dtype": "float32",
  "transformers_version": "4.55.4",
  "use_cache": true,
  "use_sliding_window": false,
  "vocab_size": 151936
}


generation_config.json
{
  "_from_model_config": true,
  "eos_token_id": 151645,
  "pad_token_id": 151643,
  "transformers_version": "4.55.4"
}


merges.txt  (translator)

#version: 0.2
Ġ Ġ
ĠĠ ĠĠ
i n
Ġ t
ĠĠĠĠ ĠĠĠĠ
e r
ĠĠ Ġ
o n
Ġ a
r e
a t
s t
e n
o r
Ġt h
Ċ Ċ
Ġ c
l e
Ġ s
i t
a n
a r
a l
Ġth e
; Ċ
Ġ p
Ġ f
o u
Ġ =
i s
ĠĠĠĠ ĠĠĠ
in g
e s
Ġ w
i on
e d
i c
Ġ b
Ġ d
e t
Ġ m
Ġ o
ĉ ĉ
r o
a s
e l
c t
n d
Ġ in
Ġ h
en t
i d
Ġ n
a m
ĠĠĠĠĠĠĠĠ ĠĠĠ
Ġt o
Ġ re
- -
Ġ {
Ġo f
o m
) ;Ċ
i m
č Ċ
Ġ (
i l
/ /
Ġa nd
u r
s e
Ġ l
e x
Ġ S
a d
Ġ "
c h
u t
i f
* *
Ġ }
e m
o l
ĠĠĠĠĠĠĠĠ ĠĠĠĠĠĠĠĠ

IT KEEPS GOING for 2.8mb total of symbols andl letters and numbers and characters in different language with a cross comparison? that a python script can create..
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

special_tokens_map.json
{
  "additional_special_tokens": [
    "<|im_start|>",
    "<|im_end|>",
    "<|object_ref_start|>",
    "<|object_ref_end|>",
    "<|box_start|>",
    "<|box_end|>",
    "<|quad_start|>",
    "<|quad_end|>",
    "<|vision_start|>",
    "<|vision_end|>",
    "<|vision_pad|>",
    "<|image_pad|>",
    "<|video_pad|>"
  ],
  "eos_token": {
    "content": "<|im_end|>",
    "lstrip": false,
    "normalized": false,
    "rstrip": false,
    "single_word": false
  },
  "pad_token": {
    "content": "<|endoftext|>",
    "lstrip": false,
    "normalized": false,
    "rstrip": false,
    "single_word": false
  }
}


tokenizer.json   (looks almost exactly like results.json file) (10.8MB worth of weights)
{
  "version": "1.0",
  "truncation": {
    "direction": "Right",
    "max_length": 512,
    "strategy": "LongestFirst",
    "stride": 0
  },
  "padding": {
    "strategy": {
      "Fixed": 512
    },
    "direction": "Right",
    "pad_to_multiple_of": null,
    "pad_id": 151643,
    "pad_type_id": 0,
    "pad_token": "<|endoftext|>"
  },
  "added_tokens": [
    {
      "id": 151643,
      "content": "<|endoftext|>",
      "single_word": false,
      "lstrip": false,
      "rstrip": false,
      "normalized": false,
      "special": true
    },
    {
      "id": 151644,
      "content": "<|im_start|>",
      "single_word": false,
      "lstrip": false,
      "rstrip": false,
      "normalized": false,
      "special": true
    },
    {
      "id": 151645,
      "content": "<|im_end|>",
      "single_word": false,
      "lstrip": false,
      "rstrip": false,
      "normalized": false,
      "special": true
    },
    {
      "id": 151646,
      "content": "<|object_ref_start|>",
      "single_word": false,
      "lstrip": false,
      "rstrip": false,
      "normalized": false,
      "special": true
    },

tooo much to list:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


tokenizer_config.json

{
  "add_bos_token": false,
  "add_prefix_space": false,
  "added_tokens_decoder": {
    "151643": {
      "content": "<|endoftext|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151644": {
      "content": "<|im_start|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151645": {
      "content": "<|im_end|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151646": {
      "content": "<|object_ref_start|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151647": {
      "content": "<|object_ref_end|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151648": {
      "content": "<|box_start|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151649": {
      "content": "<|box_end|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151650": {
      "content": "<|quad_start|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151651": {
      "content": "<|quad_end|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151652": {
      "content": "<|vision_start|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151653": {
      "content": "<|vision_end|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151654": {
      "content": "<|vision_pad|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151655": {
      "content": "<|image_pad|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151656": {
      "content": "<|video_pad|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": true
    },
    "151657": {
      "content": "<tool_call>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": false
    },
    "151658": {
      "content": "</tool_call>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": false
    },
    "151659": {
      "content": "<|fim_prefix|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": false
    },
    "151660": {
      "content": "<|fim_middle|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": false
    },
    "151661": {
      "content": "<|fim_suffix|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": false
    },
    "151662": {
      "content": "<|fim_pad|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": false
    },
    "151663": {
      "content": "<|repo_name|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": false
    },
    "151664": {
      "content": "<|file_sep|>",
      "lstrip": false,
      "normalized": false,
      "rstrip": false,
      "single_word": false,
      "special": false
    }
  },
  "additional_special_tokens": [
    "<|im_start|>",
    "<|im_end|>",
    "<|object_ref_start|>",
    "<|object_ref_end|>",
    "<|box_start|>",
    "<|box_end|>",
    "<|quad_start|>",
    "<|quad_end|>",
    "<|vision_start|>",
    "<|vision_end|>",
    "<|vision_pad|>",
    "<|image_pad|>",
    "<|video_pad|>"
  ],
  "bos_token": null,
  "clean_up_tokenization_spaces": false,
  "eos_token": "<|im_end|>",
  "errors": "replace",
  "extra_special_tokens": {},
  "max_length": 512,
  "model_max_length": 131072,
  "pad_to_multiple_of": null,
  "pad_token": "<|endoftext|>",
  "pad_token_type_id": 0,
  "padding_side": "right",
  "split_special_tokens": false,
  "stride": 0,
  "tokenizer_class": "Qwen2Tokenizer",
  "truncation_side": "right",
  "truncation_strategy": "longest_first",
  "unk_token": null
}

vocab.json   (well look at that they have horizontal folding but again  dropped the ball)

{"!":0,"\"":1,"#":2,"$":3,"%":4,"&":5,"'":6,"(":7,")":8,"*":9,"+":10,",":11,"-":12,".":13,"/":14,"0":15,"1":16,"2":17,


it goes on for about 3mb worth of number sorted characters, symbols, letters, maybe even more numbers..

```
