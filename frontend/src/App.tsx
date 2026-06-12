import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'
import { Biblioteca } from './Biblioteca'

type Aluno = {
  id: number
  matricula: string
  nome_aluno: string
  email?: string | null
  nome_mae?: string | null
  endereco_id?: number | null
}

type Disciplina = {
  id: number
  nome_disciplina: string
  carga: number
  semestre: number
}

type Nota = {
  id: number
  aluno_id: number
  aluno_nome: string
  disciplina_id: number
  disciplina_nome: string
  nota?: number | null
}

type RequestStatus = {
  state: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

const API_BASE = '/api/v1/controle_aluno'

const endpoints = [
  {
    method: 'GET',
    path: `${API_BASE}/consultar-alunos`,
    description: 'Listagem completa de alunos',
  },
  {
    method: 'GET',
    path: `${API_BASE}/consultar-alunos/{id}`,
    description: 'Consulta de aluno por ID',
  },
  {
    method: 'POST',
    path: `${API_BASE}/criar-aluno`,
    description: 'Criação de novos alunos',
  },
  {
    method: 'DELETE',
    path: `${API_BASE}/deletar-aluno/{id}`,
    description: 'Exclusão de aluno por ID',
  },
  {
    method: 'GET',
    path: `${API_BASE}/consultar-notas`,
    description: 'Listagem de notas por aluno',
  },
  {
    method: 'POST',
    path: `${API_BASE}/criar-nota`,
    description: 'Criação de nota por aluno e disciplina',
  },
  {
    method: 'DELETE',
    path: `${API_BASE}/deletar-nota/{id}`,
    description: 'Exclusão de nota por ID',
  },
  {
    method: 'GET',
    path: `${API_BASE}/consultar-disciplinas`,
    description: 'Listagem de disciplinas disponíveis',
  },
]

function App() {
  const [activeTab, setActiveTab] = useState<'alunos' | 'biblioteca'>('alunos')
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [notasError, setNotasError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'nome_aluno' | 'matricula' | 'id'>('nome_aluno')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [createForm, setCreateForm] = useState({
    matricula: '',
    nome_aluno: '',
    email: '',
    nome_mae: '',
    endereco_id: '',
  })
  const [createStatus, setCreateStatus] = useState<RequestStatus>({
    state: 'idle',
  })

  const [lookupId, setLookupId] = useState('')
  const [lookupResult, setLookupResult] = useState<Aluno | null>(null)
  const [lookupStatus, setLookupStatus] = useState<RequestStatus>({
    state: 'idle',
  })

  const [deleteId, setDeleteId] = useState('')
  const [deleteStatus, setDeleteStatus] = useState<RequestStatus>({
    state: 'idle',
  })

  const [notaForm, setNotaForm] = useState({
    aluno_id: '',
    disciplina_id: '',
    nota: '',
  })
  const [notaStatus, setNotaStatus] = useState<RequestStatus>({
    state: 'idle',
  })
  const [selectedAlunoNotas, setSelectedAlunoNotas] = useState('')

  const fetchAlunos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/consultar-alunos`)
      if (!response.ok) {
        throw new Error(`Falha ao consultar alunos (${response.status})`)
      }
      const data = (await response.json()) as Aluno[]
      setAlunos(data)
      setLastUpdated(new Date().toLocaleString('pt-BR'))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha inesperada ao consultar alunos'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDisciplinas = async () => {
    try {
      const response = await fetch(`${API_BASE}/consultar-disciplinas`)
      if (!response.ok) {
        throw new Error(`Falha ao consultar disciplinas (${response.status})`)
      }
      const data = (await response.json()) as Disciplina[]
      setDisciplinas(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha inesperada ao consultar disciplinas'
      setNotasError(message)
    }
  }

  const fetchNotas = async () => {
    setNotasError(null)
    try {
      const response = await fetch(`${API_BASE}/consultar-notas`)
      if (!response.ok) {
        throw new Error(`Falha ao consultar notas (${response.status})`)
      }
      const data = (await response.json()) as Nota[]
      setNotas(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha inesperada ao consultar notas'
      setNotasError(message)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carregamento inicial dos dados da API
    void fetchAlunos()
    void fetchDisciplinas()
    void fetchNotas()
  }, [])

  const totals = useMemo(() => {
    const total = alunos.length
    const comEmail = alunos.filter((aluno) => aluno.email).length
    const comEndereco = alunos.filter((aluno) => aluno.endereco_id).length
    const comMae = alunos.filter((aluno) => aluno.nome_mae).length
    const totalNotas = notas.length
    return {
      total,
      comEmail,
      semEmail: total - comEmail,
      comEndereco,
      comMae,
      totalNotas,
    }
  }, [alunos, notas])

  const notasDoAluno = useMemo(() => {
    if (!selectedAlunoNotas) {
      return notas
    }
    return notas.filter((nota) => String(nota.aluno_id) === selectedAlunoNotas)
  }, [notas, selectedAlunoNotas])

  const notasPorAluno = useMemo(() => {
    return notas.reduce<Record<number, number>>((acc, nota) => {
      acc[nota.aluno_id] = (acc[nota.aluno_id] ?? 0) + 1
      return acc
    }, {})
  }, [notas])

  const filteredAlunos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const base = term
      ? alunos.filter((aluno) => {
          return (
            aluno.nome_aluno.toLowerCase().includes(term) ||
            aluno.matricula.toLowerCase().includes(term) ||
            (aluno.email ?? '').toLowerCase().includes(term) ||
            (aluno.nome_mae ?? '').toLowerCase().includes(term) ||
            String(aluno.id).includes(term)
          )
        })
      : alunos

    const sorted = [...base].sort((a, b) => {
      if (sortBy === 'id') {
        return a.id - b.id
      }
      return a[sortBy].localeCompare(b[sortBy])
    })

    return sortDir === 'desc' ? sorted.reverse() : sorted
  }, [alunos, searchTerm, sortBy, sortDir])

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreateStatus({ state: 'idle' })
    const { matricula, nome_aluno, email, nome_mae, endereco_id } = createForm

    if (!matricula.trim() || !nome_aluno.trim()) {
      setCreateStatus({
        state: 'error',
        message: 'Matrícula e nome do aluno são obrigatórios.',
      })
      return
    }

    const enderecoIdValue = endereco_id.trim()
    const enderecoNumber =
      enderecoIdValue.length > 0 ? Number(enderecoIdValue) : null
    if (enderecoIdValue.length > 0 && Number.isNaN(enderecoNumber)) {
      setCreateStatus({
        state: 'error',
        message: 'O campo de endereço precisa ser um número válido.',
      })
      return
    }

    setCreateStatus({ state: 'loading' })
    try {
      const response = await fetch(`${API_BASE}/criar-aluno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: matricula.trim(),
          nome_aluno: nome_aluno.trim(),
          email: email.trim() || null,
          nome_mae: nome_mae.trim() || null,
          endereco_id: enderecoNumber,
        }),
      })

      if (!response.ok) {
        throw new Error(`Falha ao criar aluno (${response.status})`)
      }

      const data = (await response.json()) as Aluno
      setCreateStatus({
        state: 'success',
        message: `Aluno criado com sucesso (ID ${data.id}).`,
      })
      setCreateForm({
        matricula: '',
        nome_aluno: '',
        email: '',
        nome_mae: '',
        endereco_id: '',
      })
      await fetchAlunos()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha inesperada ao criar aluno'
      setCreateStatus({ state: 'error', message })
    }
  }

  const handleLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLookupStatus({ state: 'idle' })
    setLookupResult(null)

    const idValue = Number(lookupId)
    if (Number.isNaN(idValue) || idValue <= 0) {
      setLookupStatus({
        state: 'error',
        message: 'Informe um ID válido para consulta.',
      })
      return
    }

    setLookupStatus({ state: 'loading' })
    try {
      const response = await fetch(`${API_BASE}/consultar-alunos/${idValue}`)
      if (!response.ok) {
        throw new Error(`Aluno não encontrado (${response.status})`)
      }
      const data = (await response.json()) as Aluno
      setLookupResult(data)
      setLookupStatus({ state: 'success', message: 'Aluno encontrado.' })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha inesperada na consulta'
      setLookupStatus({ state: 'error', message })
    }
  }

  const handleDelete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDeleteStatus({ state: 'idle' })

    const idValue = Number(deleteId)
    if (Number.isNaN(idValue) || idValue <= 0) {
      setDeleteStatus({
        state: 'error',
        message: 'Informe um ID válido para exclusão.',
      })
      return
    }

    setDeleteStatus({ state: 'loading' })
    try {
      const response = await fetch(`${API_BASE}/deletar-aluno/${idValue}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`Falha ao deletar aluno (${response.status})`)
      }
      const data = (await response.json()) as { mensagem: string; id: number }
      setDeleteStatus({
        state: 'success',
        message: data.mensagem || `Aluno ${data.id} deletado.`,
      })
      setDeleteId('')
      await fetchAlunos()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha inesperada ao deletar aluno'
      setDeleteStatus({ state: 'error', message })
    }
  }

  const handleSelectAlunoNotas = (alunoId: string) => {
    setSelectedAlunoNotas(alunoId)
    setNotaForm((prev) => ({ ...prev, aluno_id: alunoId }))
  }

  const handleCreateNota = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotaStatus({ state: 'idle' })

    const alunoId = Number(notaForm.aluno_id)
    const disciplinaId = Number(notaForm.disciplina_id)
    const notaValue = Number(notaForm.nota)

    if (Number.isNaN(alunoId) || alunoId <= 0) {
      setNotaStatus({ state: 'error', message: 'Selecione um aluno válido.' })
      return
    }
    if (Number.isNaN(disciplinaId) || disciplinaId <= 0) {
      setNotaStatus({ state: 'error', message: 'Selecione uma disciplina válida.' })
      return
    }
    if (Number.isNaN(notaValue)) {
      setNotaStatus({ state: 'error', message: 'Informe uma nota válida.' })
      return
    }

    setNotaStatus({ state: 'loading' })
    try {
      const response = await fetch(`${API_BASE}/criar-nota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aluno_id: alunoId,
          disciplina_id: disciplinaId,
          nota: notaValue,
        }),
      })
      if (!response.ok) {
        throw new Error(`Falha ao criar nota (${response.status})`)
      }

      const data = (await response.json()) as Nota
      setNotaStatus({
        state: 'success',
        message: `Nota registrada para ${data.aluno_nome}.`,
      })
      setSelectedAlunoNotas(String(data.aluno_id))
      setNotaForm({
        aluno_id: String(data.aluno_id),
        disciplina_id: '',
        nota: '',
      })
      await fetchNotas()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha inesperada ao criar nota'
      setNotaStatus({ state: 'error', message })
    }
  }

  const handleDeleteNota = async (id: number) => {
    setNotaStatus({ state: 'loading' })
    try {
      const response = await fetch(`${API_BASE}/deletar-nota/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`Falha ao deletar nota (${response.status})`)
      }

      const data = (await response.json()) as { mensagem: string; id: number }
      setNotaStatus({
        state: 'success',
        message: data.mensagem || `Nota ${data.id} deletada.`,
      })
      await fetchNotas()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha inesperada ao deletar nota'
      setNotaStatus({ state: 'error', message })
    }
  }

  return (
    <div className="app">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">PJ2</span>
          <div>
            <strong>Sistema de Controle</strong>
            <span className="brand-subtitle">
              Painel de análise conectado ao backend Django
            </span>
          </div>
        </div>
        <nav className="menu">
          <button
            className={`tab-button ${activeTab === 'alunos' ? 'active' : ''}`}
            onClick={() => setActiveTab('alunos')}
          >
            👥 Controle de Alunos
          </button>
          <button
            className={`tab-button ${activeTab === 'biblioteca' ? 'active' : ''}`}
            onClick={() => setActiveTab('biblioteca')}
          >
            📚 Biblioteca
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'alunos' ? (
          <>
            <section className="hero-section">
              <div>
                <h1>Análise de dados acadêmicos</h1>
                <p>
                  Visualize o cadastro de alunos, explore indicadores rápidos e
                  valide as rotas já expostas pela API. Todas as requisições são
                  realizadas direto no backend disponível em{' '}
                  <code>http://127.0.0.1:8000</code>.
                </p>
              </div>
              <div className="hero-card">
                <strong>Status da API</strong>
                {loading ? (
                  <span className="helper">Carregando dados da API...</span>
                ) : error ? (
                  <span className="helper">{error}</span>
                ) : (
                  <span className="helper">Conectado e pronto para análise.</span>
                )}
                <span className="helper">
                  Última atualização: {lastUpdated ?? 'aguardando'}
                </span>
                <button
                  type="button"
                  className="button"
                  onClick={fetchAlunos}
                  disabled={loading}
                >
                  Atualizar dados
                </button>
              </div>
            </section>

            <section className="section" id="resumo">
              <div className="section-header">
                <div>
                  <h2>Resumo do cadastro</h2>
                  <p>Indicadores rápidos a partir das informações de alunos.</p>
                </div>
                <div className="status">
                  {error ? 'API indisponível' : 'API respondendo'}
                </div>
              </div>
              <div className="metric-grid">
                <div className="metric-card">
                  <strong>Total de alunos</strong>
                  <span>{totals.total}</span>
                </div>
                <div className="metric-card">
                  <strong>Com e-mail</strong>
                  <span>{totals.comEmail}</span>
                </div>
                <div className="metric-card">
                  <strong>Sem e-mail</strong>
                  <span>{totals.semEmail}</span>
                </div>
                <div className="metric-card">
                  <strong>Com endereço</strong>
                  <span>{totals.comEndereco}</span>
                </div>
                <div className="metric-card">
                  <strong>Com nome da mãe</strong>
                  <span>{totals.comMae}</span>
                </div>
                <div className="metric-card">
                  <strong>Total de notas</strong>
                  <span>{totals.totalNotas}</span>
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-header">
                <div>
                  <h2>Rotas disponíveis</h2>
                  <p>Endpoints implementados no backend atual.</p>
                </div>
              </div>
              <div className="endpoint-grid">
                {endpoints.map((endpoint) => (
                  <article key={endpoint.path} className="endpoint-card">
                    <span className={`badge ${endpoint.method.toLowerCase()}`}>
                      {endpoint.method}
                    </span>
                    <h3>{endpoint.path}</h3>
                    <p>{endpoint.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="section" id="alunos">
              <div className="section-header">
                <div>
                  <h2>Alunos cadastrados</h2>
                  <p>Filtre e ordene a lista para explorar os dados.</p>
                </div>
              </div>

              <div className="filters">
                <label>
                  Buscar
                  <input
                    type="search"
                    placeholder="Nome, matrícula, e-mail ou ID"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </label>
                <label>
                  Ordenar por
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value as 'nome_aluno' | 'matricula' | 'id')
                    }
                  >
                    <option value="nome_aluno">Nome</option>
                    <option value="matricula">Matrícula</option>
                    <option value="id">ID</option>
                  </select>
                </label>
                <label>
                  Direção
                  <select
                    value={sortDir}
                    onChange={(event) =>
                      setSortDir(event.target.value as 'asc' | 'desc')
                    }
                  >
                    <option value="asc">Ascendente</option>
                    <option value="desc">Descendente</option>
                  </select>
                </label>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Matrícula</th>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Nome da mãe</th>
                      <th>Endereço</th>
                      <th>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="empty">
                          Carregando alunos...
                        </td>
                      </tr>
                    ) : filteredAlunos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="empty">
                          Nenhum aluno encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredAlunos.map((aluno) => (
                        <tr key={aluno.id}>
                          <td>{aluno.id}</td>
                          <td>{aluno.matricula}</td>
                          <td>{aluno.nome_aluno}</td>
                          <td>{aluno.email ?? '-'}</td>
                          <td>{aluno.nome_mae ?? '-'}</td>
                          <td>{aluno.endereco_id ?? '-'}</td>
                          <td>
                            <button
                              type="button"
                              className="link-button"
                              onClick={() => handleSelectAlunoNotas(String(aluno.id))}
                            >
                              Ver notas ({notasPorAluno[aluno.id] ?? 0})
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="section" id="notas">
              <div className="section-header">
                <div>
                  <h2>Notas dos alunos</h2>
                  <p>Cadastre e consulte as notas por aluno e disciplina.</p>
                </div>
                <div className="status">
                  {selectedAlunoNotas
                    ? `Filtrando aluno ${selectedAlunoNotas}`
                    : 'Mostrando todas as notas'}
                </div>
              </div>

              <div className="form-card">
                <h3>Nova nota</h3>
                <form className="form-grid" onSubmit={handleCreateNota}>
                  <label>
                    Aluno
                    <select
                      value={notaForm.aluno_id}
                      onChange={(event) =>
                        setNotaForm((prev) => ({ ...prev, aluno_id: event.target.value }))
                      }
                    >
                      <option value="">Selecione</option>
                      {alunos.map((aluno) => (
                        <option key={aluno.id} value={aluno.id}>
                          {aluno.nome_aluno} (ID {aluno.id})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Disciplina
                    <select
                      value={notaForm.disciplina_id}
                      onChange={(event) =>
                        setNotaForm((prev) => ({ ...prev, disciplina_id: event.target.value }))
                      }
                    >
                      <option value="">Selecione</option>
                      {disciplinas.map((disciplina) => (
                        <option key={disciplina.id} value={disciplina.id}>
                          {disciplina.nome_disciplina} (ID {disciplina.id})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Nota
                    <input
                      type="number"
                      step="0.01"
                      value={notaForm.nota}
                      onChange={(event) =>
                        setNotaForm((prev) => ({ ...prev, nota: event.target.value }))
                      }
                    />
                  </label>
                  <div className="form-actions">
                    <button type="submit" className="button" disabled={notaStatus.state === 'loading'}>
                      {notaStatus.state === 'loading' ? 'Salvando...' : 'Registrar nota'}
                    </button>
                  </div>
                </form>
                {notaStatus.message && (
                  <div className={`status ${notaStatus.state === 'error' ? 'status-error' : ''}`}>
                    {notaStatus.message}
                  </div>
                )}
                {notasError && <div className="status status-error">{notasError}</div>}
              </div>

              <div className="filters">
                <label>
                  Filtrar por aluno
                  <select
                    value={selectedAlunoNotas}
                    onChange={(event) => setSelectedAlunoNotas(event.target.value)}
                  >
                    <option value="">Todas as notas</option>
                    {alunos.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>
                        {aluno.nome_aluno}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedAlunoNotas && (
                  <div className="status">
                    {alunos.find((aluno) => String(aluno.id) === selectedAlunoNotas)?.nome_aluno ??
                      'Aluno selecionado'}
                  </div>
                )}
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Aluno</th>
                      <th>Disciplina</th>
                      <th>Nota</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notasDoAluno.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty">
                          Nenhuma nota encontrada.
                        </td>
                      </tr>
                    ) : (
                      notasDoAluno.map((nota) => (
                        <tr key={nota.id}>
                          <td>{nota.id}</td>
                          <td>{nota.aluno_nome}</td>
                          <td>{nota.disciplina_nome}</td>
                          <td>{nota.nota ?? '-'}</td>
                          <td>
                            <button
                              type="button"
                              className="link-button danger"
                              onClick={() => void handleDeleteNota(nota.id)}
                              disabled={notaStatus.state === 'loading'}
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="section" id="operacoes">
              <div className="section-header">
                <div>
                  <h2>Operações rápidas</h2>
                  <p>Use os formulários para validar as rotas de criação e consulta.</p>
                </div>
              </div>

              <div className="form-card">
                <h3>Novo aluno</h3>
                <form className="form-grid" onSubmit={handleCreate}>
                  <label>
                    Matrícula *
                    <input
                      type="text"
                      value={createForm.matricula}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, matricula: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Nome do aluno *
                    <input
                      type="text"
                      value={createForm.nome_aluno}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, nome_aluno: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    E-mail
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Nome da mãe
                    <input
                      type="text"
                      value={createForm.nome_mae}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, nome_mae: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Endereço (ID)
                    <input
                      type="number"
                      min="1"
                      value={createForm.endereco_id}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          endereco_id: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="form-actions">
                    <button type="submit" className="button" disabled={createStatus.state === 'loading'}>
                      {createStatus.state === 'loading' ? 'Salvando...' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
                {createStatus.message && (
                  <div className={`status ${createStatus.state === 'error' ? 'status-error' : ''}`}>
                    {createStatus.message}
                  </div>
                )}
              </div>

              <div className="form-card">
                <h3>Consultar aluno por ID</h3>
                <form className="inline-form" onSubmit={handleLookup}>
                  <label>
                    ID do aluno
                    <input
                      type="number"
                      min="1"
                      value={lookupId}
                      onChange={(event) => setLookupId(event.target.value)}
                    />
                  </label>
                  <button type="submit" className="button" disabled={lookupStatus.state === 'loading'}>
                    {lookupStatus.state === 'loading' ? 'Consultando...' : 'Consultar'}
                  </button>
                </form>
                {lookupStatus.message && (
                  <div className={`status ${lookupStatus.state === 'error' ? 'status-error' : ''}`}>
                    {lookupStatus.message}
                  </div>
                )}
                {lookupResult && (
                  <div className="result-card">
                    <strong>{lookupResult.nome_aluno}</strong>
                    <div className="result-details">
                      <span>ID: {lookupResult.id}</span>
                      <span>Matrícula: {lookupResult.matricula}</span>
                      <span>E-mail: {lookupResult.email ?? '-'}</span>
                      <span>Nome da mãe: {lookupResult.nome_mae ?? '-'}</span>
                      <span>Endereço: {lookupResult.endereco_id ?? '-'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-card">
                <h3>Deletar aluno</h3>
                <form className="inline-form" onSubmit={handleDelete}>
                  <label>
                    ID do aluno
                    <input
                      type="number"
                      min="1"
                      value={deleteId}
                      onChange={(event) => setDeleteId(event.target.value)}
                    />
                  </label>
                  <button type="submit" className="button" disabled={deleteStatus.state === 'loading'}>
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
          </>
        ) : (
          <Biblioteca />
        )}
      </main>
    </div>
  )
}

export default App
