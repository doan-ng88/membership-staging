export type CriteriaType = 'purchaseAmount';
export type RuleType = 'levelUp' | 'levelDown';

export interface Rule {
  criteriaType: CriteriaType;
  description: string;
}

export interface RuleForm extends Rule {
  ruleType: RuleType;
}

export interface BrandRules {
  levelUp: Rule[];
  levelDown: Rule[];
}

export interface RulesDataType {
  [key: string]: BrandRules; // index signature for brand keys
}

export const criteriaTranslations: Record<CriteriaType, string> = {
  purchaseAmount: 'Tổng Số Tiền Mua Hàng',
  // purchaseFrequency: 'Tần Suất Mua Hàng',
  // evaluationPeriod: 'Thời Gian Đánh Giá'
};

export const defaultRule: RuleForm = {
  ruleType: '' as RuleType,
  criteriaType: '' as CriteriaType,
  description: ''
};

export const rulesData: RulesDataType = {
  sky007: {
    levelUp: [
      {
        criteriaType: 'purchaseAmount',
        description: 'Mua trên 1.500.000đ trong vòng 6 tháng.'
      },
      // {
      //   criteriaType: 'purchaseFrequency',
      //   description: 'Mua trên 5 lần trong vòng 6 tháng.'
      // },
      // {
      //   criteriaType: 'evaluationPeriod',
      //   description: 'Đánh giá hàng tháng.'
      // }
    ],
    levelDown: [
      {
        criteriaType: 'purchaseAmount',
        description: 'Mua dưới 1.000.000đ trong vòng 6 tháng.'
      },
      // {
      //   criteriaType: 'purchaseFrequency',
      //   description: 'Mua dưới 2 lần trong vòng 6 tháng.'
      // }
    ]
  },
  hince: {
    levelUp: [
      {
        criteriaType: 'purchaseAmount',
        description: 'Mua trên 3.500.000đ trong vòng 6 tháng.'
      },
      // {
      //   criteriaType: 'purchaseFrequency',
      //   description: 'Mua trên 10 lần trong vòng 6 tháng.'
      // },
      // {
      //   criteriaType: 'evaluationPeriod',
      //   description: 'Đánh giá hàng tháng.'
      // }
    ],
    levelDown: [
      {
        criteriaType: 'purchaseAmount',
        description: 'Mua dưới 2.500.000đ trong vòng 6 tháng.'
      },
      // {
      //   criteriaType: 'purchaseFrequency',
      //   description: 'Mua dưới 4 lần trong vòng 6 tháng.'
      // }
    ]
  },
  mixsoon: {
    levelUp: [
      {
        criteriaType: 'purchaseAmount',
        description: 'Mua trên 1.500.000đ trong vòng 6 tháng.'
      },
      // {
      //   criteriaType: 'purchaseFrequency',
      //   description: 'Mua trên 8 lần trong vòng 6 tháng.'
      // },
      // {
      //   criteriaType: 'evaluationPeriod',
      //   description: 'Đánh giá hàng tháng.'
      // }
    ],
    levelDown: [
      {
        criteriaType: 'purchaseAmount',
        description: 'Mua dưới 1.000.000đ trong vòng 6 tháng.'
      },
      // {
      //   criteriaType: 'purchaseFrequency',
      //   description: 'Mua dưới 3 lần trong vòng 6 tháng.'
      // }
    ]
  }
};

export const isValidCriteriaType = (type: string): type is CriteriaType => {
  return ['purchaseAmount', 'evaluationPeriod'].includes(type);
};

export const isValidRuleType = (type: string): type is RuleType => {
  return ['levelUp', 'levelDown'].includes(type);
};

export const createEmptyRule = (): RuleForm => ({
  ...defaultRule
});

export const validateRule = (rule: Partial<RuleForm>): rule is RuleForm => {
  return (
    isValidRuleType(rule.ruleType as string) &&
    isValidCriteriaType(rule.criteriaType as string) &&
    typeof rule.description === 'string' &&
    rule.description.length > 0
  );
};

// export interface LevelUpDownRule {
//   id: number;
//   levelId: number;
//   levelName: string;
//   websiteId: number;
//   ruleType: 'levelUp' | 'levelDown';
//   criteria: string;
//   pointsRate: number;
//   specialServices: string;
//   isActive: boolean;
// }

// export interface RuleFormData extends Omit<LevelUpDownRule, 'id'> {
//   id?: number;
// }

// export const DEFAULT_RULE: RuleFormData = {
//   levelId: 0,
//   levelName: '',
//   websiteId: 1,
//   ruleType: 'levelUp',
//   criteria: '',
//   pointsRate: 0,
//   specialServices: '',
//   isActive: true
// }

export interface LevelSetting {
  id: number;
  levelName: string;
  websiteId: number;
}

export interface LevelUpDownRule {
  id: number;
  levelName: string;
  websiteId: number;
  criteria: string;
}

// Mapping điều kiện và dịch vụ đặc biệt theo level
export const LEVEL_CRITERIA_MAP: Record<string, string> = {
  'Bạc': 'Sau khi hoàn thành đăng ký tài khoản thành viên trên website.',
  'Vàng': 'Mua trên 1.500.000đ trong vòng 6 tháng.',
  'Kim Cương': 'Mua trên 4.000.000đ trong vòng 6 tháng'
};

export const LEVEL_SERVICES_MAP: Record<string, string> = {
  'Bạc': 'Không hỗ trợ',
  'Vàng': 'Voucher miễn phí vận chuyển, gói quà miễn phí',
  'Kim Cương': 'Voucher giảm giá, voucher vận chuyển, gói quà miễn phí, giảm giá đơn hàng'
};

// export const mockRules: LevelUpDownRule[] = [
//   {
//     id: 1,
//     levelName: 'Bạc',
//     criteria: 'Sau khi hoàn thành đăng ký tài khoản thành viên trên website.',
//     specialServices: 'Không hỗ trợ',
//     websiteId: 1
//   },
//   {
//     id: 2,
//     levelName: 'Vàng',
//     criteria: 'Mua trên 1.500.000đ trong vòng 6 tháng.',
//     specialServices: 'Voucher miễn phí vận chuyển, gói quà miễn phí',
//     websiteId: 1
//   },
//   {
//     id: 3,
//     levelName: 'Kim Cương',
//     criteria: 'Mua trên 4.000.000đ trong vòng 6 tháng',
//     specialServices: 'Voucher giảm giá, voucher vận chuyển, gói quà miễn phí, giảm giá đơn hàng',
//     websiteId: 1
//   }
// ];

export const levelUpDownRulesService = {
  async getLevelSettings(): Promise<LevelSetting[]> {
    const response = await fetch('/api/membership/get/get-level-setting');
    return response.json();
  },

  async getRules(websiteId: number): Promise<LevelUpDownRule[]> {
    // Giả lập API call với mock data
    return mockRules.filter(rule => rule.websiteId === websiteId);
  }
};