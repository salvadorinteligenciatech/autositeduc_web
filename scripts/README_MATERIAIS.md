# Manual dos scripts — Materiais de Aula

Este documento explica como utilizar os scripts responsáveis por adicionar e validar materiais na página:

```text
https://salvadorinteligenciatech.com/materiaisdeaula/
```

Os arquivos devem ficar na pasta:

```text
scripts/
├── adicionar_material.py
├── validar_materiais.py
└── README_MATERIAIS.md
```

---

# 1. Visão geral do fluxo

Para adicionar um novo material ao site:

1. Prepare o arquivo PDF no computador.
2. Execute `adicionar_material.py`.
3. Confira o material no site local.
4. Execute `validar_materiais.py`.
5. Verifique as alterações com o Git.
6. Faça o commit apenas quando tudo estiver correto.

O script de adição cuida automaticamente de:

- copiar o PDF para a pasta correta;
- padronizar o nome usado na URL;
- gerar as imagens de amostra;
- criar o card do material;
- inserir o card no catálogo;
- criar um backup do HTML.

---

# 2. Pré-requisitos

## 2.1. Estar na raiz do projeto

Antes de executar qualquer script:

```bash
cd /Users/eduardi/Documents/dev/autositeduc-site
```

Confirme:

```bash
pwd
```

Resultado esperado:

```text
/Users/eduardi/Documents/dev/autositeduc-site
```

## 2.2. Ativar o ambiente virtual

Caso o ambiente ainda não esteja ativo:

```bash
source /Users/eduardi/Documents/dev/data-engineering-projects/venv/bin/activate
```

O terminal deverá mostrar algo semelhante a:

```text
(venv) eduardi@macbookpro autositeduc-site %
```

## 2.3. Poppler

O script utiliza `pdftoppm` para transformar páginas dos PDFs em imagens.

Confira se está instalado:

```bash
command -v pdftoppm
```

Resultado esperado:

```text
/opt/homebrew/bin/pdftoppm
```

Caso não esteja instalado:

```bash
brew install poppler
```

---

# 3. Script `adicionar_material.py`

## 3.1. Finalidade

O script:

```text
scripts/adicionar_material.py
```

adiciona um novo PDF ao catálogo da página de materiais.

Ele executa as seguintes etapas:

1. verifica se o PDF original existe;
2. verifica se o arquivo realmente é um PDF;
3. cria um nome seguro para a URL;
4. copia o PDF para a pasta da disciplina;
5. gera imagens JPEG das páginas escolhidas;
6. cria o card HTML;
7. insere o card no catálogo;
8. cria um backup do `index.html`.

## 3.2. Estrutura criada pelo script

Para Física:

```text
pdfs/fisica/nome-do-material.pdf

assets/materiais/fisica/nome-do-material/
├── preview-01.jpg
├── preview-02.jpg
└── preview-03.jpg
```

Para Química:

```text
pdfs/quimica/nome-do-material.pdf

assets/materiais/quimica/nome-do-material/
├── preview-01.jpg
├── preview-02.jpg
└── preview-03.jpg
```

O card é inserido em:

```text
materiaisdeaula/index.html
```

---

# 4. Comando básico para adicionar material

Modelo geral:

```bash
python scripts/adicionar_material.py \
  --arquivo "CAMINHO_DO_PDF" \
  --disciplina fisica \
  --titulo "TÍTULO DO MATERIAL" \
  --area "ÁREA DE CONHECIMENTO" \
  --descricao "DESCRIÇÃO DO MATERIAL" \
  --nivel "Ensino Médio" \
  --busca "PALAVRAS USADAS NA PESQUISA" \
  --simbolos "SÍMBOLO1,SÍMBOLO2,SÍMBOLO3" \
  --paginas "1,2,3"
```

