/**
 * storage.js
 * Responsável por toda a comunicação com o localStorage.
 * Mantém a lógica de persistência separada da lógica de negócio (tarefas.js)
 * e da lógica de interface (main.js).
 */

const CHAVE_STORAGE = 'dashboard-tarefas:lista';

const Storage = {
  /**
   * Recupera a lista de tarefas salva no localStorage.
   * Retorna um array vazio caso não exista nada salvo ainda.
   */
  carregar() {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    if (!dados) return [];

    try {
      return JSON.parse(dados);
    } catch (erro) {
      console.error('Erro ao ler tarefas do localStorage:', erro);
      return [];
    }
  },

  /**
   * Salva a lista de tarefas no localStorage.
   * Retorna true em caso de sucesso, false se houver falha
   * (ex: modo de navegação anônima com storage bloqueado, ou cota excedida).
   */
  salvar(tarefas) {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(tarefas));
      return true;
    } catch (erro) {
      console.error('Erro ao salvar tarefas no localStorage:', erro);
      return false;
    }
  }
};
