
"use strict";

// ============================================
// 1. SELEÇÃO DOS ELEMENTOS HTML
// ============================================

const formulario = document.getElementById("form-objeto");
const campoTipo = document.getElementById("tipo");
const campoNome = document.getElementById("nome");
const campoCategoria = document.getElementById("categoria");
const campoData = document.getElementById("data");
const campoLocal = document.getElementById("local");
const campoDescricao = document.getElementById("descricao");
const campoImagem = document.getElementById("imagem");

const campoPesquisa = document.getElementById("pesquisa");
const filtroTipo = document.getElementById("filtro-tipo");
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroStatus = document.getElementById("filtro-status");

const listaObjetos = document.getElementById("lista-objetos");
const mensagemFormulario = document.getElementById("mensagem-formulario");


// ============================================
// 2. CONFIGURAÇÕES E ARMAZENAMENTO
// ============================================

const CHAVE_STORAGE = "encontraAi_objetos_v1";

function carregarObjetos() {
  try {
    const dados = localStorage.getItem(CHAVE_STORAGE);

    if (!dados) {
      return [];
    }

    const registros = JSON.parse(dados);

    if (!Array.isArray(registros)) {
      return [];
    }

    // Verifica se os registros possuem os campos necessários.
    return registros.filter((objeto) =>
      objeto &&
      typeof objeto.id === "string" &&
      typeof objeto.nome === "string" &&
      typeof objeto.descricao === "string" &&
      typeof objeto.local === "string" &&
      typeof objeto.data === "string" &&
      typeof objeto.categoria === "string" &&
      ["perdido", "encontrado"].includes(objeto.tipo) &&
      ["ativo", "devolvido"].includes(objeto.status)
    );
  } catch (erro) {
    console.error("Erro ao carregar os registros:", erro);
    return [];
  }
}

let objetos = carregarObjetos();

function salvarObjetos() {
  try {
    localStorage.setItem(
      CHAVE_STORAGE,
      JSON.stringify(objetos)
    );

    return true;
  } catch (erro) {
    console.error("Erro ao salvar os registros:", erro);

    mostrarMensagem(
      "Não foi possível salvar os dados. Verifique o armazenamento do navegador.",
      "error"
    );

    return false;
  }
}


// ============================================
// 3. FUNÇÕES AUXILIARES
// ============================================

function obterDataLocal() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function dataValida(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const [ano, mes, dia] = data.split("-").map(Number);
  const dataTeste = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    dataTeste.getUTCFullYear() === ano &&
    dataTeste.getUTCMonth() === mes - 1 &&
    dataTeste.getUTCDate() === dia
  );
}

function formatarData(data) {
  if (!dataValida(data)) {
    return "Data não informada";
  }

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function mostrarMensagem(texto, tipo) {
  mensagemFormulario.textContent = texto;
  mensagemFormulario.className = `form-message ${tipo}`;
}

function criarId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nomeTipo(tipo) {
  return tipo === "perdido" ? "Perdido" : "Encontrado";
}

function emojiCategoria(categoria) {
  const emojis = {
    "Acessórios": "🎒",
    "Material escolar": "📚",
    "Eletrônicos": "📱",
    "Documentos": "🪪",
    "Roupas": "👕",
    "Chaves": "🔑",
    "Outros": "📦"
  };

  return emojis[categoria] || "📦";
}


// ============================================
// 4. CADASTRO DE OBJETOS
// ============================================

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const tipo = campoTipo.value;
  const nome = campoNome.value.trim();
  const categoria = campoCategoria.value;
  const data = campoData.value;
  const local = campoLocal.value.trim();
  const descricao = campoDescricao.value.trim();
  const imagem = campoImagem.value.trim();

  // Verifica os campos obrigatórios.
  if (!nome || !categoria || !data || !local || !descricao) {
    mostrarMensagem(
      "Preencha todos os campos obrigatórios.",
      "error"
    );
    return;
  }

  // Valida o tipo e a categoria.
  const categoriasPermitidas = [
    "Acessórios",
    "Material escolar",
    "Eletrônicos",
    "Documentos",
    "Roupas",
    "Chaves",
    "Outros"
  ];

  if (!["perdido", "encontrado"].includes(tipo)) {
    mostrarMensagem("Selecione um tipo válido.", "error");
    return;
  }

  if (!categoriasPermitidas.includes(categoria)) {
    mostrarMensagem("Selecione uma categoria válida.", "error");
    return;
  }

  // Valida o tamanho dos campos.
  if (
    nome.length > 70 ||
    local.length > 100 ||
    descricao.length > 500 ||
    imagem.length > 500
  ) {
    mostrarMensagem(
      "Um ou mais campos ultrapassaram o limite de caracteres.",
      "error"
    );
    return;
  }

  // Valida a data informada.
  if (!dataValida(data)) {
    mostrarMensagem("Informe uma data válida.", "error");
    return;
  }

  // Impede o cadastro com uma data futura.
  if (data > obterDataLocal()) {
    mostrarMensagem(
      "A data não pode ser futura.",
      "error"
    );
    return;
  }

  // Valida o endereço da imagem, quando informado.
  if (imagem) {
    try {
      const url = new URL(imagem);

      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Endereço de imagem inválido.");
      }
    } catch {
      mostrarMensagem(
        "Informe um link válido para a foto.",
        "error"
      );
      return;
    }
  }

  // Cria o objeto com os dados do formulário.
  const novoObjeto = {
    id: criarId(),
    tipo: tipo,
    nome: nome,
    categoria: categoria,
    data: data,
    local: local,
    descricao: descricao,
    imagem: imagem,
    status: "ativo",
    criadoEm: new Date().toISOString()
  };

  objetos.unshift(novoObjeto);

  // Se não conseguir salvar, desfaz o cadastro.
  if (!salvarObjetos()) {
    objetos.shift();
    return;
  }

  formulario.reset();

  campoData.max = obterDataLocal();
  campoData.value = obterDataLocal();

  mostrarMensagem(
    "Objeto cadastrado com sucesso!",
    "success"
  );

  atualizarSistema();

  document.getElementById("objetos").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});


