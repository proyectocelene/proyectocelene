import codecs

path = r"c:\Users\donat\OneDrive - f5mk83\Desktop\proyecto celene web page\cuestionario-salud-sexual.html"

with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Insert 10e and 10f in Section 3
section3_end = """                    </div>\r
                </div>\r
            </div>\r
\r
            <!-- SECCIÓN 4 -->"""

section3_end_fallback = """                    </div>
                </div>
            </div>

            <!-- SECCIÓN 4 -->"""

new_q10e_10f = """                    </div>
                </div>

                <div class="form-group">
                    <label>10e. Mitos sobre el acoso (Misoginia): ¿Consideras que la forma en que viste una persona, o si está bajo los efectos del alcohol, justifica en alguna medida que sea acosada o que "ella se lo buscó"?</label>
                    <div class="pill-group">
                        <label class="pill-label"><input type="radio" name="q_toxic5" value="A: Sí, hay responsabilidad"> Sí, la forma de vestir es una provocación</label>
                        <label class="pill-label"><input type="radio" name="q_toxic5" value="B: A veces"> A veces, hay que saber darse a respetar</label>
                        <label class="pill-label"><input type="radio" name="q_toxic5" value="C: No, nunca justifica"> No, el único culpable de un abuso es el agresor</label>
                    </div>
                    <div id="fb_q_toxic5" style="display:none;"></div>
                </div>

                <div class="form-group">
                    <label>10f. Roles de género: ¿Crees que los hombres tienen una necesidad física "incontrolable" de tener sexo y que las mujeres tienen la responsabilidad de "complacerlos" o "ponerles un freno"?</label>
                    <div class="pill-group">
                        <label class="pill-label"><input type="radio" name="q_toxic6" value="A: Sí, es biología"> Sí, biológicamente el hombre no se controla</label>
                        <label class="pill-label"><input type="radio" name="q_toxic6" value="B: Parcialmente"> Tiene algo de cierto en algunas personas</label>
                        <label class="pill-label"><input type="radio" name="q_toxic6" value="C: No, mito"> No, ambos tienen la misma capacidad de autocontrol</label>
                    </div>
                    <div id="fb_q_toxic6" style="display:none;"></div>
                </div>
            </div>

            <!-- SECCIÓN 4 -->"""

if section3_end in content:
    content = content.replace(section3_end, new_q10e_10f)
elif section3_end_fallback in content:
    content = content.replace(section3_end_fallback, new_q10e_10f)
else:
    print("Warning: Section 3 marker not found")

# 2. Insert 3b, 3c, 3d in Section 9
section9_marker = """<div class="form-group">\r
                    <label>3. Empatía Sexual: ¿Cómo te aseguras de que la otra persona está sintiendo placer?</label>"""
section9_marker_fallback = """<div class="form-group">
                    <label>3. Empatía Sexual: ¿Cómo te aseguras de que la otra persona está sintiendo placer?</label>"""

new_q3b_3c_3d = """<div class="form-group">
                    <label>3b. Perspectiva Inversa (Tú como iniciador): ¿Alguna vez has insistido tanto, rogado, o puesto mala cara hasta que tu pareja terminó "cediendo" a tener relaciones sexuales por cansancio o para evitar una pelea?</label>
                    <div class="pill-group">
                        <label class="pill-label"><input type="radio" name="q_perp1" value="A: Sí, seguido"> Sí, lo he hecho (coerción sutil)</label>
                        <label class="pill-label"><input type="radio" name="q_perp1" value="B: Alguna vez"> Alguna vez, aunque no me di cuenta del daño</label>
                        <label class="pill-label"><input type="radio" name="q_perp1" value="C: Nunca"> Nunca, si dicen que no, lo respeto sin drama</label>
                    </div>
                    <div id="fb_q_perp1" style="display:none;"></div>
                </div>

                <div class="form-group">
                    <label>3c. Presión de Género: ¿Sientes una presión de que SIEMPRE debes querer tener sexo (para demostrar "hombría" o "deber"), y temes que si dices "no", tu pareja se enoje, dude de tu amor o de tu sexualidad?</label>
                    <div class="pill-group">
                        <label class="pill-label"><input type="radio" name="q_presion" value="A: Sí, me exigen"> Sí, sufro presión y si me niego hay problemas</label>
                        <label class="pill-label"><input type="radio" name="q_presion" value="B: Me presiono"> Yo mismo(a) me presiono a cumplir siempre</label>
                        <label class="pill-label"><input type="radio" name="q_presion" value="C: No"> No, me siento libre de decir "hoy no tengo ganas"</label>
                    </div>
                    <div id="fb_q_presion" style="display:none;"></div>
                </div>

                <div class="form-group">
                    <label>3d. Arma Emocional (Violencia de Pareja): Durante una pelea o enojo, ¿alguna vez has usado la intimidad de tu pareja para herirle? (Ej. Burlarte del tamaño de sus genitales, su desempeño, o usar el sexo como premio/castigo)</label>
                    <div class="pill-group">
                        <label class="pill-label"><input type="radio" name="q_perp2" value="A: Sí, para herir"> Sí, me he burlado de su cuerpo/desempeño</label>
                        <label class="pill-label"><input type="radio" name="q_perp2" value="B: Chantaje sutil"> He usado el sexo como moneda de cambio (premio/castigo)</label>
                        <label class="pill-label"><input type="radio" name="q_perp2" value="C: Nunca"> Nunca atacaría la intimidad ni el cuerpo de mi pareja</label>
                    </div>
                    <div id="fb_q_perp2" style="display:none;"></div>
                </div>

                <div class="form-group">
                    <label>3. Empatía Sexual: ¿Cómo te aseguras de que la otra persona está sintiendo placer?</label>"""

