#!/bin/bash

set -Eeuo pipefail

DOCKER_USER="cosmeaf"
IMAGE_NAME="veloma-frontend"
CONTAINER_NAME="veloma-frontend"
PORT=3000

log() { echo -e "\033[1;34m[INFO]\033[0m $1"; }
success() { echo -e "\033[1;32m[SUCCESS]\033[0m $1"; }
error() { echo -e "\033[1;31m[ERROR]\033[0m $1"; }

command -v docker >/dev/null || { error "Docker não instalado."; exit 1; }
command -v jq >/dev/null || { error "jq não instalado."; exit 1; }

CURRENT_VERSION=$(jq -r .version package.json)

increment_version() {
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

  case "$1" in
    patch)
      PATCH=$((PATCH + 1))
      ;;
    minor)
      MINOR=$((MINOR + 1))
      PATCH=0
      ;;
    major)
      MAJOR=$((MAJOR + 1))
      MINOR=0
      PATCH=0
      ;;
  esac

  NEW_VERSION="$MAJOR.$MINOR.$PATCH"
}

update_package_json() {
  tmp=$(mktemp)
  jq ".version = \"$NEW_VERSION\"" package.json > "$tmp"
  mv "$tmp" package.json
}

show_version() {
  echo
  echo "Versão atual: $CURRENT_VERSION"
  echo
}

deploy() {

  FULL_IMAGE="$DOCKER_USER/$IMAGE_NAME:$CURRENT_VERSION"
  LATEST_IMAGE="$DOCKER_USER/$IMAGE_NAME:latest"

  log "Buildando imagem $FULL_IMAGE"
  docker build -t $FULL_IMAGE .
  docker tag $FULL_IMAGE $LATEST_IMAGE

  log "Push para DockerHub"
  docker push $FULL_IMAGE
  docker push $LATEST_IMAGE

  log "Removendo container antigo"
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true

  log "Subindo novo container"
  docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:80 \
    --restart unless-stopped \
    $FULL_IMAGE

  success "Deploy concluído: $CURRENT_VERSION"
}

case "${1:-}" in

  --show)
    show_version
    ;;

  --patch|--minor|--major)
    TYPE="${1#--}"
    increment_version "$TYPE"

    echo
    echo "Versão atual: $CURRENT_VERSION"
    echo "Nova versão  : $NEW_VERSION"
    echo

    read -p "Confirmar atualização? (y/n): " confirm

    if [[ "$confirm" == "y" ]]; then
      update_package_json
      CURRENT_VERSION="$NEW_VERSION"
      deploy
    else
      echo "Cancelado."
    fi
    ;;

  --deploy)
    show_version
    deploy
    ;;

  *)
    echo
    echo "Uso:"
    echo "  ./deploy.sh --show"
    echo "  ./deploy.sh --patch"
    echo "  ./deploy.sh --minor"
    echo "  ./deploy.sh --major"
    echo "  ./deploy.sh --deploy"
    echo
    ;;
esac