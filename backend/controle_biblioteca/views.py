from typing import List, Optional
from django.shortcuts import get_object_or_404
from ninja_extra import route, api_controller
from controle_biblioteca.models import TbCategoria, TbLivros, TbEmprestimos
from controle_aluno.models import Aluno
from controle_biblioteca.schemas import (
    CategoriaIn,
    CategoriaOut,
    LivroIn,
    LivroOut,
    LivroAtualizar,
    EmprestimoIn,
    EmprestimoOut,
    EmprestimoAtualizar,
    EmprestimoExcluido,
)


@api_controller("/controle_biblioteca")
class ControleBibliotecaView:
    # ==================== CATEGORIAS ====================
    @route.get("/categorias", response=List[CategoriaOut])
    def listar_categorias(self):
        return TbCategoria.objects.all()

    @route.get("/categorias/{id}", response=CategoriaOut)
    def obter_categoria(self, id: int):
        return get_object_or_404(TbCategoria, id=id)

    @route.post("/categorias", response=CategoriaOut)
    def criar_categoria(self, data: CategoriaIn):
        categoria = TbCategoria.objects.create(**data.dict())
        return categoria

    @route.put("/categorias/{id}", response=CategoriaOut)
    def atualizar_categoria(self, id: int, data: CategoriaIn):
        categoria = get_object_or_404(TbCategoria, id=id)
        categoria.nome_categoria = data.nome_categoria
        categoria.save()
        return categoria

    @route.delete("/categorias/{id}", response=dict)
    def deletar_categoria(self, id: int):
        categoria = get_object_or_404(TbCategoria, id=id)
        categoria.delete()
        return {"mensagem": "Categoria deletada com sucesso", "id": id}

    # ==================== LIVROS ====================
    @route.get("/livros", response=List[LivroOut])
    def listar_livros(self):
        livros = TbLivros.objects.select_related("categoria").all()
        return [
            {
                "id": livro.id,
                "titulo": livro.titulo,
                "categoria_id": livro.categoria_id,
                "categoria_nome": livro.categoria.nome_categoria if livro.categoria else None,
                "preco": float(livro.preco) if livro.preco else None,
                "autor": livro.autor,
            }
            for livro in livros
        ]

    @route.get("/livros/{id}", response=LivroOut)
    def obter_livro(self, id: int):
        livro = get_object_or_404(TbLivros, id=id)
        return {
            "id": livro.id,
            "titulo": livro.titulo,
            "categoria_id": livro.categoria_id,
            "categoria_nome": livro.categoria.nome_categoria if livro.categoria else None,
            "preco": float(livro.preco) if livro.preco else None,
            "autor": livro.autor,
        }

    @route.post("/livros", response=LivroOut)
    def criar_livro(self, data: LivroIn):
        categoria = None
        if data.categoria_id:
            categoria = get_object_or_404(TbCategoria, id=data.categoria_id)
        
        livro = TbLivros.objects.create(
            titulo=data.titulo,
            categoria=categoria,
            preco=data.preco,
            autor=data.autor,
        )
        return {
            "id": livro.id,
            "titulo": livro.titulo,
            "categoria_id": livro.categoria_id,
            "categoria_nome": livro.categoria.nome_categoria if livro.categoria else None,
            "preco": float(livro.preco) if livro.preco else None,
            "autor": livro.autor,
        }

    @route.put("/livros/{id}", response=LivroOut)
    def atualizar_livro(self, id: int, data: LivroAtualizar):
        livro = get_object_or_404(TbLivros, id=id)
        
        if data.titulo is not None:
            livro.titulo = data.titulo
        if data.categoria_id is not None:
            categoria = get_object_or_404(TbCategoria, id=data.categoria_id)
            livro.categoria = categoria
        if data.preco is not None:
            livro.preco = data.preco
        if data.autor is not None:
            livro.autor = data.autor
        
        livro.save()
        return {
            "id": livro.id,
            "titulo": livro.titulo,
            "categoria_id": livro.categoria_id,
            "categoria_nome": livro.categoria.nome_categoria if livro.categoria else None,
            "preco": float(livro.preco) if livro.preco else None,
            "autor": livro.autor,
        }

    @route.delete("/livros/{id}", response=dict)
    def deletar_livro(self, id: int):
        livro = get_object_or_404(TbLivros, id=id)
        livro.delete()
        return {"mensagem": "Livro deletado com sucesso", "id": id}

    # ==================== EMPRÉSTIMOS ====================
    @route.get("/emprestimos", response=List[EmprestimoOut])
    def listar_emprestimos(self, aluno_id: Optional[int] = None):
        emprestimos = TbEmprestimos.objects.select_related("livro").all()
        
        if aluno_id:
            # Se tiver aluno_id, filtrar (quando a tabela tiver coluna aluno)
            pass
        
        return [
            {
                "id": emp.id,
                "data_emprestimo": emp.data_emprestimo.isoformat(),
                "data_devolucao": emp.data_devolucao.isoformat() if emp.data_devolucao else None,
                "livro_id": emp.livro_id,
                "livro_titulo": emp.livro.titulo,
                "aluno_id": getattr(emp, 'aluno_id', None),
                "aluno_nome": getattr(emp.aluno, 'nome_aluno', None) if hasattr(emp, 'aluno') else None,
            }
            for emp in emprestimos
        ]

    @route.get("/emprestimos/{id}", response=EmprestimoOut)
    def obter_emprestimo(self, id: int):
        emp = get_object_or_404(TbEmprestimos, id=id)
        return {
            "id": emp.id,
            "data_emprestimo": emp.data_emprestimo.isoformat(),
            "data_devolucao": emp.data_devolucao.isoformat() if emp.data_devolucao else None,
            "livro_id": emp.livro_id,
            "livro_titulo": emp.livro.titulo,
            "aluno_id": getattr(emp, 'aluno_id', None),
            "aluno_nome": getattr(emp.aluno, 'nome_aluno', None) if hasattr(emp, 'aluno') else None,
        }

    @route.post("/emprestimos", response=EmprestimoOut)
    def criar_emprestimo(self, data: EmprestimoIn):
        livro = get_object_or_404(TbLivros, id=data.livro_id)
        
        emprestimo = TbEmprestimos.objects.create(
            data_emprestimo=data.data_emprestimo,
            livro=livro,
        )
        
        return {
            "id": emprestimo.id,
            "data_emprestimo": emprestimo.data_emprestimo.isoformat(),
            "data_devolucao": emprestimo.data_devolucao.isoformat() if emprestimo.data_devolucao else None,
            "livro_id": emprestimo.livro_id,
            "livro_titulo": emprestimo.livro.titulo,
            "aluno_id": getattr(emprestimo, 'aluno_id', None),
            "aluno_nome": getattr(emprestimo.aluno, 'nome_aluno', None) if hasattr(emprestimo, 'aluno') else None,
        }

    @route.put("/emprestimos/{id}", response=EmprestimoOut)
    def atualizar_emprestimo(self, id: int, data: EmprestimoAtualizar):
        emprestimo = get_object_or_404(TbEmprestimos, id=id)
        
        if data.data_devolucao is not None:
            emprestimo.data_devolucao = data.data_devolucao
        
        emprestimo.save()
        return {
            "id": emprestimo.id,
            "data_emprestimo": emprestimo.data_emprestimo.isoformat(),
            "data_devolucao": emprestimo.data_devolucao.isoformat() if emprestimo.data_devolucao else None,
            "livro_id": emprestimo.livro_id,
            "livro_titulo": emprestimo.livro.titulo,
            "aluno_id": getattr(emprestimo, 'aluno_id', None),
            "aluno_nome": getattr(emprestimo.aluno, 'nome_aluno', None) if hasattr(emprestimo, 'aluno') else None,
        }

    @route.delete("/emprestimos/{id}", response=EmprestimoExcluido)
    def deletar_emprestimo(self, id: int):
        emprestimo = get_object_or_404(TbEmprestimos, id=id)
        emprestimo.delete()
        return {"mensagem": "Empréstimo deletado com sucesso", "id": id}
