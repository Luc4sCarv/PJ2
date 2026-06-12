import { useEffect, useMemo, useState, type FormEvent } from 'react'

type Categoria = {
  id: number
  nome_categoria: string
}

type Livro = {
  id: number
  titulo: string
  categoria_id?: number | null
  categoria_nome?: string | null
  preco?: number | null
  autor?: string | null
}

type Emprestimo = {
  id: number
  data_emprestimo: string
  data_devolucao?: string | null
  livro_id: number
  livro_titulo: string
  aluno_id?: number | null
  aluno_nome?: string | null
}

type RequestStatus = {
  state: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

const API_BASE = '/api/v1/controle_biblioteca'

export function Biblioteca() {
  // Categorias State
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [livros, setLivros] = useState<Livro[]>([])
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [categoriaNomeForm, setCategoriaNomeForm] = useState('')
  const [categoriaStatus, setCategoriaStatus] = useState<RequestStatus>({ state: 'idle' })

  const [livroForm, setLivroForm] = useState({
    titulo: '',
    categoria_id: '',
    preco: '',
    autor: '',
  })
  const [livroStatus, setLivroStatus] = useState<RequestStatus>({ state: 'idle' })

  const [emprestimoForm, setEmprestimoForm] = useState({
    data_emprestimo: new Date().toISOString().split('T')[0],
    livro_id: '',
  })
  const [emprestimoStatus, setEmprestimoStatus] = useState<RequestStatus>({ state: 'idle' })

  const [deleteStatus, setDeleteStatus] = useState<RequestStatus>({ state: 'idle' })
  const [deletarLivroId, setDeletarLivroId] = useState('')
  const [deletarEmprestimoId, setDeletarEmprestimoId] = useState('')

  // Search and sorting
  const [searchLivros, setSearchLivros] = useState('')
  const [sortLivros, setSortLivros] = useState<'titulo' | 'preco'>('titulo')

  // Fetch functions
  const fetchCategorias = async () => {
    try {
      const response = await fetch(`${API_BASE}/categorias`)
      if (!response.ok) throw new Error(`Falha ao carregar categorias (${response.status})`)
      const data = (await response.json()) as Categoria[]
      setCategorias(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar categorias'
      setError(message)
    }
  }

  const fetchLivros = async () => {
    try {
      const response = await fetch(`${API_BASE}/livros`)
      if (!response.ok) throw new Error(`Falha ao carregar livros (${response.status})`)
      const data = (await response.json()) as Livro[]
      setLivros(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar livros'
      setError(message)
    }
  }

  const fetchEmprestimos = async () => {
    try {
      const response = await fetch(`${API_BASE}/emprestimos`)
      if (!response.ok) throw new Error(`Falha ao carregar empréstimos (${response.status})`)
      const data = (await response.json()) as Emprestimo[]
      setEmprestimos(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar empréstimos'
      setError(message)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchCategorias(), fetchLivros(), fetchEmprestimos()]).finally(() =>
      setLoading(false),
    )
  }, [])

  // Filtered livros
  const filteredLivros = useMemo(() => {
    let filtered = [...livros]
    
    if (searchLivros.trim()) {
      const term = searchLivros.toLowerCase()
      filtered = filtered.filter(
        (l) =>
          l.titulo.toLowerCase().includes(term) ||
          (l.autor?.toLowerCase().includes(term) ?? false) ||
          (l.categoria_nome?.toLowerCase().includes(term) ?? false),
      )
    }

    filtered.sort((a, b) => {
      if (sortLivros === 'titulo') {
        return a.titulo.localeCompare(b.titulo)
      }
      return (a.preco ?? 0) - (b.preco ?? 0)
    })

    return filtered
  }, [livros, searchLivros, sortLivros])

  // Handler functions
  const handleCreateCategoria = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCategoriaStatus({ state: 'idle' })

    if (!categoriaNomeForm.trim()) {
      setCategoriaStatus({ state: 'error', message: 'Nome da categoria é obrigatório.' })
      return
    }

    setCategoriaStatus({ state: 'loading' })
    try {
      const response = await fetch(`${API_BASE}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_categoria: categoriaNomeForm.trim() }),
      })

      if (!response.ok) throw new Error(`Falha ao criar categoria (${response.status})`)

      setCategoriaStatus({ state: 'success', message: 'Categoria criada com sucesso.' })
      setCategoriaNomeForm('')
      await fetchCategorias()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao criar categoria'
      setCategoriaStatus({ state: 'error', message })
    }
  }

  const handleCreateLivro = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLivroStatus({ state: 'idle' })

    if (!livroForm.titulo.trim()) {
      setLivroStatus({ state: 'error', message: 'Título do livro é obrigatório.' })
      return
    }

    setLivroStatus({ state: 'loading' })
    try {
      const categoriaId = livroForm.categoria_id.trim() ? Number(livroForm.categoria_id) : null
      const preco = livroForm.preco.trim() ? Number(livroForm.preco) : null

      if (livroForm.categoria_id.trim() && Number.isNaN(categoriaId)) {
        throw new Error('ID da categoria deve ser um número válido.')
      }
      if (livroForm.preco.trim() && Number.isNaN(preco)) {
        throw new Error('Preço deve ser um número válido.')
      }

      const response = await fetch(`${API_BASE}/livros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: livroForm.titulo.trim(),
          categoria_id: categoriaId,
          preco,
          autor: livroForm.autor.trim() || null,
        }),
      })

      if (!response.ok) throw new Error(`Falha ao criar livro (${response.status})`)

      setLivroStatus({ state: 'success', message: 'Livro criado com sucesso.' })
      setLivroForm({ titulo: '', categoria_id: '', preco: '', autor: '' })
      await fetchLivros()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao criar livro'
      setLivroStatus({ state: 'error', message })
    }
  }

  const handleCreateEmprestimo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setEmprestimoStatus({ state: 'idle' })

    const livroId = Number(emprestimoForm.livro_id)
    if (Number.isNaN(livroId) || livroId <= 0) {
      setEmprestimoStatus({ state: 'error', message: 'Selecione um livro válido.' })
      return
    }

    setEmprestimoStatus({ state: 'loading' })
    try {
      const response = await fetch(`${API_BASE}/emprestimos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_emprestimo: emprestimoForm.data_emprestimo,
          livro_id: livroId,
        }),
      })

      if (!response.ok) throw new Error(`Falha ao criar empréstimo (${response.status})`)

      setEmprestimoStatus({ state: 'success', message: 'Empréstimo registrado com sucesso.' })
      setEmprestimoForm({
        data_emprestimo: new Date().toISOString().split('T')[0],
        livro_id: '',
      })
      await fetchEmprestimos()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao criar empréstimo'
      setEmprestimoStatus({ state: 'error', message })
    }
  }

  const handleDeleteLivro = async () => {
    const livroId = Number(deletarLivroId)
    if (Number.isNaN(livroId) || livroId <= 0) {
      setDeleteStatus({ state: 'error', message: 'ID de livro inválido.' })
      return
    }

    setDeleteStatus({ state: 'loading' })
    try {
      const response = await fetch(`${API_BASE}/livros/${livroId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error(`Falha ao deletar livro (${response.status})`)

      setDeleteStatus({ state: 'success', message: 'Livro deletado com sucesso.' })
      setDeletarLivroId('')
      await fetchLivros()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao deletar livro'
      setDeleteStatus({ state: 'error', message })
    }
  }

  const handleDeleteEmprestimo = async () => {
    const emprestimoId = Number(deletarEmprestimoId)
    if (Number.isNaN(emprestimoId) || emprestimoId <= 0) {
      setDeleteStatus({ state: 'error', message: 'ID de empréstimo inválido.' })
      return
    }

    setDeleteStatus({ state: 'loading' })
    try {
      const response = await fetch(`${API_BASE}/emprestimos/${emprestimoId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error(`Falha ao deletar empréstimo (${response.status})`)

      setDeleteStatus({ state: 'success', message: 'Empréstimo deletado com sucesso.' })
      setDeletarEmprestimoId('')
      await fetchEmprestimos()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao deletar empréstimo'
      setDeleteStatus({ state: 'error', message })
    }
  }

  if (loading) {
    return <div className="loading">Carregando dados da biblioteca...</div>
  }

  return (
    <div className="biblioteca-container">
      {error && <div className="status status-error">Erro: {error}</div>}

      {/* Categorias Section */}
      <section className="biblioteca-section">
        <h2>📚 Categorias</h2>
        <div className="form-card">
          <h3>Criar categoria</h3>
          <form className="inline-form" onSubmit={handleCreateCategoria}>
            <label>
              Nome da categoria
              <input
                type="text"
                value={categoriaNomeForm}
                onChange={(e) => setCategoriaNomeForm(e.target.value)}
                placeholder="Ex: Ficção"
              />
            </label>
            <button
              type="submit"
              className="button"
              disabled={categoriaStatus.state === 'loading'}
            >
              {categoriaStatus.state === 'loading' ? 'Criando...' : 'Criar'}
            </button>
          </form>
          {categoriaStatus.message && (
            <div className={`status ${categoriaStatus.state === 'error' ? 'status-error' : ''}`}>
              {categoriaStatus.message}
            </div>
          )}
        </div>

        {categorias.length > 0 && (
          <div className="list-card">
            <h3>Categorias cadastradas ({categorias.length})</h3>
            <ul className="simple-list">
              {categorias.map((cat) => (
                <li key={cat.id}>
                  <strong>{cat.nome_categoria}</strong> (ID: {cat.id})
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Livros Section */}
      <section className="biblioteca-section">
        <h2>📖 Livros</h2>
        <div className="form-card">
          <h3>Adicionar livro</h3>
          <form onSubmit={handleCreateLivro} className="form-grid">
            <label>
              Título *
              <input
                type="text"
                value={livroForm.titulo}
                onChange={(e) => setLivroForm({ ...livroForm, titulo: e.target.value })}
                placeholder="Título do livro"
                required
              />
            </label>
            <label>
              Categoria
              <select
                value={livroForm.categoria_id}
                onChange={(e) => setLivroForm({ ...livroForm, categoria_id: e.target.value })}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome_categoria}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Autor
              <input
                type="text"
                value={livroForm.autor}
                onChange={(e) => setLivroForm({ ...livroForm, autor: e.target.value })}
                placeholder="Nome do autor"
              />
            </label>
            <label>
              Preço
              <input
                type="number"
                step="0.01"
                value={livroForm.preco}
                onChange={(e) => setLivroForm({ ...livroForm, preco: e.target.value })}
                placeholder="0.00"
              />
            </label>
            <button
              type="submit"
              className="button button-full"
              disabled={livroStatus.state === 'loading'}
            >
              {livroStatus.state === 'loading' ? 'Salvando...' : 'Cadastrar Livro'}
            </button>
          </form>
          {livroStatus.message && (
            <div className={`status ${livroStatus.state === 'error' ? 'status-error' : ''}`}>
              {livroStatus.message}
            </div>
          )}
        </div>

        {/* Busca e ordenação */}
        <div className="filter-card">
          <label>
            Buscar livros
            <input
              type="text"
              value={searchLivros}
              onChange={(e) => setSearchLivros(e.target.value)}
              placeholder="Título, autor ou categoria"
            />
          </label>
          <label>
            Ordenar por
            <select value={sortLivros} onChange={(e) => setSortLivros(e.target.value as any)}>
              <option value="titulo">Título</option>
              <option value="preco">Preço</option>
            </select>
          </label>
        </div>

        {/* Lista de livros */}
        {filteredLivros.length > 0 && (
          <div className="list-card">
            <h3>Livros cadastrados ({filteredLivros.length})</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                </tr>
              </thead>
              <tbody>
                {filteredLivros.map((livro) => (
                  <tr key={livro.id}>
                    <td>{livro.id}</td>
                    <td>{livro.titulo}</td>
                    <td>{livro.autor ?? '-'}</td>
                    <td>{livro.categoria_nome ?? '-'}</td>
                    <td>{livro.preco ? `R$ ${livro.preco.toFixed(2)}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Deletar livro */}
        <div className="form-card">
          <h3>Deletar livro</h3>
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleDeleteLivro()
            }}
          >
            <label>
              ID do livro
              <input
                type="number"
                min="1"
                value={deletarLivroId}
                onChange={(e) => setDeletarLivroId(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="button button-danger"
              disabled={deleteStatus.state === 'loading'}
            >
              {deleteStatus.state === 'loading' ? 'Deletando...' : 'Deletar'}
            </button>
          </form>
        </div>
      </section>

      {/* Empréstimos Section */}
      <section className="biblioteca-section">
        <h2>🤝 Empréstimos</h2>
        <div className="form-card">
          <h3>Registrar empréstimo</h3>
          <form onSubmit={handleCreateEmprestimo} className="form-grid">
            <label>
              Livro *
              <select
                value={emprestimoForm.livro_id}
                onChange={(e) => setEmprestimoForm({ ...emprestimoForm, livro_id: e.target.value })}
                required
              >
                <option value="">Selecione um livro</option>
                {livros.map((livro) => (
                  <option key={livro.id} value={livro.id}>
                    {livro.titulo}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Data do empréstimo *
              <input
                type="date"
                value={emprestimoForm.data_emprestimo}
                onChange={(e) =>
                  setEmprestimoForm({ ...emprestimoForm, data_emprestimo: e.target.value })
                }
                required
              />
            </label>
            <button
              type="submit"
              className="button button-full"
              disabled={emprestimoStatus.state === 'loading'}
            >
              {emprestimoStatus.state === 'loading' ? 'Registrando...' : 'Registrar'}
            </button>
          </form>
          {emprestimoStatus.message && (
            <div className={`status ${emprestimoStatus.state === 'error' ? 'status-error' : ''}`}>
              {emprestimoStatus.message}
            </div>
          )}
        </div>

        {/* Lista de empréstimos */}
        {emprestimos.length > 0 && (
          <div className="list-card">
            <h3>Empréstimos ({emprestimos.length})</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Livro</th>
                  <th>Data Empréstimo</th>
                  <th>Data Devolução</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {emprestimos.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.livro_titulo}</td>
                    <td>{new Date(emp.data_emprestimo).toLocaleDateString('pt-BR')}</td>
                    <td>
                      {emp.data_devolucao
                        ? new Date(emp.data_devolucao).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td className={emp.data_devolucao ? 'status-devolvido' : 'status-ativo'}>
                      {emp.data_devolucao ? '✓ Devolvido' : '📖 Ativo'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Deletar empréstimo */}
        <div className="form-card">
          <h3>Deletar empréstimo</h3>
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleDeleteEmprestimo()
            }}
          >
            <label>
              ID do empréstimo
              <input
                type="number"
                min="1"
                value={deletarEmprestimoId}
                onChange={(e) => setDeletarEmprestimoId(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="button button-danger"
              disabled={deleteStatus.state === 'loading'}
            >
              {deleteStatus.state === 'loading' ? 'Deletando...' : 'Deletar'}
            </button>
          </form>
          {deleteStatus.message && (
            <div className={`status ${deleteStatus.state === 'error' ? 'status-error' : ''}`}>
              {deleteStatus.message}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
