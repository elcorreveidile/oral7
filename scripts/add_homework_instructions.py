#!/usr/bin/env python3
"""Script para agregar homeworkInstructions a todas las sesiones."""

import re
from pathlib import Path

# Mapa de instrucciones por número de sesión
HOMEWORK_INSTRUCTIONS = {
    1: 'Grábate presentándote en español (2-3 minutos). Incluye: tu nombre, origen, por qué estudias español, tus motivaciones y qué esperas lograr en este curso. Usa correctamente "ser" y "estar".',
    2: 'Graba un mini-argumento de 3-4 minutos sobre un tema que te interese (ej. "¿Es bueno el trabajo remoto?"). Usa al menos 8 conectores diferentes de los vistos en clase (para empezar, además, sin embargo, por lo tanto, etc.).',
    3: 'Graba un video de 3-4 minutos dando tu opinión sobre un tema polémico actual. Usa expresiones de opinión ("En mi opinión", "Considero que", "Me parece que...") y al menos 3 modalizadores de certeza differentes.',
    4: 'Graba 3 situaciones cortas (1-2 min cada una): (a) una conversación formal con tu jefe, (b) una entrevista de trabajo, (c) una cena informal con amigos. Demuestra el uso apropiado de tú vs usted y registro formal/informal.',
    5: 'Graba un debate contigo mismo o con un compañero (4-5 minutos). Elige un tema polémico y expresa acuerdo/desacuerdo usando toda la escala: desde "Totalmente de acuerdo" hasta "Totalmente en desacuerdo", usando las fórmulas suavizadas, matizadas y rotundas.',
    6: 'Graba un contraargumento de 3-4 minutos. Primero presenta un argumento (ej. "La tecnología nos hace menos sociables"), luego contraargumenta usando conectores de contraargumentación (sin embargo, no obstante, aun así, no por eso) y concesiones (es cierto que, admite que).',
    7: 'Asistencia obligatoria al debate en clase. Sube un documento (200 palabras) reflexionando sobre tu participación: ¿Qué estrategias usaste? ¿Qué mejoraste? ¿Qué necesitas practicar más?',
    8: 'No hay tarea formal. Dedica tiempo a revisar las notas y feedback del debate. Prepara preguntas para la sesión de mejora.',
    9: 'Graba un monólogo de 3-4 minutos argumentando sobre tu posición respecto al tema del debate. Aplica el feedback recibido: mejora conectores, registro y estructura.',
    10: 'Graba una anécdota personal en pasado (3-4 minutos). Usa pretérito indefinido, imperfecto y pluscuamperfecto. Incluye indicadores temporales específicos (antes de, cuando, en cuanto, después de, mientras).',
    11: 'Graba un relato de 3-4 minutos sobre un acontecimiento histórico o una secuencia de eventos. Usa al menos 10 indicadores temporales diferentes (mientras, en cuanto, al poco tiempo, inmediatamente, después de, etc.).',
    12: 'Graba un documental breve (3-4 minutos) sobre un evento histórico. Combina narración en pasado, citas indirectas ("Según los historiadores...") y marcadores temporales precisos.',
    13: 'Graba un monólogo de 3-4 minutos usando hipótesis en presente/futuro. Responde: "¿Si fueras presidente/a de tu país, qué cambiarías?" Usa condicional compuesto (habría, habría hecho, se habría).',
    14: 'Graba una reflexión de 3-4 minutos sobre un pasado hipotético: "¿Qué habría pasado si...?" (ej. si hubieras nacido en otro país). Usa pluscuamperfecto de subjuntivo + condicional compuesto.',
    15: 'Práctica libre para el parcial. Graba 2 monólogos de 2-3 min cada uno: (a) narración en pasado, (b) hipótesis. Sube para recibir feedback antes del examen.',
    16: None,  # Examen - no tiene tarea
    17: 'Graba un resumen de tus vacaciones de Semana Santa (2-3 minutos). Usa pasado y conectores variados.',
    18: 'Prepara y graba una entrevista simulada (3-4 minutos). Tú eres el entrevistador. Haz 5 preguntas abiertas a una figura famosa (imaginaria) sobre su vida y carrera. Demuestra estrategias de seguimiento.',
    19: 'Graba un role-play de entrevista (4-5 minutos). Tú eres el entrevistado. Responde preguntas sobre tu "profesión ideal" usando estrategias de interacción: pedir aclaraciones, ganar tiempo, reformular.',
    20: 'Graba 3 situaciones (1-2 min cada una) transmitiendo mensajes de otros en estilo indirecto: (a) "Juan dijo que...", (b) "Mi jefe me pidió que...", (c) "Según los expertos...". Usa tiempos de subjuntivo apropiados.',
    21: 'Graba un monólogo de 3-4 minutos dando consejo a un amigo. Usa estrategias de influencia: aconsejar ("Te recomiendo que..."), sugerir ("¿Qué tal si...?"), advertir ("Ten cuidado con..."), insistir ("Te insisto en que...").',
    22: 'Graba una negociación (3-4 minutos). Intenta convencer a un amigo escéptico de algo (tu restaurante favorito, una película, etc.). Usa lenguaje persuasivo y gestiona objeciones.',
    23: 'Graba la apertura de una conferencia (2-3 minutos). Elige un tema que dominas y practica: captar atención (hook), presentar la idea central, y dar una visión general.',
    24: 'Graba el desarrollo y cierre de una conferencia (3-4 minutos). Continúa tu tema de la sesión anterior. Incluye: ejemplos concretos, énfasis en detalles clave, y un cierre memorable.',
    25: 'Graba 2 versiones del mismo monólogo (2-3 min cada una): (a) registro coloquial con un amigo, (b) registro formal en una conferencia. Contrastativamente usa muletillas vs conectores formales.',
    26: 'Graba una reflexión de 2-3 minutos analizando el uso de lenguaje vulgar en español. ¿Cuándo es aceptable? ¿Cuándo no? ¿Diferencias entre España y LATAM? No necesitas usar tacos, solo analizar su pragmática.',
    27: 'Graba un monólogo de 3-4 minutos expresando sentimientos y emociones complejas sobre un tema abstracto (ej. la soledad, el éxito, el arte). Usa vocabulario abstracto preciso (angustia, plenitud, devastación, efímero).',
    28: 'No hay tarea formal. ¡Felicidades por completar el curso! Si quieres, sube tu presentación final como portafolio.',
}


