
import { useState, useEffect } from 'react';
import { Option } from './types';
import { supabase } from '@/integrations/supabase/client';

export function useOptionsLogic(initialOptions?: Option[]) {
  const [options, setOptions] = useState<Option[]>(
    initialOptions && initialOptions.length > 0
      ? initialOptions
      : [
          { id: '1', title: '', description: '', isAIGenerated: false, isLoading: false },
          { id: '2', title: '', description: '', isAIGenerated: false, isLoading: false },
        ]
  );
  
  const [useAI, setUseAI] = useState(true);
  
  useEffect(() => {
    if (initialOptions && initialOptions.length > 0) {
      setOptions(initialOptions.map(option => ({
        ...option,
        isLoading: false
      })));
    }
  }, [initialOptions]);
  
  const addOption = () => {
    const newOption = { 
      id: Math.random().toString(36).substr(2, 9), 
      title: '', 
      description: '',
      isAIGenerated: false,
      isLoading: false
    };
    setOptions([...options, newOption]);
  };
  
  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
  };
  
  const updateOption = (id: string, field: 'title' | 'description', value: string) => {
    setOptions(options.map(o => 
      o.id === id ? { ...o, [field]: value, isAIGenerated: false } : o
    ));
  };

  const generateDescription = async (option: Option, decisionTitle: string) => {
    if (!option.title.trim() || option.isAIGenerated || option.isLoading) return;
    
    try {
      setOptions(prevOptions => prevOptions.map(o => 
        o.id === option.id ? { ...o, isLoading: true } : o
      ));
      
      const response = await supabase.functions.invoke('generateDescription', {
        body: { 
          title: option.title, 
          context: decisionTitle, 
          type: 'option' 
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setOptions(prevOptions => prevOptions.map(o => 
        o.id === option.id 
          ? { 
              ...o, 
              description: response.data.description, 
              isLoading: false 
            } 
          : o
      ));
    } catch (error) {
      console.error('Erreur lors de la génération de description:', error);
      
      setOptions(prevOptions => prevOptions.map(o => 
        o.id === option.id ? { ...o, isLoading: false } : o
      ));
    }
  };
  
  const handleTitleBlur = (option: Option, decisionTitle: string) => {
    if (option.title.trim() && (!option.description || option.description.trim() === '')) {
      generateDescription(option, decisionTitle);
    }
  };
  
  const isValid = (options.length >= 2 && options.some(o => o.title.trim() !== '')) || useAI;

  return {
    options,
    useAI,
    setUseAI,
    addOption,
    removeOption,
    updateOption,
    handleTitleBlur,
    isValid
  };
}
