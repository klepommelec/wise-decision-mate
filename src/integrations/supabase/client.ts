
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dghezzwmzzfaqmoqdvdl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnaGV6endtenpmYXFtb3FkdmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjQ5MDksImV4cCI6MjA1NjI0MDkwOX0.GvM5C1Qlm9Gquk4eoQ-qWAOeTXb7vDX7hWUrRJVDInI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add interfaces for our app's data structure
export interface Option {
  id: string;
  title: string;
  description: string;
  isAIGenerated?: boolean;
  decision_id?: string;
}

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  isAIGenerated?: boolean;
  decision_id?: string;
}

export interface Evaluation {
  optionId: string;
  criterionId: string;
  score: number;
  decision_id?: string;
}

// Add interfaces for the database tables
export interface DatabaseOption {
  id: string;
  title: string;
  description: string | null;
  decision_id: string;
  created_at?: string;
}

export interface DatabaseCriterion {
  id: string;
  name: string;
  weight: number;
  decision_id: string;
  created_at?: string;
}

export interface DatabaseEvaluation {
  id: string;
  option_id: string;
  criterion_id: string;
  score: number;
  decision_id: string;
  created_at?: string;
}

// Utility functions for data conversion
export const mapOptionFromDB = (dbOption: DatabaseOption): Option => ({
  id: dbOption.id,
  title: dbOption.title,
  description: dbOption.description || '',
  decision_id: dbOption.decision_id
});

export const mapCriterionFromDB = (dbCriterion: DatabaseCriterion): Criterion => ({
  id: dbCriterion.id,
  name: dbCriterion.name,
  weight: dbCriterion.weight,
  decision_id: dbCriterion.decision_id
});

export const mapEvaluationFromDB = (dbEvaluation: DatabaseEvaluation): Evaluation => ({
  optionId: dbEvaluation.option_id,
  criterionId: dbEvaluation.criterion_id,
  score: dbEvaluation.score,
  decision_id: dbEvaluation.decision_id
});
