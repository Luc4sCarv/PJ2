from django.db import models

class Endereco(models.Model):
    cep = models.CharField(max_length=10, unique=True)
    endereco = models.CharField(max_length=255)
    bairro = models.CharField(max_length=50, blank=True, null=True)
    cidade = models.CharField(max_length=100)
    estado = models.CharField(max_length=50)
    regiao = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'tb_enderecos'


class Aluno(models.Model):
    matricula = models.CharField(max_length=20, unique=True)
    nome_aluno = models.CharField(max_length=255)
    email = models.EmailField(max_length=100, blank=True, null=True)
    nome_mae = models.CharField(max_length=255, blank=True, null=True )
    endereco = models.ForeignKey(
        Endereco,
        on_delete=models.SET_NULL,
        null=True,
        db_column='endereco_id'
    )
    class Meta:
        db_table = 'tb_alunos'

class Disciplina(models.Model):
    nome_disciplina = models.CharField(max_length=255)
    carga = models.IntegerField()
    semestre = models.IntegerField()
    class Meta:
        db_table = 'tb_disciplinas'

class Nota(models.Model):
    aluno = models.ForeignKey(
        Aluno,
        on_delete=models.CASCADE,
        db_column='aluno_id'
    )
    disciplina = models.ForeignKey(
        Disciplina,
        on_delete=models.CASCADE,
        db_column='disciplina_id'
    )
    nota = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'tb_notas'