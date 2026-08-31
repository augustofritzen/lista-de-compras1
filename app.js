let itens = [];

document.addEventListener('DOMContentLoaded', () => {
  // Carrega lista salva
  const dadosSalvos = localStorage.getItem('minha_lista_compras');
  if (dadosSalvos) {
    itens = JSON.parse(dadosSalvos);
    renderizarLista();
  }

  // Carrega fundo personalizado
  const fundoSalvo = localStorage.getItem('fundo_personalizado');
  if (fundoSalvo) {
    aplicarImagemFundo(fundoSalvo);
  }
});

function salvarStorage() {
  localStorage.setItem('minha_lista_compras', JSON.stringify(itens));
}

function adicionarItem(event) {
  event.preventDefault();

  const inputNome = document.getElementById('nome-item');
  const inputMarca = document.getElementById('marca-item');
  const inputQtd = document.getElementById('qtd-item');
  const selectMedida = document.getElementById('medida-item');

  const nome = inputNome.value.trim().toUpperCase();
  const marca = inputMarca.value.trim().toUpperCase();
  const qtd = parseFloat(inputQtd.value);
  const medida = selectMedida.value;

  if (!nome || isNaN(qtd) || qtd <= 0) {
    exibirToast("Preencha a descrição e uma quantidade válida!");
    return;
  }

  itens.push({ id: Date.now(), nome, marca, qtd, medida });
  salvarStorage();
  renderizarLista();

  inputNome.value = '';
  inputMarca.value = '';
  inputQtd.value = '';
  inputNome.focus();

  exibirToast("Item adicionado!");
}

function removerItem(id) {
  itens = itens.filter(item => item.id !== id);
  salvarStorage();
  renderizarLista();
  exibirToast("Item removido!");
}

function limparLista() {
  if (itens.length === 0) return;
  
  if (confirm("Deseja realmente apagar toda a lista?")) {
    itens = [];
    salvarStorage();
    renderizarLista();
    exibirToast("Lista limpa!");
  }
}

function renderizarLista() {
  const ul = document.getElementById('lista-itens');
  ul.innerHTML = '';

  if (itens.length === 0) {
    ul.innerHTML = '<li style="justify-content: center; color: #888;">SUA LISTA ESTÁ VAZIA</li>';
    return;
  }

  itens.forEach(item => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.className = 'item-info';
    
    const textoMarca = item.marca ? ` (${item.marca})` : '';
    span.textContent = `${item.nome}${textoMarca} - ${item.qtd} ${item.medida}`;

    const btnRemover = document.createElement('button');
    btnRemover.className = 'btn-remover';
    btnRemover.textContent = '✕';
    btnRemover.onclick = () => removerItem(item.id);

    li.appendChild(span);
    li.appendChild(btnRemover);
    ul.appendChild(li);
  });
}

// Envia a lista como texto formatado diretamente para o WhatsApp com data e hora
function enviarWhatsAppTexto() {
  if (itens.length === 0) {
    exibirToast("Adicione itens à lista primeiro!");
    return;
  }

  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString('pt-BR');
  const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  let mensagem = `*LISTA DE COMPRAS*\n📅 _Gerada em: ${dataFormatada} às ${horaFormatada}_\n\n`;
  itens.forEach((item, index) => {
    const marcaTexto = item.marca ? ` (${item.marca})` : '';
    mensagem += `${index + 1}. *${item.nome}*${marcaTexto} - ${item.qtd} ${item.medida}\n`;
  });

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}

// Processa a imagem escolhida na galeria do celular
function alterarFundo(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 3 * 1024 * 1024) {
    exibirToast("Escolha uma imagem menor que 3MB!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const imagemBase64 = e.target.result;
    localStorage.setItem('fundo_personalizado', imagemBase64);
    aplicarImagemFundo(imagemBase64);
    exibirToast("Fundo alterado com sucesso!");
  };

  reader.readAsDataURL(file);
}

// Aplica o background no container
function aplicarImagemFundo(urlImagem) {
  const container = document.querySelector('.container');
  if (container) {
    container.style.backgroundImage = `url('${urlImagem}')`;
  }
}

function exibirToast(mensagem) {
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