// ============================================
// 5. PESQUISA E FILTROS
// ============================================

function filtrarObjetos() {
  const termo = campoPesquisa.value
    .trim()
    .toLocaleLowerCase("pt-BR");

  const tipoSelecionado = filtroTipo.value;
  const categoriaSelecionada = filtroCategoria.value;
  const statusSelecionado = filtroStatus.value;

  return objetos.filter(function (objeto) {
    const textoObjeto = [
      objeto.nome,
      objeto.descricao,
      objeto.local,
      objeto.categoria
    ]
      .join(" ")
      .toLocaleLowerCase("pt-BR");

    const correspondeTexto = textoObjeto.includes(termo);

    const correspondeTipo =
      tipoSelecionado === "todos" ||
      objeto.tipo === tipoSelecionado;

    const correspondeCategoria =
      categoriaSelecionada === "todas" ||
      objeto.categoria === categoriaSelecionada;

    const correspondeStatus =
      statusSelecionado === "todos" ||
      (
        statusSelecionado === "ativo" &&
        objeto.status === "ativo"
      ) ||
      (
        statusSelecionado === "devolvido" &&
        objeto.status === "devolvido"
      );

    return (
      correspondeTexto &&
      correspondeTipo &&
      correspondeCategoria &&
      correspondeStatus
    );
  });
}

campoPesquisa.addEventListener("input", renderizarObjetos);
filtroTipo.addEventListener("change", renderizarObjetos);
filtroCategoria.addEventListener("change", renderizarObjetos);
filtroStatus.addEventListener("change", renderizarObjetos);

document
  .getElementById("limpar-filtros")
  .addEventListener("click", function () {
    campoPesquisa.value = "";
    filtroTipo.value = "todos";
    filtroCategoria.value = "todas";
    filtroStatus.value = "todos";

    renderizarObjetos();
  });


// ============================================
// 6. CRIAÇÃO DOS ELEMENTOS HTML
// ============================================

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) {
    elemento.className = classe;
  }

  if (texto !== undefined) {
    elemento.textContent = texto;
  }

  return elemento;
}

function criarBotao(texto, classe, acao) {
  const botao = criarElemento(
    "button",
    `action-button ${classe}`,
    texto
  );

  botao.type = "button";
  botao.addEventListener("click", acao);

  return botao;
}


// ============================================
// 7. CRIAÇÃO DOS CARTÕES DOS OBJETOS
// ============================================

