from typing import List, Optional
from django.shortcuts import get_object_or_404
from ninja_extra import route, api_controller
from controle_aluno.models import Aluno, Disciplina, Endereco, Nota
from controle_aluno.schemas import (
    AlunoIn,
    AlunoOut,
    AlunoExcluido,
    DisciplinaOut,
    EnderecoIn,
    EnderecoOut,
    NotaIn,
    NotaOut,
)

# Create your views here.

@api_controller("/controle_aluno",)
class ControleAlunosView:
    @route.get("/consultar-alunos", response=List[AlunoOut])
    def consultar_alunos(self):
        return Aluno.objects.all()
    
    @route.get("/consultar-alunos/{id}", response=AlunoOut)
    def consultar_aluno(self, id: int):
        return get_object_or_404(Aluno, id=id)


    @route.post("/criar-aluno", response=AlunoOut)
    def criar_aluno(self, data: AlunoIn): 
        aluno = Aluno.objects.create(**data.dict())
        return aluno
    
    @route.delete("/deletar-aluno/{id}", response=AlunoExcluido)
    def deletar_aluno(self, id: int):
        aluno = get_object_or_404(Aluno, id=id)
        aluno.delete()
        return {"mensagem": "aluno deletado com sucesso ", "id": id}

    @route.get("/consultar-disciplinas", response=List[DisciplinaOut])
    def consultar_disciplinas(self):
        return Disciplina.objects.all()

    @route.get("/consultar-notas", response=List[NotaOut])
    def consultar_notas(self, aluno_id: Optional[int] = None):
        notas = Nota.objects.select_related("aluno", "disciplina").all()
        if aluno_id is not None:
            notas = notas.filter(aluno_id=aluno_id)
        return [
            {
                "id": nota.id,
                "aluno_id": nota.aluno_id,
                "aluno_nome": nota.aluno.nome_aluno,
                "disciplina_id": nota.disciplina_id,
                "disciplina_nome": nota.disciplina.nome_disciplina,
                "nota": float(nota.nota) if nota.nota is not None else None,
            }
            for nota in notas
        ]

    @route.post("/criar-nota", response=NotaOut)
    def criar_nota(self, data: NotaIn):
        aluno = get_object_or_404(Aluno, id=data.aluno_id)
        disciplina = get_object_or_404(Disciplina, id=data.disciplina_id)
        nota = Nota.objects.create(
            aluno=aluno,
            disciplina=disciplina,
            nota=data.nota,
        )
        return {
            "id": nota.id,
            "aluno_id": nota.aluno_id,
            "aluno_nome": aluno.nome_aluno,
            "disciplina_id": nota.disciplina_id,
            "disciplina_nome": disciplina.nome_disciplina,
            "nota": float(nota.nota) if nota.nota is not None else None,
        }

    @route.delete("/deletar-nota/{id}")
    def deletar_nota(self, id: int):
        nota = get_object_or_404(Nota, id=id)
        nota.delete()
        return {"mensagem": "nota deletada com sucesso", "id": id}
