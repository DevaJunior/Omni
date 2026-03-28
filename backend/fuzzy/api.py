from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

app = Flask(__name__)
# Habilita CORS para permitir que o React (na porta 3000 ou 5173) acesse o Flask
CORS(app)

def process_fuzzy_logic(ph_val, conc_val, bio_val):
    """
    Simulação de Motor de Inferência P-Fuzzy para Rizo Filtração.
    As regras e funções de pertinência devem ser ajustadas conforme sua dissertação.
    """
    # 1. Definição das Variáveis de Entrada (Antecedentes)
    ph = ctrl.Antecedent(np.arange(0, 15, 1), 'ph')
    concentration = ctrl.Antecedent(np.arange(0, 101, 1), 'concentration')
    biomass = ctrl.Antecedent(np.arange(0, 51, 1), 'biomass')

    # 2. Definição da Variável de Saída (Consequente)
    efficiency = ctrl.Consequent(np.arange(0, 101, 1), 'efficiency')

    # 3. Funções de Pertinência (Membership Functions)
    ph.automf(3, names=['acido', 'neutro', 'alcalino'])
    concentration.automf(3, names=['baixa', 'media', 'alta'])
    biomass.automf(3, names=['pouca', 'adequada', 'excessiva'])

    # Saída (Eficiência em %)
    efficiency['baixa'] = fuzz.trimf(efficiency.universe, [0, 0, 50])
    efficiency['media'] = fuzz.trimf(efficiency.universe, [20, 50, 80])
    efficiency['alta'] = fuzz.trimf(efficiency.universe, [50, 100, 100])

    # 4. Base de Regras P-Fuzzy (Exemplos biotecnológicos)
    # Regra 1: Se pH é neutro E biomassa é adequada, então eficiência é alta.
    rule1 = ctrl.Rule(ph['neutro'] & biomass['adequada'], efficiency['alta'])
    
    # Regra 2: Se pH é ácido OU concentração é alta, então eficiência cai.
    rule2 = ctrl.Rule(ph['acido'] | concentration['alta'], efficiency['baixa'])
    
    # Regra 3: Condições medianas
    rule3 = ctrl.Rule(ph['alcalino'] & concentration['media'], efficiency['media'])

    # 5. Sistema de Controle e Simulação
    rizo_ctrl = ctrl.ControlSystem([rule1, rule2, rule3])
    rizo_sim = ctrl.ControlSystemSimulation(rizo_ctrl)

    # 6. Passando os inputs recebidos do React
    rizo_sim.input['ph'] = ph_val
    rizo_sim.input['concentration'] = conc_val
    rizo_sim.input['biomass'] = bio_val

    # 7. Computando o resultado (Defuzzificação)
    try:
        rizo_sim.compute()
        output_efficiency = rizo_sim.output['efficiency']
        
        status = "Ótimo" if output_efficiency > 75 else "Alerta" if output_efficiency < 40 else "Estável"
        
        return {
            "efficiency": float(output_efficiency),
            "status": status,
            "details": f"Cálculo P-Fuzzy concluído. Centroide localizado em {output_efficiency:.2f}% do universo de discurso."
        }
    except Exception as e:
        # Fallback caso os valores caiam fora das regras definidas
        return {
            "efficiency": 0.0,
            "status": "Erro de Regra",
            "details": f"As variáveis não ativaram nenhuma regra na base de conhecimento. Erro: {str(e)}"
        }

@app.route('/api/analyze-fuzzy', methods=['POST'])
def analyze_fuzzy():
    try:
        data = request.get_json()
        
        # Extração dos dados enviados pelo Fetch
        ph = float(data.get('ph', 7.0))
        concentration = float(data.get('concentration', 0.0))
        biomass = float(data.get('biomass', 0.0))

        # Processamento
        result = process_fuzzy_logic(ph, concentration, biomass)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Roda o servidor na porta 5000
    app.run(debug=True, port=5000)