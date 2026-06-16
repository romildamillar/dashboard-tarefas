/**
 * main.js
 * Responsável pela interface: renderização, eventos e interação com o usuário.
 * Usa as funções de tarefas.js (lógica) e storage.js (persistência) já carregados.
 */

// Referências do DOM
const formTarefa = document.getElementById('form-tarefa');
const inputTitulo = document.getElementById('input-titulo');
const selectPrioridade = document.getElementById('select-prioridade');
const listaTarefasEl = document.getElementById('lista-tarefas');
const mensagemVazia = document.getElementById('mensagem-vazia');
const botoesFiltro = document.querySelectorAll('.filtro-btn');
const toastContainer = document.getElementById('toast-container');

const totalTarefasEl = document.getElementById('total-tarefas');
const totalPendentesEl = document.getElementById('total-pendentes');
const totalConcluidasEl = document.getElementById('total-concluidas');

let filtroAtual = 'todas';

/**
 * Renderiza a lista de tarefas na tela conforme o filtro ativo.
 */
function renderizarTarefas() {
  const tarefas = obterTarefas(filtroAtual);
  listaTarefasEl.innerHTML = '';

  mensagemVazia.style.display = tarefas.length === 0 ? 'block' : 'none';

  tarefas.forEach(tarefa => {
    const li = document.createElement('li');
    li.className = `tarefa ${tarefa.concluida ? 'concluida' : ''}`;
    li.dataset.prioridade = tarefa.prioridade;
    li.dataset.id = tarefa.id;

    li.innerHTML = `
      <input type="checkbox" class="tarefa-checkbox" ${tarefa.concluida ? 'checked' : ''} aria-label="Marcar tarefa como concluída">
      <div class="tarefa-conteudo">
        <p class="tarefa-titulo" data-id="${tarefa.id}">${escaparHtml(tarefa.titulo)}</p>
        <span class="tarefa-meta">Prioridade: ${tarefa.prioridade}</span>
      </div>
      <div class="tarefa-acoes">
        <button class="btn-icone btn-editar" title="Editar" aria-label="Editar tarefa">✏️</button>
        <button class="btn-icone btn-excluir" title="Excluir" aria-label="Excluir tarefa">🗑️</button>
      </div>
    `;

    listaTarefasEl.appendChild(li);
  });

  atualizarEstatisticas();
}

/**
 * Atualiza os números do painel de estatísticas.
 */
function atualizarEstatisticas() {
  const { total, pendentes, concluidas } = obterEstatisticas();
  totalTarefasEl.textContent = total;
  totalPendentesEl.textContent = pendentes;
  totalConcluidasEl.textContent = concluidas;
}

/**
 * Evita injeção de HTML ao exibir o título digitado pelo usuário.
 */
function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/**
 * Exibe uma notificação toast temporária.
 */
function mostrarToast(mensagem, tipo = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;
  toastContainer.appendChild(toast);

  setTimeout(() => toast.remove(), 2500);
}

// Envio do formulário — CREATE
formTarefa.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const titulo = inputTitulo.value;
  const novaTarefa = adicionarTarefa(titulo, selectPrioridade.value);

  if (!novaTarefa) {
    mostrarToast('Digite um título válido para a tarefa', 'perigo');
    return;
  }

  inputTitulo.value = '';
  inputTitulo.focus();

  renderizarTarefas();
  mostrarToast('Tarefa adicionada!', 'sucesso');
});

// Clique na lista — UPDATE (concluir) / UPDATE (editar) / DELETE
listaTarefasEl.addEventListener('click', (evento) => {
  const itemTarefa = evento.target.closest('.tarefa');
  if (!itemTarefa) return;

  const id = itemTarefa.dataset.id;

  if (evento.target.classList.contains('tarefa-checkbox')) {
    alternarConclusao(id);
    renderizarTarefas();
    return;
  }

  if (evento.target.classList.contains('btn-excluir')) {
    excluirTarefa(id);
    renderizarTarefas();
    mostrarToast('Tarefa excluída', 'perigo');
    return;
  }

  if (evento.target.classList.contains('btn-editar')) {
    const elementoTitulo = itemTarefa.querySelector('.tarefa-titulo');
    ativarEdicaoInline(elementoTitulo, id);
  }
});

/**
 * Transforma o título da tarefa em um campo editável diretamente na lista,
 * em vez de usar window.prompt() (que é bloqueante e pouco profissional em produção).
 */
function ativarEdicaoInline(elementoTitulo, id) {
  const tituloAtual = elementoTitulo.textContent;

  elementoTitulo.contentEditable = 'true';
  elementoTitulo.focus();

  // Seleciona todo o texto para facilitar a edição
  const range = document.createRange();
  range.selectNodeContents(elementoTitulo);
  const selecao = window.getSelection();
  selecao.removeAllRanges();
  selecao.addRange(range);

  function salvarEdicao() {
    elementoTitulo.contentEditable = 'false';
    const novoTitulo = elementoTitulo.textContent.trim();

    if (!novoTitulo) {
      elementoTitulo.textContent = tituloAtual;
      mostrarToast('O título não pode ficar vazio', 'perigo');
      return;
    }

    if (novoTitulo !== tituloAtual) {
      editarTarefa(id, novoTitulo);
      mostrarToast('Tarefa atualizada!', 'sucesso');
    }
  }

  elementoTitulo.addEventListener('blur', salvarEdicao, { once: true });
  elementoTitulo.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      elementoTitulo.blur();
    }
    if (evento.key === 'Escape') {
      elementoTitulo.textContent = tituloAtual;
      elementoTitulo.blur();
    }
  });
}

// Filtros — READ com filtro
botoesFiltro.forEach(botao => {
  botao.addEventListener('click', () => {
    botoesFiltro.forEach(b => {
      b.classList.remove('ativo');
      b.setAttribute('aria-pressed', 'false');
    });
    botao.classList.add('ativo');
    botao.setAttribute('aria-pressed', 'true');

    filtroAtual = botao.dataset.filtro;
    renderizarTarefas();
  });
});

// Renderização inicial ao carregar a página
renderizarTarefas();
