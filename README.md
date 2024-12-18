# membership-management-actsonevn

## Project Structure
src/
├── assets/
│   ├── css/
│   │   ├── satoshi.css
│   │   └── style.css
│   ├── fonts/
│   └── images/
│       ├── favicon.ico
│       ├── logo/
│       ├── user/
│       └── cover/
├── components/
│   ├── Charts/
│   │   ├── ChartOne.vue
│   │   ├── ChartTwo.vue
│   │   └── ChartThree.vue
│   ├── Header/
│   │   ├── DarkModeSwitcher.vue
│   │   ├── DropdownNotification.vue
│   │   ├── DropdownUser.vue
│   │   └── HeaderArea.vue
│   ├── Sidebar/
│   │   └── SidebarArea.vue
│   ├── Tables/
│   │   └── TableOne.vue
│   ├── Forms/
│   │   └── SelectGroup/
│   │       └── SelectGroupOne.vue
│   ├── ProfileCard.vue
│   └── DataStats/
│       └── DataStatsOne.vue
├── router/
│   └── index.ts
├── views/
│   ├── Authentication/
│   │   ├── SigninView.vue
│   │   └── SignupView.vue
│   ├── CallCampaign/
│   │   └── CallCampaignView.vue
│   ├── MailIntegration/
│   │   ├── ApiConfigurationView.vue
│   │   ├── CampaignView.vue
│   │   ├── MemberDataSyncView.vue
│   │   ├── TemplateManagementView.vue
│   │   └── PerformanceAnalysisView.vue
│   ├── MarketingPerformance/
│   │   ├── CampaignEffectAnalysisView.vue
│   │   └── ChannelPerformanceView.vue
│   ├── MemberAnalysis/
│   │   ├── PurchasePatternAnalysisView.vue
│   │   └── LevelAnalysisView.vue
│   ├── MemberInformation/
│   │   ├── PointRewardView.vue
│   │   ├── PurchaseHistoryView.vue
│   │   └── ProfileView.vue
│   ├── MemberLevelDefinition/
│   │   ├── AutomaticLevelAdjustmentView.vue
│   │   ├── BenefitSettingsView.vue
│   │   ├── LevelUpDownRulesView.vue
│   │   └── LevelSettingsView.vue
│   ├── MemberSegment/
│   │   └── MemberSegmentView.vue
│   ├── ProCampaign/
│   │   ├── RegularCampaignsView.vue
│   │   └── SpecialPromotionView.vue
│   ├── ProCouponVoucher/
│   │   ├── CouponTypesView.vue
│   │   ├── IssueConditionsView.vue
│   │   └── UsageHistoryView.vue
│   ├── ProRewardProgram/
│   │   └── PointAccrutalRulesView.vue
│   ├── SalesAnalysis/
│   │   ├── PromotionSalesView.vue
│   │   └── ProductSalesView.vue
│   ├── SmsManagement/
│   │   └── SmsManagementView.vue
│   ├── SystemMonitoring/
│   │   ├── LogManagementView.vue
│   │   └── PerformanceMonitoringView.vue
│   └── AppPush/
│       └── PushMessageView.vue
├── main.ts
└── App.vue