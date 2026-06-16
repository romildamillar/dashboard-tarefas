/**
 * tarefas.js
 * Contém toda a lógica de negócio do CRUD de tarefas.
 * Não manipula o DOM diretamente — isso é responsabilidade do main.js.
 */

let listaTarefas = Storage.carregar();

/**
 * Gera um ID único simples baseado em timestamp + número aleatório.
 */
function gerarId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * CREATE — adiciona uma nova tarefa à lista.
 * Retorna null se o título for inválido (vazio ou só espaços).
 */
function adicionarTarefa(titulo, prioridade) {
  const tituloLimpo = titulo.trim();
  if (!tituloLimpo) return null;

  const novaTarefa = {
    id: gerarId(),
    titulo: tituloLimpo,
    prioridade,
    concluida: false,
    criadaEm: new Date().toISOString()
  };

  listaTarefas.push(novaTarefa);
  Storage.salvar(listaTarefas);
  return novaTarefa;
}

/**
 * READ — retorna as tarefas filtradas conforme o filtro ativo.
 */
function obterTarefas(filtro = 'todas') {
  if (filtro === 'pendentes') {
    return listaTarefas.filter(t => !t.concluida);
  }
  if (filtro === 'concluidas') {
    return listaTarefas.filter(t => t.concluida);
  }
  return listaTarefas;
}

/**
 * UPDATE — alterna o status concluída/pendente de uma tarefa.
 */
function alternarConclusao(id) {
  const tarefa = listaTarefas.find(t => t.id === id);
  if (!tarefa) return null;

  tarefa.concluida = !tarefa.concluida;
  Storage.salvar(listaTarefas);
  return tarefa;
}

/**
 * UPDATE — edita o título de uma tarefa existente.
 */
function editarTarefa(id, novoTitulo) {
  const tarefa = listaTarefas.find(t => t.id === id);
  if (!tarefa) return null;

  tarefa.titulo = novoTitulo.trim();
  Storage.salvar(listaTarefas);
  return tarefa;
}

/**
 * DELETE — remove uma tarefa da lista pelo ID.
 */
function excluirTarefa(id) {
  listaTarefas = listaTarefas.filter(t => t.id !== id);
  Storage.salvar(listaTarefas);
}

/**
 * Retorna estatísticas simples para o painel de resumo.
 */
function obterEstatisticas() {
  const total = listaTarefas.length;
  const concluidas = listaTarefas.filter(t => t.concluida).length;
  const pendentes = total - concluidas;

  return { total, concluidas, pendentes };
}
