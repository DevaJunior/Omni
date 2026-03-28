// Interface para tipar os dados enviados ao Python
export interface FuzzyInputData {
  ph: number;
  concentration: number;
  biomass: number;
}

// Interface para tipar a resposta do Python
export interface FuzzyResultData {
  efficiency: number;
  status: string;
  details: string;
}

const API_URL = 'http://localhost:5000/api';

export const analyzeFuzzyData = async (data: FuzzyInputData): Promise<FuzzyResultData> => {
  try {
    const response = await fetch(`${API_URL}/analyze-fuzzy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: Status ${response.status}`);
    }

    const result: FuzzyResultData = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao processar dados P-Fuzzy:', error);
    throw error;
  }
};