Cada barra invertida `\` permite continuar o comando na linha seguinte. Não coloque caracteres depois da barra invertida.

---

# 5. Parâmetros do script

## `--arquivo`

Caminho completo do PDF original.

Exemplo:

```bash
--arquivo "$HOME/Desktop/Movimento Uniforme.pdf"
```

Também pode ser usado um caminho absoluto:

```bash
--arquivo "/Users/eduardi/Desktop/Movimento Uniforme.pdf"
```

O arquivo original não é apagado. Ele é copiado para o projeto.

## `--disciplina`

Define a disciplina e a pasta de destino.

Valores aceitos:

```text
fisica
quimica
```

Exemplo:

```bash
--disciplina fisica
```

Use sempre sem acento e em letras minúsculas.

## `--titulo`

Título apresentado no card.

Exemplo:

```bash
--titulo "Movimento uniforme"
```

O título também é usado para gerar automaticamente o nome do PDF e da pasta das imagens.

Exemplo:

```text
Movimento uniforme
```

será convertido para:

```text
movimento-uniforme
```

## `--area`

Área de conhecimento ou assunto principal.

Exemplos de Física:

```text
Introdução à Física
Grandezas e medidas
Vetores
Cinemática
Dinâmica
Termologia
Calorimetria
Ondulatória
Óptica
Eletricidade
```

Exemplos de Química:

```text
Matéria
Estrutura atômica
Tabela periódica
Ligações químicas
Funções inorgânicas
Reações químicas
Estequiometria
Química orgânica
```

Exemplo:

```bash
--area "Cinemática"
```

## `--descricao`

Texto curto apresentado no card.

Exemplo:

```bash
--descricao "Estudo do movimento com velocidade constante e análise das relações entre posição e tempo."
```

Recomendações:

- usar uma ou duas frases;
- evitar descrições muito longas;
- destacar os principais conceitos;
- escrever de forma atrativa para professores e estudantes.

## `--nivel`

Nível ou modalidade de ensino.

Exemplos:

```text
Ensino Fundamental
Ensino Médio
EJA
Ensino Médio e EJA
```

Exemplo:

```bash
--nivel "Ensino Médio"
```

Caso seja omitido, o valor padrão será `Ensino Médio`.

## `--busca`

Palavras utilizadas pelo campo de pesquisa do site.

Exemplo:

```bash
--busca "física cinemática movimento uniforme velocidade constante posição tempo"
```

Inclua:

- nome da disciplina;
- área de conhecimento;
- título;
- conceitos relacionados;
- palavras que o visitante provavelmente pesquisará.

Não é necessário separar as palavras com vírgulas.

## `--simbolos`

Três símbolos exibidos na capa visual do card.

Exemplos:

```bash
--simbolos "∆s,v,t"
```

```bash
--simbolos "F,m,a"
```

```bash
--simbolos "Q,L,∆T"
```

```bash
--simbolos "H,C,O"
```

Os símbolos devem ser separados por vírgulas. O script usa no máximo os três primeiros.

## `--paginas`

Páginas do PDF que serão usadas como amostra.

Exemplo:

```bash
--paginas "1,2,3"
```

Também é possível escolher páginas não consecutivas:

```bash
--paginas "2,5,8"
```

A ordem informada será respeitada:

```text
primeira página informada → preview-01.jpg
segunda página informada  → preview-02.jpg
terceira página informada → preview-03.jpg
```

Escolha páginas que:

- tenham boa aparência visual;
- representem bem o conteúdo;
- despertem interesse;
- não revelem necessariamente todo o material;
- sejam legíveis mesmo em telas menores.

## `--slug`

Parâmetro opcional para definir manualmente o nome usado na URL.

Exemplo:

```bash
--slug "movimento-uniforme"
```

Sem esse parâmetro, o script usa o título.

Use somente quando quiser um nome diferente do título.

---

# 6. Exemplo completo — Física

```bash
python scripts/adicionar_material.py \
  --arquivo "$HOME/Desktop/Movimento Uniforme.pdf" \
  --disciplina fisica \
  --titulo "Movimento uniforme" \
  --area "Cinemática" \
  --descricao "Estudo do movimento com velocidade constante e análise das relações entre posição e tempo." \
  --nivel "Ensino Médio" \
  --busca "física cinemática movimento uniforme velocidade constante posição tempo" \
  --simbolos "∆s,v,t" \
  --paginas "1,2,3"
```

Arquivos esperados:

```text
pdfs/fisica/movimento-uniforme.pdf

assets/materiais/fisica/movimento-uniforme/
├── preview-01.jpg
├── preview-02.jpg
└── preview-03.jpg
```

---

# 7. Exemplo completo — Química

```bash
python scripts/adicionar_material.py \
  --arquivo "$HOME/Desktop/Tabela Periódica.pdf" \
  --disciplina quimica \
  --titulo "Tabela periódica" \
  --area "Estrutura da matéria" \
  --descricao "Organização dos elementos químicos, famílias, períodos e propriedades periódicas." \
  --nivel "EJA" \
  --busca "química tabela periódica elementos famílias períodos propriedades periódicas" \
  --simbolos "H,C,O" \
  --paginas "1,3,5"
