export interface SystemConfig {
  DateBeforeDowngrade: number;
  SendMailBeforeDowngrade: boolean;
  SendMailAfterDowngrade: boolean;
  SendZaloOABeforeDowngrade: boolean;
  SendZaloOAAfterDowngrade: boolean;
  Sky007ExpirationPointMonth: number;
  BbiaExpirationPointMonth: number;
  HinceExpirationPointMonth: number;
  MixsoonExpirationPointMonth: number;
  AccessTokenZalo: string;
  RefreshTokenZalo: string;
  ElasticEmailSender: string;
  ElasticEmailApi: string;
} 