let itens = [];

document.addEventListener('DOMContentLoaded', () => {
  const dadosSalvos = localStorage.getItem('minha_lista_compras');
  if (dadosSalvos) {
    itens = JSON.parse(dadosSalvos);
    renderizarLista();
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

// Gera o arquivo PDF e aciona a caixa de compartilhamento do celular
async function compartilharPDF() {
  if (itens.length === 0) {
    exibirToast("Adicione itens à lista primeiro!");
    return;
  }

  exibirToast("Gerando PDF...");

  const tbody = document.getElementById('pdf-tbody');
  tbody.innerHTML = '';

  itens.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
    tr.innerHTML = `
      <td style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: normal;">${item.nome}</td>
      <td style="border: 1px solid #ccc; padding: 8px; text-align: left; font-weight: normal;">${item.marca || '-'}</td>
      <td style="border: 1px solid #ccc; padding: 8px; text-align: center; font-weight: normal;">${item.qtd}</td>
      <td style="border: 1px solid #ccc; padding: 8px; text-align: center; font-weight: normal;">${item.medida}</td>
    `;
    tbody.appendChild(tr);
  });

  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString('pt-BR');
  document.getElementById('pdf-data').textContent = `Data: ${dataFormatada}`;

  const element = document.getElementById('pdf-template');
  element.style.display = 'block';

  const opt = {
    margin:       10,
    filename:     `Lista_de_Compras_${dataFormatada.replace(/\//g, '-')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
    element.style.display = 'none';

    const fileName = `Lista_de_Compras_${dataFormatada.replace(/\//g, '-')}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Lista de Compras',
        text: 'Segue em anexo a Lista de Compras em formato PDF.',
        files: [file]
      });
      exibirToast("PDF compartilhado!");
    } else {
      html2pdf().set(opt).from(element).save();
      exibirToast("PDF baixado na pasta Downloads!");
    }
  } catch (error) {
    element.style.display = 'none';
    console.error("Erro ao gerar/compartilhar PDF:", error);
    exibirToast("Erro ao processar o PDF.");
  }
}

function enviarWhatsAppTexto() {
  if (itens.length === 0) {
    exibirToast("Adicione itens à lista primeiro!");
    return;
  }

  let mensagem = "*LISTA DE COMPRAS*\n\n";
  itens.forEach((item, index) => {
    const marcaTexto = item.marca ? ` (${item.marca})` : '';
    mensagem += `${index + 1}. *${item.nome}*${marcaTexto} - ${item.qtd} ${item.medida}\n`;
  });

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}

function exibirToast(mensagem) {
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}