if section9_marker in content:
    content = content.replace(section9_marker, new_q3b_3c_3d)
elif section9_marker_fallback in content:
    content = content.replace(section9_marker_fallback, new_q3b_3c_3d)
else:
    print("Warning: Section 9 marker not found")

# 3. JS Feedbacks
feedback_marker = """            q19: {\r
                'A: Llaga': { type: 'alert', text: '🚨 Una llaga indolora es el síntoma clásico de la Sífilis. Es 100% curable pero requiere atención médica inmediata.' },\r
                'B: Verrugas': { type: 'alert', text: '🚨 Las verrugas pueden ser señal de VPH. Un médico debe valorarlas para tratarlas o retirarlas adecuadamente.' },\r
                'C: Ardor': { type: 'alert', text: '🚨 El ardor o secreción inusual podría ser Gonorrea o Clamidia. Requieren antibiótico específico para evitar infertilidad a futuro.' }\r
            }"""
feedback_marker_fallback = """            q19: {
                'A: Llaga': { type: 'alert', text: '🚨 Una llaga indolora es el síntoma clásico de la Sífilis. Es 100% curable pero requiere atención médica inmediata.' },
                'B: Verrugas': { type: 'alert', text: '🚨 Las verrugas pueden ser señal de VPH. Un médico debe valorarlas para tratarlas o retirarlas adecuadamente.' },
                'C: Ardor': { type: 'alert', text: '🚨 El ardor o secreción inusual podría ser Gonorrea o Clamidia. Requieren antibiótico específico para evitar infertilidad a futuro.' }
            }"""

new_feedbacks = """            q19: {
                'A: Llaga': { type: 'alert', text: '🚨 Una llaga indolora es el síntoma clásico de la Sífilis. Es 100% curable pero requiere atención médica inmediata.' },
                'B: Verrugas': { type: 'alert', text: '🚨 Las verrugas pueden ser señal de VPH. Un médico debe valorarlas para tratarlas o retirarlas adecuadamente.' },
                'C: Ardor': { type: 'alert', text: '🚨 El ardor o secreción inusual podría ser Gonorrea o Clamidia. Requieren antibiótico específico para evitar infertilidad a futuro.' }
            },
            q_toxic5: {
                'A: Sí': { type: 'alert', text: '🛑 Alerta (Victim Blaming): Responsabilizar a la víctima por su ropa o consumo de alcohol fomenta la cultura de la violación. El único responsable de un acoso es el agresor.' }
            },
            q_toxic6: {
                'A: Sí': { type: 'alert', text: '🛑 Alerta: Creer que los hombres no tienen autocontrol minimiza la responsabilidad masculina. Ambos géneros tienen igual capacidad de control, respeto y empatía.' }
            },
            q_perp1: {
                'A: Sí': { type: 'warning', text: '⚠️ Atención: Insistir hasta que la otra persona "cede" por cansancio se llama Coerción Sexual. El sexo sin un sí entusiasta (y libre de culpa) no es ético.' },
                'B: Alguna vez': { type: 'warning', text: '⚠️ Atención: Es importante aprender a aceptar un "no" sin hacer sentir culpable o castigar emocionalmente a tu pareja.' }
            },
            q_presion: {
                'A: Sí': { type: 'info', text: '🧠 Nota: Los hombres sufren mucha presión por ser "máquinas sexuales", y las mujeres por "cumplir deberes". Decir "hoy no" es tu derecho absoluto y no afecta tu valor ni masculinidad/feminidad.' }
            },
            q_perp2: {
                'A: Sí': { type: 'alert', text: '🛑 Alerta: Burlarse de la intimidad o cuerpo de tu pareja es Violencia Psicológica Severa. El espacio sexual debe ser un área de vulnerabilidad protegida y respetada.' },
                'B: Chantaje sutil': { type: 'warning', text: '⚠️ Usar el sexo como moneda de cambio (para castigar o premiar) destruye la confianza y la intimidad genuina en la relación.' }
            }"""

