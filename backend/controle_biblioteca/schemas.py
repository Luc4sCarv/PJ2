from typing import Optional
from ninja import Schema


class CategoriaOut(Schema):
    id: int
    nome_categoria: str


class CategoriaIn(Schema):
    nome_categoria: str


class LivroOut(Schema):
    id: int
    titulo: str
    categoria_id: Optional[int] = None
    categoria_nome: Optional[str] = None
    preco: Optional[float] = None
    autor: Optional[str] = None


class LivroIn(Schema):
    titulo: str
    categoria_id: Optional[int] = None
    preco: Optional[float] = None
    autor: Optional[str] = None


class LivroAtualizar(Schema):
    titulo: Optional[str] = None
    categoria_id: Optional[int] = None
    preco: Optional[float] = None
    autor: Optional[str] = None


class EmprestimoOut(Schema):
    id: int
    data_emprestimo: str
    data_devolucao: Optional[str] = None
    livro_id: int
    livro_titulo: str
    aluno_id: Optional[int] = None
    aluno_nome: Optional[str] = None


class EmprestimoIn(Schema):
    data_emprestimo: str
    livro_id: int
    aluno_id: Optional[int] = None


class EmprestimoAtualizar(Schema):
    data_devolucao: Optional[str] = None


class EmprestimoExcluido(Schema):
    mensagem: str
    id: int