```

Arquivos esperados:

```text
pdfs/quimica/tabela-periodica.pdf

assets/materiais/quimica/tabela-periodica/
├── preview-01.jpg
├── preview-02.jpg
└── preview-03.jpg
```

---

# 8. Resultado esperado no terminal

Ao concluir com sucesso, o terminal mostrará algo semelhante a:

```text
Copiando PDF para: .../pdfs/fisica/movimento-uniforme.pdf
Gerando amostras das páginas: 1, 2, 3

Material adicionado com sucesso.
PDF: pdfs/fisica/movimento-uniforme.pdf
Prévia: assets/materiais/fisica/movimento-uniforme
HTML: materiaisdeaula/index.html
Backup: materiaisdeaula/index.html.bak
```

---

# 9. Backup automático

Antes de modificar o catálogo, o script cria:

```text
materiaisdeaula/index.html.bak
```

Caso seja necessário desfazer a última inclusão:

```bash
cp materiaisdeaula/index.html.bak materiaisdeaula/index.html
```

Atenção: o backup restaura o HTML, mas não remove automaticamente o PDF e as imagens criadas.

Para remover manualmente um material de Física:

```bash
rm pdfs/fisica/nome-do-material.pdf
rm -rf assets/materiais/fisica/nome-do-material
```

Para Química:

```bash
rm pdfs/quimica/nome-do-material.pdf
rm -rf assets/materiais/quimica/nome-do-material
```

---

# 10. Erros comuns ao adicionar materiais

## PDF não encontrado

Mensagem:

```text
ERRO: arquivo não encontrado
```

Verifique o nome e o caminho:

```bash
ls -lh "$HOME/Desktop/Movimento Uniforme.pdf"
```

## Arquivo não é PDF

Mensagem:

```text
ERRO: o arquivo informado não é um PDF.
```

O arquivo precisa terminar com `.pdf`.

## `pdftoppm` não encontrado

Mensagem:

```text
ERRO: pdftoppm não encontrado.
```

Instale:

```bash
brew install poppler
```

## Material já cadastrado

Mensagem:

```text
ERRO: o material já está cadastrado
```

Isso significa que o link do PDF já está presente no HTML.

Não execute novamente com o mesmo título ou `slug`.

## PDF com o mesmo nome já existe

Mensagem:

```text
ERRO: já existe um PDF com esse nome
```

Escolha outro título ou informe um `slug` diferente:

```bash
--slug "movimento-uniforme-versao-2"
```

## Página da amostra não existe

Caso o PDF tenha 10 páginas e seja informado:

```bash
--paginas "1,5,20"
```

a geração da página 20 falhará.

Confira a quantidade de páginas:

```bash
mdls -raw -name kMDItemNumberOfPages "$HOME/Desktop/arquivo.pdf"
```

---

# 11. Script `validar_materiais.py`

## 11.1. Finalidade

O script:

```text
scripts/validar_materiais.py
```

verifica se o catálogo está consistente.

Ele procura:

- PDFs referenciados que não existem;
- imagens de amostra inexistentes;
- PDFs cadastrados mais de uma vez;
- diferença entre a quantidade de cards e PDFs;
- diferença entre cards e conjuntos de imagens;
- títulos repetidos.

## 11.2. Como executar

Na raiz do projeto:

```bash
python scripts/validar_materiais.py
```

## 11.3. Resultado esperado

```text
VALIDAÇÃO DOS MATERIAIS
==================================================
Cards encontrados: 16
PDFs referenciados: 16
Imagens referenciadas: 48

