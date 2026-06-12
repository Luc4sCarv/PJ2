from django.db import migrations


def rename_semester_to_semestre(apps, schema_editor):
    """Rename column 'semester' -> 'semestre' only if 'semester' exists.
    This avoids errors on databases that already use 'semestre'.
    """
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'tb_disciplinas'
              AND column_name = 'semester'
        """)
        row = cursor.fetchone()
        if row and row[0]:
            cursor.execute("ALTER TABLE tb_disciplinas CHANGE semester semestre INT NOT NULL")


def revert_rename(apps, schema_editor):
    """Reverse: rename 'semestre' back to 'semester' if present."""
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'tb_disciplinas'
              AND column_name = 'semestre'
        """)
        row = cursor.fetchone()
        if row and row[0]:
            cursor.execute("ALTER TABLE tb_disciplinas CHANGE semestre semester INT NOT NULL")


class Migration(migrations.Migration):

    dependencies = [
        ("controle_aluno", "0002_aluno_nome_mae"),
    ]

    operations = [
        migrations.RunPython(rename_semester_to_semestre, reverse_code=revert_rename),
    ]
