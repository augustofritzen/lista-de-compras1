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

// Adiciona um novo item à lista ao clicar no botão '+' ou apertar Enter
function adicionarItem(event) {
  if (event) event.preventDefault();

  const nome = nomeInput.value.trim().toUpperCase();
  const marca = marcaInput.value.trim().toUpperCase();
  const qtd = parseFloat(qtdInput.value);
  const medida = medidaSelect.value;

  // Validação dos campos obrigatórios
  if (!nome || isNaN(qtd) || qtd <= 0) {
    exibirToast('Preencha a descrição e uma quantidade válida!');
    return;
  }

  // Salva a unidade escolhida como preferência
  ultimaUnidade = medida;
  localStorage.setItem('ultimaUnidade', ultimaUnidade);

  // Adiciona o novo item no início da lista
  lista.unshift({
    id: Date.now(),
    nome,
    marca,
    qtd,
    medida
  });

  salvarLista();
  renderizarLista();

  // Limpa os campos para o próximo item
  nomeInput.value = '';
  marcaInput.value = '';
  qtdInput.value = '';

  // Restaura a última unidade selecionada
  medidaSelect.value = ultimaUnidade;

  // Devolve o foco para o campo de descrição
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
    const marcaTexto = item.marca ? ` (${item.marca})` : '';

    li.innerHTML = `
      <span><b>${item.nome}</b> - ${item.qtd} ${item.medida}${marcaTexto}</span>
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

// Retorna um emoji seguro para URL baseado em palavras-chave no nome do item
function obterEmojiItem(nome) {
  const itemUpper = nome.toUpperCase();

  if (itemUpper.includes('BOI') || itemUpper.includes('COXÃO') || itemUpper.includes('ALCATRA') || itemUpper.includes('PICANHA') || itemUpper.includes('CARNE') || itemUpper.includes('COSTELA') || itemUpper.includes('CONTRA')) return '\u{1F402}'; // 🐂
  if (itemUpper.includes('FRANGO') || itemUpper.includes('COXINHA') || itemUpper.includes('PEITO') || itemUpper.includes('ASA') || itemUpper.includes('SASSAMI')) return '\u{1F414}'; // 🐔
  if (itemUpper.includes('PORCO') || itemUpper.includes('LINGUIÇA') || itemUpper.includes('BACON') || itemUpper.includes('BISTECA') || itemUpper.includes('LOMBO') || itemUpper.includes('CALABRESA')) return '\u{1F416}'; // 🐖
  if (itemUpper.includes('PEIXE') || itemUpper.includes('TILAPIA') || itemUpper.includes('TILÁPIA') || itemUpper.includes('CAMARÃO')) return '\u{1F41F}'; // 🐟
  if (itemUpper.includes('CERVEJA') || itemUpper.includes('CHOPP') || itemUpper.includes('LATA') || itemUpper.includes('GARRAFA') || itemUpper.includes('HEINEKEN') || itemUpper.includes('AMSTEL') || itemUpper.includes('BRAHMA')) return '\u{1F37A}'; // 🍺
  if (itemUpper.includes('COCA') || itemUpper.includes('GUARANÁ') || itemUpper.includes('REFRIGERANTE') || itemUpper.includes('SUCO') || itemUpper.includes('AGUA') || itemUpper.includes('ÁGUA') || itemUpper.includes('TONICA') || itemUpper.includes('TÔNICA')) return '\u{1F964}'; // 🥤
  if (itemUpper.includes('QUEIJO') || itemUpper.includes('MUSSARELA') || itemUpper.includes('PARMESÃO') || itemUpper.includes('PROVOLONE') || itemUpper.includes('CATUPIRY')) return '\u{1F9C0}'; // 🧀
  if (itemUpper.includes('PÃO') || itemUpper.includes('TORRADA') || itemUpper.includes('BAGUETE')) return '\u{1F35E}'; // 🍞
  if (itemUpper.includes('TOMATE') || itemUpper.includes('ALFACE') || itemUpper.includes('CEBOLA') || itemUpper.includes('BATATA') || itemUpper.includes('ALHO') || itemUpper.includes('CHEIRO') || itemUpper.includes('VERDURA')) return '\u{1F96C}'; // 🥬
  if (itemUpper.includes('ARROZ') || itemUpper.includes('FEIJÃO') || itemUpper.includes('FARINHA') || itemUpper.includes('OLEO') || itemUpper.includes('ÓLEO') || itemUpper.includes('AZEITE') || itemUpper.includes('SAL')) return '\u{1F4E6}'; // 📦
  if (itemUpper.includes('DETERGENTE') || itemUpper.includes('SABÃO') || itemUpper.includes('PAPEL') || itemUpper.includes('GUARDANAPO') || itemUpper.includes('LIMPEZA') || itemUpper.includes('ÁLCOOL') || itemUpper.includes('ALCOOL')) return '\u{1F9F9}'; // 🧹

  return '\u{1F539}'; // 🔹 Emoji padrão
}

// Formata e envia a lista apenas com a data no WhatsApp
function enviarWhatsAppTexto() {
  if (lista.length === 0) {
    exibirToast('Adicione itens antes de enviar!');
    return;
  }

  // Obtenção apenas da data atual
  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString('pt-BR');

  let texto = "*LISTA DE COMPRAS - CHOPERIA 737*\n";
  texto += `📅 *Data:* ${dataFormatada}\n`;
  texto += "-----------------------------------\n\n";

  lista.forEach(item => {
    const emoji = obterEmojiItem(item.nome);
    const marcaTexto = item.marca ? ` *(${item.marca})*` : '';

    texto += `${emoji} *${item.nome}* - ${item.qtd} ${item.medida}${marcaTexto}\n`;
  });

  localStorage.setItem('ultimaListaBackup', JSON.stringify(lista));

  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.location.href = url;
}

// Troca dinâmica da imagem de fundo
function alterarFundo(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const container = document.querySelector('.container');
      if (container) {
        container.style.backgroundImage = `url('${e.target.result}')`;
      }
      localStorage.setItem('imagemFundoCustom', e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

// Restaura a imagem de fundo salva no carregamento
const fundoSalvo = localStorage.getItem('imagemFundoCustom');
if (fundoSalvo) {
  const container = document.querySelector('.container');
  if (container) {
    container.style.backgroundImage = `url('${fundoSalvo}')`;
  }
}

// Exibe notificações rápidas estilo Toast na parte inferior
function exibirToast(mensagem) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.innerText = mensagem;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}