OK: todos os arquivos referenciados existem.
OK: nenhum link de PDF está duplicado.
OK: catálogo validado com sucesso.
```

O número exato aumentará conforme novos materiais forem adicionados.

---

# 12. Possíveis mensagens da validação

## PDF inexistente

```text
PDF inexistente: ../pdfs/fisica/movimento-uniforme.pdf
```

Confira:

```bash
ls -lh pdfs/fisica/movimento-uniforme.pdf
```

## Imagem inexistente

```text
Prévia inexistente: ../assets/materiais/fisica/movimento-uniforme/preview-02.jpg
```

Confira:

```bash
find assets/materiais/fisica/movimento-uniforme -type f
```

## PDF repetido

```text
PDF repetido 2 vezes
```

Localize:

```bash
grep -n "nome-do-material.pdf" materiaisdeaula/index.html
```

## Título repetido

```text
Título repetido 2 vezes
```

Localize:

```bash
grep -n "<h3>Título do material</h3>" materiaisdeaula/index.html
```

---

# 13. Teste local do site

Depois de adicionar e validar um material, inicie o servidor:

```bash
python -m http.server 8000
```

Abra:

```text
http://localhost:8000/materiaisdeaula/
```

Durante a revisão, verifique:

- título do card;
- descrição;
- disciplina;
- área de conhecimento;
- nível;
- símbolos da capa;
- botão “Ver amostra”;
- imagens da amostra;
- botão “Baixar PDF”;
- campo de pesquisa;
- filtro da disciplina;
- olhinho para mostrar e ocultar os cards;
- comportamento em tela pequena.

Para encerrar o servidor:

```text
Control + C
```

---

# 14. Verificação com Git

Depois do teste:

```bash
git status --short
```

Arquivos esperados:

```text
M  materiaisdeaula/index.html
?? pdfs/fisica/nome-do-material.pdf
?? assets/materiais/fisica/nome-do-material/
```

Também poderá aparecer:

```text
?? materiaisdeaula/index.html.bak
```

O arquivo de backup não precisa ser versionado.

Para removê-lo:

```bash
rm -f materiaisdeaula/index.html.bak
```

---

# 15. Checklist antes do commit

Execute:

```bash
python scripts/validar_materiais.py
```

Depois:

```bash
git status --short
```

Confira:

- [ ] PDF correto;
- [ ] título correto;
- [ ] descrição revisada;
- [ ] disciplina correta;
- [ ] área correta;
- [ ] palavras de pesquisa adequadas;
- [ ] imagens da amostra legíveis;
- [ ] download funcionando;
- [ ] busca funcionando;
- [ ] filtros funcionando;
- [ ] cards abrindo e fechando;
- [ ] página responsiva;
- [ ] validação sem erros;
- [ ] backup removido antes do commit.

---

# 16. Commit da inclusão de um material

Exemplo:

```bash
git add \
  materiaisdeaula/index.html \
  pdfs/fisica/movimento-uniforme.pdf \
  assets/materiais/fisica/movimento-uniforme
```

Confira:

```bash
git status --short
```

Faça o commit:

```bash
git commit -m "Adiciona material de movimento uniforme"
```

Como o desenvolvimento ocorre em uma branch separada, envie a branch:

```bash
git push -u origin materiais-de-aula
```

Nos próximos pushes:

```bash
git push
```

---

# 17. Fluxo resumido para uso futuro

## Adicionar

```bash
python scripts/adicionar_material.py \
  --arquivo "$HOME/Desktop/ARQUIVO.pdf" \
  --disciplina fisica \
  --titulo "TÍTULO" \
  --area "ÁREA" \
  --descricao "DESCRIÇÃO" \
  --nivel "Ensino Médio" \
  --busca "PALAVRAS DE PESQUISA" \
  --simbolos "A,B,C" \
  --paginas "1,2,3"
```

## Validar

```bash
python scripts/validar_materiais.py
```

## Testar

```bash
python -m http.server 8000
```

Abrir:

```text
http://localhost:8000/materiaisdeaula/
```

## Verificar Git

```bash
git status --short
```

## Remover backup

```bash
rm -f materiaisdeaula/index.html.bak
```

## Commit

```bash
git add materiaisdeaula/index.html pdfs assets/materiais
git commit -m "Adiciona novo material de aula"
git push
```

---

# 18. Observações importantes

- Não renomeie manualmente um PDF depois que ele estiver cadastrado.
- Não mova as imagens de prévia depois da inclusão.
- Não use espaços ou acentos manualmente nos nomes dos arquivos finais.
- Use o script para manter a estrutura padronizada.
- Sempre execute a validação antes do commit.
- Sempre teste o botão de download.
- Sempre teste as imagens da amostra.
- Escolha páginas visualmente atrativas para a prévia.
- Evite cadastrar o mesmo material duas vezes.
- Não publique a branch antes de concluir todos os testes.