def add_homework_instructions_to_sessions(file_path: Path) -> None:
    """Agrega homeworkInstructions a las sesiones que no lo tienen."""
    content = file_path.read_text(encoding='utf-8')

    # Primero eliminamos homeworkInstructions existentes (si hay) para evitar duplicados
    content = re.sub(r",?\s*homeworkInstructions:\s*'[^']*'\s*,?", "", content)

    # Buscar cada sesión y agregar homeworkInstructions después del cierre de resources
    for session_num in sorted(HOMEWORK_INSTRUCTIONS.keys()):
        instructions = HOMEWORK_INSTRUCTIONS[session_num]
        if instructions is None:
            continue

        # Escapar comillas simples en las instrucciones
        escaped_instructions = instructions.replace("'", "\\'")

        # Patrón: encontrar resources: [ ... ], seguido de },
        # Usamos lookbehind para encontrar resources y lookahead para },
        pattern = r"(resources:\s*\[[^\]]*\]\s*,)\n(\s*},)"

        def replacement(match):
            return f"{match.group(1)}\n    homeworkInstructions: '{escaped_instructions}',\n{match.group(2)}"

        # Solo reemplazamos una vez por sesión
        # Para hacer esto, buscamos sessionNumber específico
        session_pattern = rf"(sessionNumber:\s*{session_num},.*?resources:\s*\[[^\]]*\]\s*,)\n(\s*}},)"
        content = re.sub(session_pattern, replacement, content, flags=re.DOTALL)

    # Escribir el contenido modificado
    file_path.write_text(content, encoding='utf-8')
    print(f"✅ Archivo actualizado: {file_path}")


if __name__ == '__main__':
    sessions_file = Path('/Users/javierbenitez/Desktop/AI/oral7/src/data/sessions.ts')
    add_homework_instructions_to_sessions(sessions_file)
