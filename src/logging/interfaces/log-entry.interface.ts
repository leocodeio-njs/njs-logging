export interface ILogEntry {
  timestamp: string;
  level: string;
  message: string;
  correlationId: string;
  context?: any;
  metadata?: any;
  type?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  response?: any;
  duration?: string;
  error?: any;
} 