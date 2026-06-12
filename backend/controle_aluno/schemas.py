from typing import Optional
from ninja import Schema


class AlunoOut(Schema):
    id: int
    matricula: str
    nome_aluno: str
    email: Optional[str] = None
    nome_mae: Optional[str] = None
    endereco_id: Optional[int] = None


class AlunoIn(Schema):
    matricula: str
    nome_aluno: str
    email: Optional[str] = None
    nome_mae: Optional[str] = None
    endereco_id: Optional[int] = None


class AlunoExcluido(Schema):
    mensagem: str
    id: int


class EnderecoIn(Schema):
    cep: str
    endereco: str
    bairro: Optional[str] = None
    cidade: str
    estado: str
    regiao: Optional[str] = None


class EnderecoOut(Schema):
    id: int
    cep: str
    endereco: str
    bairro: Optional[str] = None
    cidade: str
    estado: str
    regiao: Optional[str] = None


class DisciplinaOut(Schema):
    id: int
    nome_disciplina: str
    carga: int
    semestre: int


class NotaIn(Schema):
    aluno_id: int
    disciplina_id: int
    nota: float


class NotaOut(Schema):
    id: int
    aluno_id: int
    aluno_nome: str
    disciplina_id: int
    disciplina_nome: str
    nota: Optional[float] = None