#!/bin/bash

# ============================================================================
# Qwen-ASX Model Download Utility
# ============================================================================
#
# Downloads Qwen-ASX model files from mx2lm.app
# Supports multiple download strategies:
#   - full: All files (5.7GB)
#   - inference: Model + configs only (1.8GB)
#   - mx2: MX2-optimized (1.8GB, use MX2LEX instead of tokenizer)
#
# Usage:
#   ./download-qwen-asx.sh full
#   ./download-qwen-asx.sh inference
#   ./download-qwen-asx.sh mx2
#
# ============================================================================

BASE_URL="https://mx2lm.app/Qwen-ASX"
DOWNLOAD_DIR="./Qwen-ASX"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create download directory
mkdir -p "$DOWNLOAD_DIR"
cd "$DOWNLOAD_DIR" || exit 1

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Qwen-ASX Model Download Utility${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

STRATEGY=${1:-inference}

case $STRATEGY in
  full)
    echo -e "${YELLOW}Strategy: FULL DOWNLOAD${NC}"
    echo -e "Total size: ~5.7GB"
    echo -e "Includes: All model files + traditional tokenizer${NC}"
    echo ""

    FILES=(
      "model.safetensors"
      "vocab.json"
      "tokenizer.json"
      "merges.txt"
      "config.json"
      "generation_config.json"
      "tokenizer_config.json"
      "special_tokens_map.json"
      "added_tokens.json"
      "chat_template.jinja"
    )
    ;;

  inference)
    echo -e "${YELLOW}Strategy: INFERENCE ONLY${NC}"
    echo -e "Total size: ~1.8GB"
    echo -e "Includes: Model + configs (use MX2LEX for tokenization)${NC}"
    echo ""

    FILES=(
      "model.safetensors"
      "config.json"
      "generation_config.json"
      "chat_template.jinja"
    )

    echo -e "${GREEN}💡 TIP: Use MX2LEX (24KB) instead of downloading tokenizer files (3.9MB)${NC}"
    echo ""
    ;;

  mx2)
    echo -e "${YELLOW}Strategy: MX2 OPTIMIZED${NC}"
    echo -e "Total size: ~1.8GB (saves 3.9GB vs full download)"
    echo -e "Includes: Model + configs + MX2LEX tokenizer${NC}"
    echo ""

    FILES=(
      "model.safetensors"
      "config.json"
      "generation_config.json"
      "chat_template.jinja"
    )

    echo -e "${GREEN}✅ Using MX2LEX for tokenization (24KB vs 3.9MB traditional)${NC}"
    echo -e "${GREEN}✅ 99% tokenizer size reduction${NC}"
    echo ""
    ;;

  *)
    echo -e "${YELLOW}Unknown strategy: $STRATEGY${NC}"
    echo ""
    echo "Available strategies:"
    echo "  full       - Download all files (5.7GB)"
    echo "  inference  - Model + configs only (1.8GB)"
    echo "  mx2        - MX2-optimized with MX2LEX (1.8GB, saves 3.9GB)"
    echo ""
    echo "Usage: ./download-qwen-asx.sh [full|inference|mx2]"
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
    echo -e "${YELLOW}⚠️  Failed to download: $FILE${NC}"
  fi
  echo ""
done

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Download Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Files saved to: ${GREEN}$DOWNLOAD_DIR${NC}"
echo ""

# Display downloaded files
echo -e "${BLUE}Downloaded files:${NC}"
ls -lh
echo ""

# Show next steps based on strategy
case $STRATEGY in
  full)
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Use with transformers: python -c \"from transformers import AutoModel; model = AutoModel.from_pretrained('$DOWNLOAD_DIR')\""
    echo "2. Or use with MX2QF1: curl -X POST /mx2qf1 -d '{\"action\":\"inference\",\"model_path\":\"$DOWNLOAD_DIR/model.safetensors\"}'"
    ;;

  inference|mx2)
    echo -e "${YELLOW}Next steps:${NC}"
    echo ""
    echo -e "${GREEN}Option 1: Use MX2LEX tokenizer (recommended)${NC}"
    echo "curl -X POST /mx2lex -d '{\"action\":\"tokenize\",\"text\":\"Hello world\"}'"
    echo ""
    echo -e "${GREEN}Option 2: Run inference with MX2QF1${NC}"
    echo "curl -X POST /mx2qf1 -d '{\"action\":\"inference\",\"model_path\":\"$DOWNLOAD_DIR/model.safetensors\",\"prompt\":\"Hello!\"}'"
    echo ""
    echo -e "${GREEN}Option 3: Download traditional tokenizer files${NC}"
    echo "./download-qwen-asx.sh full"
    ;;
esac

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Tokenizer Comparison:${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Traditional (Qwen BPE):     3.9MB (vocab.json + tokenizer.json + merges.txt)"
echo -e "MX2LEX (Symbolic):          24KB (99% reduction)"
echo ""
echo -e "${GREEN}💡 Use MX2LEX to save 3.9GB and get faster tokenization!${NC}"
echo ""
