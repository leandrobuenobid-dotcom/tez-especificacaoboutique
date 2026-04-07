import os
import base64
import json
import urllib.request
import urllib.error

TOKEN = "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"
REPO = "leandrobuenobid-dotcom/tez-especificacaoboutique"
API = "https://api.github.com"

# Pasta onde está o projeto tez-app
# Mude esse caminho se necessário
BASE_DIR = os.path.join(os.path.expanduser("~"), "Documents", "tez-app")

EXCLUDES = ["node_modules", ".next", ".git", "tsconfig.tsbuildinfo", "AGENTS.md", "CLAUDE.md"]

def upload_file(local_path, github_path):
    with open(local_path, "rb") as f:
        content = base64.b64encode(f.read()).decode("utf-8")

    url = f"{API}/repos/{REPO}/contents/{github_path}"
    data = json.dumps({
        "message": f"add {github_path}",
        "content": content
    }).encode("utf-8")

    req = urllib.request.Request(url, data=data, method="PUT")
    req.add_header("Authorization", f"token {TOKEN}")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  ✓ {github_path}")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        msg = json.loads(body).get("message", "erro")
        print(f"  ✗ {github_path}: {msg}")
        return False

def main():
    if not os.path.exists(BASE_DIR):
        print(f"ERRO: Pasta não encontrada: {BASE_DIR}")
        print("Abra o script e corrija o caminho BASE_DIR")
        input("Pressione Enter para sair...")
        return

    print(f"Subindo arquivos de: {BASE_DIR}")
    print(f"Para o repositório: {REPO}")
    print("-" * 50)

    ok = 0
    erro = 0

    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDES]
        for filename in files:
            local_path = os.path.join(root, filename)
            rel_path = os.path.relpath(local_path, BASE_DIR).replace("\\", "/")
            if any(e in rel_path for e in EXCLUDES):
                continue
            if upload_file(local_path, rel_path):
                ok += 1
            else:
                erro += 1

    print("-" * 50)
    print(f"Concluído! {ok} arquivos enviados, {erro} erros.")
    input("Pressione Enter para sair...")

if __name__ == "__main__":
    main()
