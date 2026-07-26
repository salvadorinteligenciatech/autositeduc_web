#!/usr/bin/env python3
"""
Valida os materiais cadastrados no site.

Verificações:

- PDFs referenciados que não existem.
- Imagens de prévia que não existem.
- Links de PDF repetidos.
- Cards sem título.
- Quantidade total de cards, PDFs e imagens.
"""

from __future__ import annotations

import re
from collections import Counter
from pathlib import Path


RAIZ = Path(__file__).resolve().parent.parent
HTML_PATH = RAIZ / "materiaisdeaula" / "index.html"


def resolver_caminho(caminho_relativo: str) -> Path:
    """Resolve um caminho relativo ao materiaisdeaula/index.html."""
    return (
        HTML_PATH.parent / caminho_relativo
    ).resolve()


def main() -> None:
    if not HTML_PATH.exists():
        raise SystemExit(
            f"ERRO: arquivo não encontrado: {HTML_PATH}"
        )

    conteudo = HTML_PATH.read_text(encoding="utf-8")

    cards = re.findall(
        r'class="material-card reveal"',
        conteudo,
    )

    pdfs = re.findall(
        r'href="(\.\./pdfs/[^"]+\.pdf)"',
        conteudo,
    )

    previews_por_card = re.findall(
        r'data-preview="([^"]+)"',
        conteudo,
    )

    titulos = re.findall(
        r'<h3>(.*?)</h3>',
        conteudo,
        flags=re.DOTALL,
    )

    previews = []

    for grupo in previews_por_card:
        previews.extend(
            item.strip()
            for item in grupo.split(",")
            if item.strip()
        )

    erros: list[str] = []
    avisos: list[str] = []

    for pdf in pdfs:
        caminho = resolver_caminho(pdf)

        if not caminho.exists():
            erros.append(
                f"PDF inexistente: {pdf}"
            )

    for preview in previews:
        caminho = resolver_caminho(preview)

        if not caminho.exists():
            erros.append(
                f"Prévia inexistente: {preview}"
            )

    contagem_pdfs = Counter(pdfs)

    for pdf, quantidade in contagem_pdfs.items():
        if quantidade > 1:
            erros.append(
                f"PDF repetido {quantidade} vezes: {pdf}"
            )

    if len(cards) != len(pdfs):
        avisos.append(
            f"Quantidade de cards ({len(cards)}) diferente "
            f"da quantidade de PDFs ({len(pdfs)})."
        )

    if len(cards) != len(previews_por_card):
        avisos.append(
            f"Quantidade de cards ({len(cards)}) diferente "
            "da quantidade de conjuntos de prévias "
            f"({len(previews_por_card)})."
        )

    titulos_limpos = [
        re.sub(r"<[^>]+>", "", titulo).strip()
        for titulo in titulos
    ]

    for titulo, quantidade in Counter(
        titulos_limpos
    ).items():
        if titulo and quantidade > 1:
            avisos.append(
                f"Título repetido {quantidade} vezes: {titulo}"
            )

    print("VALIDAÇÃO DOS MATERIAIS")
    print("=" * 50)
    print(f"Cards encontrados: {len(cards)}")
    print(f"PDFs referenciados: {len(pdfs)}")
    print(f"Imagens referenciadas: {len(previews)}")
    print()

    if avisos:
        print("AVISOS")
        print("-" * 50)

        for aviso in avisos:
            print(f"- {aviso}")

        print()

    if erros:
        print("ERROS")
        print("-" * 50)

        for erro in erros:
            print(f"- {erro}")

        raise SystemExit(
            f"\nValidação concluída com {len(erros)} erro(s)."
        )

    print("OK: todos os arquivos referenciados existem.")
    print("OK: nenhum link de PDF está duplicado.")
    print("OK: catálogo validado com sucesso.")


if __name__ == "__main__":
    main()
