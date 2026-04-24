#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  fix_lfs_deploy.sh
#  Removes video/3D model files from Git LFS so GitHub Pages
#  can serve them directly (LFS files are NOT served by Pages).
# ═══════════════════════════════════════════════════════════════════
set -e

REPO_DIR="/Users/apple/Desktop/The World of Mohit"
cd "$REPO_DIR"

echo "🔧 Step 1: Untrack .mp4, .glb, .fbx from LFS..."
git lfs untrack "*.mp4" || true
git lfs untrack "*.glb"  || true
git lfs untrack "*.fbx"  || true

echo "🗑️  Step 2: Remove LFS cache for these extensions..."
git rm --cached video/  3d-model/ --ignore-unmatch -r 2>/dev/null || true

echo "📦 Step 3: Re-add files as regular git objects..."
git add video/
git add 3d-model/
git add .gitattributes

echo "💾 Step 4: Commit..."
git commit -m "fix: remove LFS for mp4/glb so GitHub Pages can serve them directly"

echo "🚀 Step 5: Push to GitHub..."
git push origin main

echo ""
echo "✅ Done! Videos and 3D models are now regular git objects."
echo "   GitHub Pages will serve them correctly."
echo ""
echo "⚠️  NOTE: Large files (mp4, glb) will count against your 1GB repo limit."
echo "   Your videos total ~522 MB + models ~18 MB = ~540 MB total. Should be fine."
