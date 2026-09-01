// Recupera a lista atual do localStorage ou inicia vazia
let lista = JSON.parse(localStorage.getItem('listaCompras')) || [];

// Recupera a última unidade utilizada (padrão: 'UN')
let ultimaUnidade = localStorage.getItem('ultimaUnidade') || 'UN';

// Elementos do DOM
const nomeInput = document.getElementById('nome-item');
const marcaInput = document.getElementById('marca-item');
const qtdInput = document.getElementById('qtd-item');
const medidaSelect = document.getElementById('medida-item');
const listaUl = document.getElementById('lista-itens');

// Carrega os dados salvos na inicialização
window.addEventListener('DOMContentLoaded', () => {
  medidaSelect.value = ultimaUnidade;
  renderizarLista();
});

// Atualiza a última unidade no localStorage sempre que o usuário alterar o select
medidaSelect.addEventListener('change', () => {
  ultimaUnidade = medidaSelect.value;
  localStorage.setItem('ultimaUnidade', ultimaUnidade);
});

// Tenta adicionar o item automaticamente quando os campos são alterados
function verificarEAdicionarAuto() {
  const nome = nomeInput.value.trim();
  const qtd = parseFloat(qtdInput.value);

  // Se os campos obrigatórios estiverem válidos, adiciona automaticamente
  if (nome !== '' && !isNaN(qtd) && qtd > 0) {
    executarAdicaoItem();
  }
}

// Ouvintes nos campos para acionar a adição automática
nomeInput.addEventListener('input', verificarEAdicionarAuto);
qtdInput.addEventListener('input', verificarEAdicionarAuto);

// Submissão manual pelo formulário (caso aperte Enter ou clique no +)
function adicionarItem(event) {
  if (event) event.preventDefault();
  
  const nome = nomeInput.value.trim();
  const qtd = parseFloat(qtdInput.value);

  if (!nome || isNaN(qtd) || qtd <= 0) {
    exibirToast('Preencha a descrição e a quantidade!');
    return;
  }

  executarAdicaoItem();
}

// Lógica de inserção do item e limpeza dos campos
function executarAdicaoItem() {
  const nome = nomeInput.value.trim().toUpperCase();
  const marca = marcaInput.value.trim().toUpperCase();
  const qtd = parseFloat(qtdInput.value);
  const medida = medidaSelect.value;

  // Salva a unidade escolhida como preferência
  ultimaUnidade = medida;
  localStorage.setItem('ultimaUnidade', ultimaUnidade);

  // Adiciona o novo item ao topo da lista
  lista.unshift({
    id: Date.now(),
    nome,
    marca,
    qtd,
    medida
  });

  salvarLista();
  renderizarLista();

  // Limpa apenas o nome, marca e quantidade para nova digitação
  nomeInput.value = '';
  marcaInput.value = '';
  qtdInput.value = '';
  
  // Mantém a última unidade selecionada
  medidaSelect.value = ultimaUnidade;

  // Retorna o foco para o campo de descrição
  nomeInput.focus();
}

// Salva a lista no localStorage
function salvarLista() {
  localStorage.setItem('listaCompras', JSON.stringify(lista));
}

// Desenha os itens na tela
function renderizarLista() {
  listaUl.innerHTML = '';

  if (lista.length === 0) {
    listaUl.innerHTML = '<li style="justify-content: center; color: #777;">Sua lista está vazia.</li>';
    return;
  }

  lista.forEach(item => {
    const li = document.createElement('li');
    const marcaTexto = item.marca ? ` ${item.marca}` : '';

    li.innerHTML = `
      <span>${item.nome} ${item.qtd} ${item.medida}${marcaTexto}</span>
      <button type="button" class="btn-remover" onclick="removerItem(${item.id})">✕</button>
    `;
    
    listaUl.appendChild(li);
  });
}

// Remove um item individual da lista
function removerItem(id) {
  lista = lista.filter(item => item.id !== id);
  salvarLista();
  renderizarLista();
}

// Limpa toda a lista atual e salva backup para restauração
function limparLista() {
  if (lista.length === 0) {
    exibirToast('A lista já está vazia!');
    return;
  }

  // Grava o backup da lista antes de apagar
  localStorage.setItem('ultimaListaBackup', JSON.stringify(lista));
  lista = [];
  salvarLista();
  renderizarLista();
  exibirToast('Lista limpa com sucesso!');
}

// Restaura a última lista que foi salva antes da limpeza
function restaurarUltimaLista() {
  const backup = localStorage.getItem('ultimaListaBackup');
  
  if (!backup) {
    exibirToast('Nenhuma lista para restaurar!');
    return;
  }

  lista = JSON.parse(backup);
  salvarLista();
  renderizarLista();
  exibirToast('Última lista restaurada!');
}

// Formata e envia a lista formatada no WhatsApp em estilo tabela/planilha
function enviarWhatsAppTexto() {
  if (lista.length === 0) {
    exibirToast('Adicione itens antes de enviar!');
    return;
  }

  let texto = "*LISTA DE COMPRAS - CHOPERIA 737*\n\n";
  texto += "```\n"; // Inicia o bloco monoespaçado do WhatsApp

  // Cabeçalho da Planilha
  const cItem = "ITEM".padEnd(16, ' ');
  const cQtd = "QTD".padEnd(6, ' ');
  const cUn = "UN".padEnd(6, ' ');
  const cMarca = "MARCA";
  
  texto += `${cItem} | ${cQtd} | ${cUn} | ${cMarca}\n`;
  texto += "-----------------------------------------\n";

  // Linhas dos Itens
  lista.forEach(item => {
    const nomeTruncado = item.nome.length > 16 ? item.nome.substring(0, 13) + "..." : item.nome;
    const itemStr = nomeTruncado.padEnd(16, ' ');
    const qtdStr = String(item.qtd).padEnd(6, ' ');
    const unStr = item.medida.padEnd(6, ' ');
    const marcaStr = item.marca || "-";

    texto += `${itemStr} | ${qtdStr} | ${unStr} | ${marcaStr}\n`;
  });

  texto += "
