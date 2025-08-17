// types.ts

export interface PresentationContext {
  title: string;
  purpose: string;
  audience: string;
  comments?: string; // Optional field for user's general comments
}

export interface AnalysisSection {
  score: number;
  feedback: string;
}

export interface FillerWordAnalysis extends AnalysisSection {
  density: number;
  count: number;
  flaggedSections: string[];
}

export interface ClarityConciseness extends AnalysisSection {
  wordiness: number;
  jargonLevel: number;
  suggestions: string[];
}

export interface StructuralFlow extends AnalysisSection {
  transitionQuality: number;
  logicalProgression: number;
  weakPoints: string[];
}

export interface EngagementImpact extends AnalysisSection {
  emotionalResonance: number;
  callToActionStrength: number;
  memorability: number;
}

export interface VisualFlowSegment {
  section: string; // e.g., "Introduction", "Main Point 1"
  rating: 'good' | 'average' | 'poor';
  description: string;
}

export interface AnalysisReport {
  overallScore: number;
  fillerWordAnalysis: FillerWordAnalysis;
  clarityConciseness: ClarityConciseness;
  structuralFlow: StructuralFlow;
  engagementImpact: EngagementImpact;
  visualFlow: VisualFlowSegment[];
}
