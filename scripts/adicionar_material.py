#!/usr/bin/env python3
"""
Adiciona um novo material ao site Materiais de Aula.

O script realiza automaticamente:

1. Validação do PDF original.
2. Padronização do nome do arquivo.
3. Cópia do PDF para pdfs/<disciplina>/.
4. Geração de três imagens de amostra.
5. Criação do card HTML.
6. Inserção do card no catálogo.
7. Criação de backup do index.html.

Requisito externo:
    brew install poppler

Exemplo:

python scripts/adicionar_material.py \
  --arquivo "/Users/eduardi/Desktop/Movimento Uniforme.pdf" \
  --disciplina fisica \
  --titulo "Movimento uniforme" \
  --area "Cinemática" \
  --descricao "Estudo do movimento com velocidade constante." \
  --nivel "Ensino Médio" \
  --busca "movimento uniforme velocidade constante posição tempo" \
  --simbolos "s,v,t" \
  --paginas "1,2,3"
"""

from __future__ import annotations

import argparse
import html
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path


RAIZ = Path(__file__).resolve().parent.parent
HTML_PATH = RAIZ / "materiaisdeaula" / "index.html"
PASTA_PDFS = RAIZ / "pdfs"
PASTA_PREVIEWS = RAIZ / "assets" / "materiais"


def criar_slug(texto: str) -> str:
    """Converte texto em nome seguro para URL e arquivo."""
    normalizado = unicodedata.normalize("NFKD", texto)
    sem_acentos = normalizado.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", sem_acentos.lower())
    return slug.strip("-")


def validar_paginas(valor: str) -> list[int]:
    """Converte '1,2,3' em uma lista de números de páginas."""
    try:
        paginas = [int(item.strip()) for item in valor.split(",")]
    except ValueError as erro:
        raise argparse.ArgumentTypeError(
            "As páginas devem ser informadas como números: 1,2,3"
        ) from erro

    if not paginas:
        raise argparse.ArgumentTypeError("Informe ao menos uma página.")

    if any(pagina < 1 for pagina in paginas):
        raise argparse.ArgumentTypeError(
            "Os números das páginas devem começar em 1."
        )

    return paginas


def verificar_pdftoppm() -> None:
    """Confirma se o Poppler está instalado."""
    if shutil.which("pdftoppm") is None:
        raise SystemExit(
            "ERRO: pdftoppm não encontrado.\n"
            "Instale com:\n\n"
            "    brew install poppler\n"
        )


def executar_comando(comando: list[str]) -> None:
    """Executa um comando externo e interrompe em caso de erro."""
    resultado = subprocess.run(
        comando,
        text=True,
        capture_output=True,
    )

    if resultado.returncode != 0:
        print(resultado.stdout)
        print(resultado.stderr, file=sys.stderr)
        raise SystemExit(
            f"ERRO ao executar: {' '.join(comando)}"
        )


def gerar_previews(
    pdf_destino: Path,
    pasta_preview: Path,
    paginas: list[int],
) -> list[Path]:
    """Gera imagens JPEG para as páginas selecionadas."""
    pasta_preview.mkdir(parents=True, exist_ok=True)

    imagens_geradas: list[Path] = []

    for indice, pagina in enumerate(paginas, start=1):
        prefixo_temporario = pasta_preview / f"pagina-{pagina}"

        executar_comando(
            [
                "pdftoppm",
                "-f",
                str(pagina),
                "-l",
                str(pagina),
                "-singlefile",
                "-jpeg",
                "-jpegopt",
                "quality=82",
                "-r",
                "120",
                str(pdf_destino),
                str(prefixo_temporario),
            ]
        )

        imagem_temporaria = prefixo_temporario.with_suffix(".jpg")
        imagem_final = pasta_preview / f"preview-{indice:02d}.jpg"

        if not imagem_temporaria.exists():
            raise SystemExit(
                f"ERRO: imagem não gerada para a página {pagina}."
            )

        if imagem_final.exists():
            imagem_final.unlink()

        imagem_temporaria.rename(imagem_final)
        imagens_geradas.append(imagem_final)

    return imagens_geradas


