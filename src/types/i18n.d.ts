declare module 'vue-i18n' {
  export interface DefineLocaleMessage {
    common: {
      darkMode: string;
      language: string;
      welcome: string;
      login: string;
      register: string;
    };
    benefit: {
      settings: string;
      title: string;
      description: string;
      status: string;
      action: string;
      active: string;
      inactive: string;
      edit: string;
      delete: string;
      confirm: string;
      cancel: string;
      addNew: string;
      search: string;
      filterStatus: string;
    };
    menu: {
      benefitSettings: {
        title: string;
        list: {
          header: string;
          columns: {
            name: string;
            code: string;
            description: string;
            status: string;
            actions: string;
          };
        };
      };
    };
    benefitSettings: {
      title: string;
      header: string;
      selectWebsite: string;
      addLevel: string;
      loading: string;
      error: {
        title: string;
        retry: string;
      };
      delete: {
        success: string;
        error: string;
      };
    };
  }
} 