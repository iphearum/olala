import argparse

import numpy as np
from gguf import *
from safetensors import safe_open
from transformers import AutoTokenizer


def k(raw_key: str, arch: str) -> str:
    return raw_key.format(arch=arch)


parser = argparse.ArgumentParser()
parser.add_argument("--model", type=str, default="nanoLLaVA/model.safetensors")
parser.add_argument("--tokenizer", type=str, default="nanoLLaVA")
args = parser.parse_args()

tensors = safe_open(args.model, framework="np", device="cpu")

### Vision encoder

ftype = 1  # fp16

fname_middle = "mmproj-"
has_text_encoder = False
has_llava_projector = True

fname_out = "nanollava-mmproj-f16.gguf"
fout = GGUFWriter(fname_out, arch="clip")

fout.add_bool("clip.has_text_encoder", False)
fout.add_bool("clip.has_vision_encoder", True)
fout.add_bool("clip.has_llava_projector", True)
fout.add_file_type(ftype)  # fp16

model_name = "qnguyen3/nanoLLaVA"
fout.add_name(model_name)
fout.add_description("image encoder for " + model_name)
fout.add_string("clip.projector_type", "mlp")

# vision model hparams
VISION = "clip.vision"
fout.add_uint32("clip.vision.image_size", 378)
fout.add_uint32("clip.vision.patch_size", 14)
fout.add_uint32(k(KEY_EMBEDDING_LENGTH, VISION), 1152)
fout.add_uint32(k(KEY_FEED_FORWARD_LENGTH, VISION), 4304)
fout.add_uint32("clip.vision.projection_dim", 2048)
fout.add_uint32(k(KEY_ATTENTION_HEAD_COUNT, VISION), 16)
fout.add_float32(k(KEY_ATTENTION_LAYERNORM_EPS, VISION), 1e-6)
fout.add_uint32(k(KEY_BLOCK_COUNT, VISION), 27 + 1)

fout.add_array("clip.vision.image_mean", [0.5, 0.5, 0.5])
fout.add_array("clip.vision.image_std", [0.5, 0.5, 0.5])
fout.add_bool("clip.use_gelu", True)  # using regular GELU instead of quick

# vision projection
fout.add_tensor(
    "mm.0.weight",
    tensors.get_tensor("model.mm_projector.0.weight").astype(
        np.float16
    ),
)
fout.add_tensor(
    "mm.0.bias",
    tensors.get_tensor("model.mm_projector.0.bias").astype(np.float32),
)
fout.add_tensor(
    "mm.2.weight",
    tensors.get_tensor("model.mm_projector.2.weight").astype(
        np.float16
    ),
)
fout.add_tensor(
    "mm.2.bias",
    tensors.get_tensor("model.mm_projector.2.bias").astype(np.float32),
)

# encoder (siglip)
fout.add_tensor(
    "v.position_embd.weight",
    tensors.get_tensor("model.vision_tower.vision_tower.vision_model.embeddings.position_embedding.weight").astype(
        np.float16
    ),
)
fout.add_tensor(
    "v.patch_embd.weight",
    tensors.get_tensor(
        "model.vision_tower.vision_tower.vision_model.embeddings.patch_embedding.weight"
    )
    .reshape(1152, 3, 14, 14)
    .astype(np.float16),
)
fout.add_tensor(
    "v.patch_embd.bias",
    tensors.get_tensor(
        "model.vision_tower.vision_tower.vision_model.embeddings.patch_embedding.bias"
    ).astype(np.float32),
)

fout.add_tensor(
    "v.post_ln.weight",
    tensors.get_tensor("model.vision_tower.vision_tower.vision_model.post_layernorm.weight").astype(
        np.float32
    ),
)
fout.add_tensor(
    "v.post_ln.bias",
    tensors.get_tensor("model.vision_tower.vision_tower.vision_model.post_layernorm.bias").astype(
        np.float32
    ),
)

def blk_tensor(i, name):
    return tensors.get_tensor(
        rf"model.vision_tower.vision_tower.vision_model.encoder.layers.{i}.{name}"
    )

def add_tensor(blk_id, gguf_id=None):
    if gguf_id is None:
        gguf_id = blk_id

    fout.add_tensor(f"v.blk.{gguf_id}.attn_q.weight", blk_tensor(blk_id, "self_attn.q_proj.weight").astype(np.float16))
    fout.add_tensor(f"v.blk.{gguf_id}.attn_q.bias", blk_tensor(blk_id, "self_attn.q_proj.bias").astype(np.float32))
    fout.add_tensor(f"v.blk.{gguf_id}.attn_k.weight", blk_tensor(blk_id, "self_attn.k_proj.weight").astype(np.float16))
    fout.add_tensor(f"v.blk.{gguf_id}.attn_k.bias", blk_tensor(blk_id, "self_attn.k_proj.bias").astype(np.float32))
    fout.add_tensor(f"v.blk.{gguf_id}.attn_v.weight", blk_tensor(blk_id, "self_attn.v_proj.weight").astype(np.float16))
    fout.add_tensor(f"v.blk.{gguf_id}.attn_v.bias", blk_tensor(blk_id, "self_attn.v_proj.bias").astype(np.float32))

    fout.add_tensor(
        f"v.blk.{gguf_id}.attn_out.weight",
        blk_tensor(blk_id, "self_attn.out_proj.weight").astype(np.float16),
    )
    fout.add_tensor(
        f"v.blk.{gguf_id}.attn_out.bias",
        blk_tensor(blk_id, "self_attn.out_proj.bias").astype(np.float32),
    )

    fout.add_tensor(
        f"v.blk.{gguf_id}.ln1.weight",
        blk_tensor(blk_id, "layer_norm1.weight").astype(np.float32),
    )
    fout.add_tensor(
        f"v.blk.{gguf_id}.ln1.bias",
        blk_tensor(blk_id, "layer_norm1.bias").astype(np.float32),
    )

    fout.add_tensor(
        f"v.blk.{gguf_id}.ffn_down.weight",
        blk_tensor(blk_id, "mlp.fc1.weight").astype(np.float16),
    )
    fout.add_tensor(
        f"v.blk.{gguf_id}.ffn_down.bias",
        blk_tensor(blk_id, "mlp.fc1.bias").astype(np.float32),
    )
    fout.add_tensor(
        f"v.blk.{gguf_id}.ffn_up.weight",
        blk_tensor(blk_id, "mlp.fc2.weight").astype(np.float16),
    )
    fout.add_tensor(
        f"v.blk.{gguf_id}.ffn_up.bias",
        blk_tensor(blk_id, "mlp.fc2.bias").astype(np.float32),
    )

    fout.add_tensor(
        f"v.blk.{gguf_id}.ln2.weight",
        blk_tensor(blk_id, "layer_norm2.weight").astype(np.float32),
    )
    fout.add_tensor(
        f"v.blk.{gguf_id}.ln2.bias",
        blk_tensor(blk_id, "layer_norm2.bias").astype(np.float32),
    )

for i in range(27):
    add_tensor(i)

# Duplicate the last block (llava-cli skips over this)
add_tensor(26, 27)

fout.write_header_to_file()
fout.write_kv_data_to_file()
fout.write_tensors_to_file()
fout.close()