def localizar_final_da_grade(conteudo: str) -> int:
    """
    Localiza o fechamento da grade de materiais.

    A busca usa a mensagem de estado vazio, que aparece imediatamente
    depois do fechamento de materials-grid.
    """
    marcador_vazio = (
        '<p class="materials-empty-state" data-empty-state hidden>'
    )

    posicao_estado_vazio = conteudo.find(marcador_vazio)

    if posicao_estado_vazio == -1:
        raise SystemExit(
            "ERRO: não encontrei o estado vazio do catálogo no HTML."
        )

    posicao_fechamento = conteudo.rfind(
        "</div>",
        0,
        posicao_estado_vazio,
    )

    if posicao_fechamento == -1:
        raise SystemExit(
            "ERRO: não encontrei o fechamento da grade de materiais."
        )

    return posicao_fechamento


def criar_card(
    *,
    disciplina: str,
    nome_disciplina: str,
    titulo: str,
    area: str,
    descricao: str,
    nivel: str,
    busca: str,
    simbolos: list[str],
    pdf_relativo: str,
    previews_relativos: list[str],
) -> str:
    """Cria o HTML completo do card."""
    simbolos_html = "\n".join(
        f"                <span>{html.escape(simbolo)}</span>"
        for simbolo in simbolos
    )

    previews = ",".join(previews_relativos)

    classe_capa = (
        "material-cover-physics"
        if disciplina == "fisica"
        else "material-cover-chemistry"
    )

    return f'''
        <article
          class="material-card reveal"
          data-material-card
          data-subject="{html.escape(disciplina)}"
          data-search="{html.escape(busca)}"
        >
          <div class="material-cover {classe_capa}">
            <div class="material-cover-top">
              <span>{html.escape(nome_disciplina)}</span>
              <span>PDF</span>
            </div>

            <div class="material-cover-content">
              <small>Notas de aula</small>
              <strong>{html.escape(titulo)}</strong>
              <p>{html.escape(area)}</p>
            </div>

            <div class="material-cover-visual" aria-hidden="true">
{simbolos_html}
            </div>
          </div>

          <div class="material-card-content">
            <div class="material-tags">
              <span>{html.escape(nome_disciplina)}</span>
              <span>{html.escape(area)}</span>
              <span>{html.escape(nivel)}</span>
            </div>

            <h3>{html.escape(titulo)}</h3>

            <p>{html.escape(descricao)}</p>

            <div class="material-meta">
              <span>Apresentação em PDF</span>
              <span>{len(previews_relativos)} páginas de amostra</span>
            </div>

            <div class="material-actions">
              <button
                class="button material-preview-button"
                type="button"
                data-preview-button
                data-title="{html.escape(titulo)}"
                data-preview="{html.escape(previews)}"
              >
                Ver amostra
              </button>

              <a
                class="button button-primary"
                href="{html.escape(pdf_relativo)}"
                download
              >
                Baixar PDF
              </a>
            </div>
          </div>
        </article>
'''


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Adiciona um novo PDF ao catálogo de materiais."
    )

    parser.add_argument(
        "--arquivo",
        required=True,
        help="Caminho do PDF original.",
    )

    parser.add_argument(
        "--disciplina",
        required=True,
        choices=["fisica", "quimica"],
        help="Disciplina do material.",
    )

    parser.add_argument(
        "--titulo",
        required=True,
        help="Título exibido no card.",
    )

    parser.add_argument(
        "--area",
        required=True,
        help="Área de conhecimento: Cinemática, Dinâmica etc.",
    )

    parser.add_argument(
        "--descricao",
        required=True,
        help="Descrição curta do conteúdo.",
    )

    parser.add_argument(
        "--nivel",
        default="Ensino Médio",
        help="Nível ou modalidade de ensino.",
    )

    parser.add_argument(
        "--busca",
        required=True,
        help="Palavras usadas pelo campo de pesquisa.",
    )

    parser.add_argument(
        "--simbolos",
        default="F,∆,t",
        help='Três símbolos separados por vírgula. Ex.: "F,m,a".',
    )

    parser.add_argument(
        "--paginas",
        type=validar_paginas,
        default=[1, 2, 3],
        help='Páginas usadas na amostra. Padrão: "1,2,3".',
    )

    parser.add_argument(
        "--slug",
        help="Nome opcional para URL. Caso omitido, usa o título.",
    )

    argumentos = parser.parse_args()

    verificar_pdftoppm()

    arquivo_origem = Path(argumentos.arquivo).expanduser().resolve()

    if not arquivo_origem.exists():
        raise SystemExit(
            f"ERRO: arquivo não encontrado:\n{arquivo_origem}"
        )

    if arquivo_origem.suffix.lower() != ".pdf":
        raise SystemExit("ERRO: o arquivo informado não é um PDF.")

    if not HTML_PATH.exists():
        raise SystemExit(
            f"ERRO: index.html não encontrado:\n{HTML_PATH}"
        )

    slug = criar_slug(argumentos.slug or argumentos.titulo)

    if not slug:
        raise SystemExit("ERRO: não foi possível criar o slug.")

    pasta_pdf_disciplina = PASTA_PDFS / argumentos.disciplina
    pasta_pdf_disciplina.mkdir(parents=True, exist_ok=True)

    pdf_destino = pasta_pdf_disciplina / f"{slug}.pdf"

    pasta_preview = (
        PASTA_PREVIEWS
        / argumentos.disciplina
        / slug
    )

    pdf_relativo = (
        f"../pdfs/{argumentos.disciplina}/{slug}.pdf"
    )

    conteudo_html = HTML_PATH.read_text(encoding="utf-8")

    if pdf_relativo in conteudo_html:
        raise SystemExit(
            f"ERRO: o material já está cadastrado:\n{pdf_relativo}"
        )

    if pdf_destino.exists():
        raise SystemExit(
            f"ERRO: já existe um PDF com esse nome:\n{pdf_destino}"
        )

    print(f"Copiando PDF para: {pdf_destino}")
    shutil.copy2(arquivo_origem, pdf_destino)

    try:
        print(
            "Gerando amostras das páginas: "
            + ", ".join(map(str, argumentos.paginas))
        )

        imagens = gerar_previews(
            pdf_destino,
            pasta_preview,
            argumentos.paginas,
        )

        previews_relativos = [
            "../"
            + imagem.relative_to(RAIZ).as_posix()
            for imagem in imagens
        ]

        nomes_disciplinas = {
            "fisica": "Física",
            "quimica": "Química",
        }

        simbolos = [
            item.strip()
            for item in argumentos.simbolos.split(",")
            if item.strip()
        ]

        if not simbolos:
            simbolos = ["•", "•", "•"]

        card = criar_card(
            disciplina=argumentos.disciplina,
            nome_disciplina=nomes_disciplinas[
                argumentos.disciplina
            ],
            titulo=argumentos.titulo,
            area=argumentos.area,
            descricao=argumentos.descricao,
            nivel=argumentos.nivel,
            busca=argumentos.busca,
            simbolos=simbolos[:3],
            pdf_relativo=pdf_relativo,
            previews_relativos=previews_relativos,
        )

        backup_path = HTML_PATH.with_suffix(".html.bak")
        shutil.copy2(HTML_PATH, backup_path)

        posicao = localizar_final_da_grade(conteudo_html)

        novo_html = (
            conteudo_html[:posicao]
            + card
            + "\n        "
            + conteudo_html[posicao:]
        )

        HTML_PATH.write_text(
            novo_html,
            encoding="utf-8",
        )

    except Exception:
        if pdf_destino.exists():
            pdf_destino.unlink()

        if pasta_preview.exists():
            shutil.rmtree(pasta_preview)

        raise

    print()
    print("Material adicionado com sucesso.")
    print(f"PDF: {pdf_destino.relative_to(RAIZ)}")
    print(f"Prévia: {pasta_preview.relative_to(RAIZ)}")
    print(f"HTML: {HTML_PATH.relative_to(RAIZ)}")
    print(f"Backup: {backup_path.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
