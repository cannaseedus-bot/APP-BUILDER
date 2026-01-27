#!/bin/bash

# ============================================================================
# QwenF1 Model Download Utility
# ============================================================================
#
# Downloads QwenF1 model files from mx2lm.app
# Supports multiple download strategies:
#   - inference: Model + configs only (1.85GB)
#   - training: Model + complete training state (5.52GB)
#   - checkpoint: Download specific checkpoint
#   - full: Everything including all checkpoints (~30GB+)
#
# Usage:
#   ./download-qwenf1.sh inference
#   ./download-qwenf1.sh training
#   ./download-qwenf1.sh checkpoint-100
#   ./download-qwenf1.sh full
#
# ============================================================================

BASE_URL="https://mx2lm.app/QwenF1"
DOWNLOAD_DIR="./QwenF1"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

mkdir -p "$DOWNLOAD_DIR"
cd "$DOWNLOAD_DIR" || exit 1

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  QwenF1 Model Download Utility${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

STRATEGY=${1:-inference}

case $STRATEGY in
  inference)
    echo -e "${YELLOW}Strategy: INFERENCE ONLY${NC}"
    echo -e "Total size: ~1.85GB"
    echo -e "Includes: Model + configs + ASX integration${NC}"
    echo ""

    FILES=(
      "model.safetensors"
      "config.json"
      "generation_config.json"
      "asx.xjson"
      "chat_template.jinja"
    )

    echo -e "${GREEN}💡 Use MX2LEX (44KB) instead of downloading tokenizer files (15.14MB)${NC}"
    echo -e "${GREEN}   Savings: 99.7% reduction!${NC}"
    echo ""
    ;;

  training)
    echo -e "${YELLOW}Strategy: CONTINUE TRAINING${NC}"
    echo -e "Total size: ~5.52GB"
    echo -e "Includes: Model + complete training state${NC}"
    echo ""

    FILES=(
      "model.safetensors"
      "optimizer.pt"
      "scheduler.pt"
      "scaler.pt"
      "rng_state.pth"
      "trainer_state.json"
      "training_args.bin"
      "config.json"
      "generation_config.json"
      "asx.xjson"
    )

    echo -e "${GREEN}✅ Complete training state for MX2GYM${NC}"
    echo -e "${GREEN}✅ Resume training from checkpoint-375${NC}"
    echo ""
    ;;

  checkpoint-100|checkpoint-200|checkpoint-300|checkpoint-375)
    CHECKPOINT="$STRATEGY"
    echo -e "${YELLOW}Strategy: DOWNLOAD CHECKPOINT${NC}"
    echo -e "Checkpoint: $CHECKPOINT"
    echo -e "Total size: ~5.52GB"
    echo ""

    mkdir -p "$CHECKPOINT"
    cd "$CHECKPOINT" || exit 1

    FILES=(
      "model.safetensors"
      "optimizer.pt"
    )

    echo -e "${GREEN}📦 Downloading checkpoint: $CHECKPOINT${NC}"
    echo ""

    for FILE in "${FILES[@]}"; do
      echo -e "${GREEN}📥 Downloading: $FILE${NC}"
      curl -# -L -o "$FILE" "$BASE_URL/$CHECKPOINT/$FILE"

      if [ $? -eq 0 ]; then
        FILE_SIZE=$(du -h "$FILE" | cut -f1)
        echo -e "${GREEN}✅ Downloaded: $FILE ($FILE_SIZE)${NC}"
      else
        echo -e "${RED}⚠️  Failed: $FILE${NC}"
      fi
      echo ""
    done

    cd ..
    echo -e "${GREEN}✅ Checkpoint $CHECKPOINT downloaded!${NC}"
    exit 0
    ;;

  full)
    echo -e "${YELLOW}Strategy: FULL DOWNLOAD${NC}"
    echo -e "${RED}WARNING: This will download ~30GB+ of data!${NC}"
    echo -e "Includes: Model + training state + all checkpoints + tokenizer${NC}"
    echo ""
    echo -e "${YELLOW}Press CTRL+C to cancel, or wait 5 seconds to continue...${NC}"
    sleep 5

    FILES=(
      "model.safetensors"
      "optimizer.pt"
      "scheduler.pt"
      "scaler.pt"
      "rng_state.pth"
      "trainer_state.json"
      "training_args.bin"
      "config.json"
      "generation_config.json"
      "asx.xjson"
      "vocab.json"
      "tokenizer.json"
      "merges.txt"
      "tokenizer_config.json"
      "special_tokens_map.json"
      "added_tokens.json"
      "chat_template.jinja"
    )

    echo -e "${BLUE}Downloading main files...${NC}"
    ;;

  *)
    echo -e "${RED}Unknown strategy: $STRATEGY${NC}"
    echo ""
    echo "Available strategies:"
    echo "  inference       - Model + configs only (1.85GB)"
    echo "  training        - Model + training state (5.52GB)"
    echo "  checkpoint-100  - Download checkpoint-100"
    echo "  checkpoint-200  - Download checkpoint-200"
    echo "  checkpoint-300  - Download checkpoint-300"
    echo "  checkpoint-375  - Download latest checkpoint"
    echo "  full            - Everything (~30GB+)"
    echo ""
    echo "Usage: ./download-qwenf1.sh [strategy]"
    exit 1
    ;;
