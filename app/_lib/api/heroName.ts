import { ApiError } from '../errors';

const API_BASE_URL = '/api';

export async function generateHeroNameApi(
  personality: string,
  gender: 'male' | 'female',
  color: string
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/hero-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        personality, 
        gender, 
        color 
      }),
    });

    if (!response.ok) {
      throw new ApiError('Failed to generate hero name', response.status);
    }

    const data = await response.json();
    
    if (!data.name) {
      throw new ApiError('No hero name received from server');
    }

    return data.name;
  } catch (error) {
    console.error('Error generating hero name:', error);
    throw error instanceof ApiError ? error : new ApiError('Network error occurred');
  }
}