if feedback_marker in content:
    content = content.replace(feedback_marker, new_feedbacks)
elif feedback_marker_fallback in content:
    content = content.replace(feedback_marker_fallback, new_feedbacks)
else:
    print("Warning: Feedback marker not found")

# 4. Evaluar test updates
evaluar_marker = """            let v30 = Array.from(document.querySelectorAll('input[name="v30"]:checked')).map(el => parseInt(el.value));"""

new_evaluar = """            let qToxicList = [
                document.querySelector('input[name="q_toxic1"]:checked'),
                document.querySelector('input[name="q_toxic5"]:checked'),
                document.querySelector('input[name="q_toxic6"]:checked'),
                document.querySelector('input[name="q_perp1"]:checked'),
                document.querySelector('input[name="q_perp2"]:checked')
            ];
            if (qToxicList.some(el => el && el.value.startsWith('A'))) {
                html += "<div class='feedback-danger' style='border-color: #f57c00; background: #fff3e0;'><strong style='color: #e65100;'>🛑 Patrones de Riesgo Relacional:</strong> Has indicado creencias o comportamientos que justifican el abuso, culpan a las víctimas, o utilizan coerción y manipulación psicológica (como burlas corporales). Es fundamental hablar de esto para construir relaciones verdaderamente equitativas.</div>";
            }

            let v30 = Array.from(document.querySelectorAll('input[name="v30"]:checked')).map(el => parseInt(el.value));"""

if evaluar_marker in content:
    content = content.replace(evaluar_marker, new_evaluar)
else:
    print("Warning: Evaluar marker not found")

# 5. Enviar WhatsApp variables collection
wa_vars_marker = """            let q_toxic4 = getRadioVal("q_toxic4");\r
            let q19 = getCheckVals("q19");"""
wa_vars_marker_fallback = """            let q_toxic4 = getRadioVal("q_toxic4");
            let q19 = getCheckVals("q19");"""

new_wa_vars = """            let q_toxic4 = getRadioVal("q_toxic4");
            let q_toxic5 = getRadioVal("q_toxic5");
            let q_toxic6 = getRadioVal("q_toxic6");
            let q_perp1 = getRadioVal("q_perp1");
            let q_presion = getRadioVal("q_presion");
            let q_perp2 = getRadioVal("q_perp2");
            let q19 = getCheckVals("q19");"""

if wa_vars_marker in content:
    content = content.replace(wa_vars_marker, new_wa_vars)
elif wa_vars_marker_fallback in content:
    content = content.replace(wa_vars_marker_fallback, new_wa_vars)
else:
    print("Warning: WhatsApp vars marker not found")

# 6. Enviar WhatsApp message formatting
wa_msg_marker1 = """            msg += `- Preferencia Violencia sin consenso: ${q_toxic4}\\n\\n`;"""
new_wa_msg_marker1 = """            msg += `- Preferencia Violencia sin consenso: ${q_toxic4}\\n`;
            msg += `- Victim Blaming (Culpar víctima): ${q_toxic5}\\n`;
            msg += `- Mito Autocontrol Masculino: ${q_toxic6}\\n\\n`;"""

if wa_msg_marker1 in content:
    content = content.replace(wa_msg_marker1, new_wa_msg_marker1)
else:
    print("Warning: WhatsApp message 1 marker not found")

wa_msg_marker2 = """            msg += `- Empatía Sexual: ${q_empatia}\\n\\n`;"""
new_wa_msg_marker2 = """            msg += `- Empatía Sexual: ${q_empatia}\\n`;
            msg += `- Ejerció Coerción/Insistencia: ${q_perp1}\\n`;
            msg += `- Presión Social por "Rendir": ${q_presion}\\n`;
            msg += `- Usó sexo/cuerpo como arma: ${q_perp2}\\n\\n`;"""

if wa_msg_marker2 in content:
    content = content.replace(wa_msg_marker2, new_wa_msg_marker2)
else:
    print("Warning: WhatsApp message 2 marker not found")

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

print("Modificación completada exitosamente.")