function criarCartao(objeto) {
  const cartao = criarElemento("article", "object-card");

  const areaImagem = criarElemento("div", "object-image");
  areaImagem.setAttribute("aria-label", "Imagem do objeto");

  if (objeto.imagem) {
    const img = document.createElement("img");

    img.src = objeto.imagem;
    img.alt = objeto.nome;
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";

    img.addEventListener("error", function () {
      areaImagem.replaceChildren();
      areaImagem.textContent = emojiCategoria(objeto.categoria);
    });

    areaImagem.appendChild(img);
  } else {
    areaImagem.textContent = emojiCategoria(objeto.categoria);
  }

  const conteudo = criarElemento("div", "object-content");
  const badges = criarElemento("div", "badges");

  const badgeTipo = criarElemento(
    "span",
    `badge ${objeto.tipo === "encontrado" ? "found" : "lost"}`,
    nomeTipo(objeto.tipo)
  );

  const badgeCategoria = criarElemento(
    "span",
    "badge",
    objeto.categoria
  );

  const badgeStatus = criarElemento(
    "span",
    `badge ${objeto.status === "devolvido" ? "returned" : ""}`,
    objeto.status === "devolvido" ? "Devolvido" : "Ativo"
  );

  badges.append(
    badgeTipo,
    badgeCategoria,
    badgeStatus
  );

  const titulo = criarElemento("h3", "", objeto.nome);

  const descricao = criarElemento(
    "p",
    "object-description",
    objeto.descricao
  );

  const metadados = criarElemento("div", "object-meta");

  metadados.append(
    criarElemento("span", "", `📍 ${objeto.local}`),
    criarElemento("span", "", `📅 ${formatarData(objeto.data)}`)
  );

  const acoes = criarElemento("div", "object-actions");

  if (objeto.status === "ativo") {
    acoes.appendChild(
      criarBotao(
        "Marcar como devolvido",
        "complete",
        function () {
          atualizarStatus(objeto.id);
        }
      )
    );
  }

  acoes.appendChild(
    criarBotao("Excluir", "delete", function () {
      excluirObjeto(objeto.id);
    })
  );

  conteudo.append(
    badges,
    titulo,
    descricao,
    metadados,
    acoes
  );

  cartao.append(areaImagem, conteudo);

  return cartao;
}


// ============================================
// 8. EXIBIÇÃO E LISTAGEM DOS OBJETOS
// ============================================

function renderizarObjetos() {
  const resultados = filtrarObjetos();

  listaObjetos.replaceChildren();

  document.getElementById("quantidade-resultados").textContent =
    `${resultados.length} ${
      resultados.length === 1 ? "objeto" : "objetos"
    }`;

  if (resultados.length === 0) {
    const vazio = criarElemento("div", "empty-state");

    vazio.append(
      criarElemento("div", "empty-icon", "🔎"),
      criarElemento("h3", "", "Nenhum objeto encontrado"),
      criarElemento(
        "p",
        "",
        objetos.length === 0
          ? "Cadastre o primeiro objeto para começar."
          : "Tente alterar a pesquisa ou os filtros."
      )
    );

    listaObjetos.appendChild(vazio);
    return;
  }

  // Percorre os registros e exibe cada objeto.
  for (const objeto of resultados) {
    listaObjetos.appendChild(criarCartao(objeto));
  }
}


// ============================================
// 9. ATUALIZAÇÃO DO STATUS
// ============================================

function atualizarStatus(id) {
  const indice = objetos.findIndex(
    (objeto) => objeto.id === id
  );

  if (indice === -1) {
    mostrarMensagem("Objeto não encontrado.", "error");
    return;
  }

  if (objetos[indice].status === "devolvido") {
    return;
  }

  const statusAnterior = objetos[indice].status;

  objetos[indice].status = "devolvido";

  if (!salvarObjetos()) {
    objetos[indice].status = statusAnterior;
    return;
  }

  atualizarSistema();
}


// ============================================
// 10. EXCLUSÃO DE REGISTROS
// ============================================

function excluirObjeto(id) {
  const objeto = objetos.find(
    (item) => item.id === id
  );

  if (!objeto) {
    mostrarMensagem("Objeto não encontrado.", "error");
    return;
  }

  const confirmar = window.confirm(
    `Deseja excluir o registro "${objeto.nome}"?`
  );

  if (!confirmar) {
    return;
  }

  const objetosAnteriores = objetos;

  objetos = objetos.filter(
    (item) => item.id !== id
  );

  if (!salvarObjetos()) {
    objetos = objetosAnteriores;
    return;
  }

  atualizarSistema();
}


// ============================================
// 11. ATUALIZAÇÃO DOS CONTADORES
// ============================================

function atualizarContadores() {
  document.getElementById("total-registros").textContent =
    objetos.length;

  document.getElementById("total-perdidos").textContent =
    objetos.filter(
      (objeto) =>
        objeto.tipo === "perdido" &&
        objeto.status === "ativo"
    ).length;

  document.getElementById("total-encontrados").textContent =
    objetos.filter(
      (objeto) =>
        objeto.tipo === "encontrado" &&
        objeto.status === "ativo"
    ).length;
}

function atualizarSistema() {
  atualizarContadores();
  renderizarObjetos();
}


// ============================================
// 12. INICIALIZAÇÃO DO SISTEMA
// ============================================

campoData.max = obterDataLocal();
campoData.value = obterDataLocal();

atualizarSistema();
