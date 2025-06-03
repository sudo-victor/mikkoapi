export type CategorizeExtractStatus = 'PENDING' | 'PROCESSING' | 'FAILED' | 'PROCESSED';

export type CategorizeExtract = {
  id: string;
  onboardingId: string;
  status: CategorizeExtractStatus;
  retryCount: number;
  lastProcessedAt?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