esac

# Download files
echo -e "${BLUE}Downloading files...${NC}"
echo ""

for FILE in "${FILES[@]}"; do
  echo -e "${GREEN}📥 Downloading: $FILE${NC}"
  curl -# -L -o "$FILE" "$BASE_URL/$FILE"

  if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "$FILE" | cut -f1)
    echo -e "${GREEN}✅ Downloaded: $FILE ($FILE_SIZE)${NC}"
  else
    echo -e "${RED}⚠️  Failed to download: $FILE${NC}"
  fi
  echo ""
done

# Download checkpoints if full download
if [ "$STRATEGY" = "full" ]; then
  echo -e "${BLUE}========================================${NC}"
  echo -e "${YELLOW}Downloading checkpoints...${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""

  for CHECKPOINT in checkpoint-100 checkpoint-200 checkpoint-300 checkpoint-375; do
    echo -e "${GREEN}📦 Checkpoint: $CHECKPOINT${NC}"
    mkdir -p "$CHECKPOINT"

    curl -# -L -o "$CHECKPOINT/model.safetensors" "$BASE_URL/$CHECKPOINT/model.safetensors"
    curl -# -L -o "$CHECKPOINT/optimizer.pt" "$BASE_URL/$CHECKPOINT/optimizer.pt"

    echo ""
  done
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Download Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Files saved to: ${GREEN}$DOWNLOAD_DIR${NC}"
echo ""

# Display files
echo -e "${BLUE}Downloaded files:${NC}"
ls -lh
echo ""

# Next steps
case $STRATEGY in
  inference)
    echo -e "${YELLOW}Next steps:${NC}"
    echo ""
    echo -e "${GREEN}Option 1: Use MX2LEX tokenizer (recommended)${NC}"
    echo "curl -X POST /mx2lex -d '{\"action\":\"tokenize\",\"text\":\"Hello!\"}'"
    echo ""
    echo -e "${GREEN}Option 2: Run inference with MX2QF1${NC}"
    echo "curl -X POST /mx2qf1 -d '{"
    echo "  \"action\":\"inference\","
    echo "  \"model_path\":\"$DOWNLOAD_DIR/model.safetensors\","
    echo "  \"asx_config\":\"$DOWNLOAD_DIR/asx.xjson\","
    echo "  \"prompt\":\"What is quantum computing?\""
    echo "}'"
    ;;

  training)
    echo -e "${YELLOW}Next steps: Continue Training with MX2GYM${NC}"
    echo ""
    echo "curl -X POST /mx2gym -d '{"
    echo "  \"action\":\"train_fold\","
    echo "  \"model_path\":\"$DOWNLOAD_DIR/model.safetensors\","
    echo "  \"optimizer_path\":\"$DOWNLOAD_DIR/optimizer.pt\","
    echo "  \"scheduler_path\":\"$DOWNLOAD_DIR/scheduler.pt\","
    echo "  \"trainer_state_path\":\"$DOWNLOAD_DIR/trainer_state.json\","
    echo "  \"fold_id\":\"fold_custom_v1\","
    echo "  \"resume_from_checkpoint\":true,"
    echo "  \"start_step\":375"
    echo "}'"
    ;;
esac

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Tokenizer Comparison:${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "QwenF1 Traditional:  15.14MB (vocab.json + tokenizer.json + merges.txt)"
echo -e "MX2LEX (Symbolic):   44KB (99.7% reduction!)"
echo ""
echo -e "${GREEN}💡 MX2LEX saves 15MB and works for both Qwen-ASX AND QwenF1!${NC}"
echo ""
