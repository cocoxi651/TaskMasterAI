// Client-side OpenAI utilities for TaskFlow
// Note: In production, OpenAI API calls should be made through the backend for security
// This file provides utilities for client-side AI feature handling

interface AILogSuggestion {
  suggestion: string;
}

interface AISubtasksResponse {
  subtasks: Array<{ title: string }>;
}

/**
 * Generate a work log suggestion based on task title
 * This calls the backend API which handles the OpenAI integration
 */
export async function generateLogSuggestion(taskTitle: string): Promise<string> {
  try {
    const response = await fetch('/api/ai/suggest-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ taskTitle }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AILogSuggestion = await response.json();
    return data.suggestion;
  } catch (error) {
    console.error('Error generating log suggestion:', error);
    throw new Error('Failed to generate AI suggestion. Please try again.');
  }
}

/**
 * Generate subtasks for a project using AI
 * This calls the backend API which handles the OpenAI integration
 */
export async function generateSubtasks(
  projectName: string, 
  projectDescription?: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/ai/generate-subtasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        projectName, 
        projectDescription: projectDescription || '' 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AISubtasksResponse = await response.json();
    return data.subtasks?.map(subtask => subtask.title) || [];
  } catch (error) {
    console.error('Error generating subtasks:', error);
    throw new Error('Failed to generate subtasks. Please try again.');
  }
}

/**
 * Utility function to validate AI-generated content
 */
export function validateAIContent(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }
  
  // Basic validation - ensure content is not empty and has reasonable length
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length <= 1000;
}

/**
 * Format AI suggestions for display
 */
export function formatAISuggestion(suggestion: string): string {
  if (!suggestion) return '';
  
  // Ensure the suggestion ends with proper punctuation
  const trimmed = suggestion.trim();
  if (trimmed.length === 0) return '';
  
  const lastChar = trimmed[trimmed.length - 1];
  if (!['.', '!', '?'].includes(lastChar)) {
    return trimmed + '.';
  }
  
  return trimmed;
}

/**
 * Error handling utilities for AI features
 */
export class AIError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AIError';
  }
}

export function handleAIError(error: unknown): string {
  if (error instanceof AIError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('429')) {
      return 'AI service is currently busy. Please try again in a moment.';
    }
    if (error.message.includes('401')) {
      return 'AI service is not properly configured. Please contact support.';
    }
    if (error.message.includes('timeout')) {
      return 'AI request timed out. Please try again.';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred with the AI service.';
}

/**
 * Check if AI features are available
 */
export function isAIAvailable(): boolean {
  // In a real application, you might want to check if the API key is configured
  // or if the service is available. For now, we assume it's always available.
  return true;
}

/**
 * Get AI feature status for UI display
 */
export function getAIStatus(): {
  available: boolean;
  message: string;
} {
  const available = isAIAvailable();
  
  return {
    available,
    message: available 
      ? 'AI features are ready to help with your tasks'
      : 'AI features are currently unavailable'
  };
}
