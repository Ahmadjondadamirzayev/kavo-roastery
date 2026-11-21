export type Language = 'en' | 'ru' | 'uz';

export interface TranslationDictionary {
  brand: string;
  nav: {
    menu: string;
    origins: string;
    story: string;
    admin: string;
    cart: string;
    storefront: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    roasteryNote: string;
    metrics: {
      lotsLabel: string;
      lotsValue: string;
      roastLabel: string;
      roastValue: string;
      extractionLabel: string;
      extractionValue: string;
      waterLabel: string;
      waterValue: string;
    };
  };
  menu: {
    sectionTitle: string;
    sectionSubtitle: string;
    searchPlaceholder: string;
    categories: {
      all: string;
      hot: string;
      iced: string;
      brew: string;
      beans: string;
    };
    customize: string;
    outOfStock: string;
    featured: string;
    emptySearch: string;
    clearFilters: string;
    loading: string;
    loadError: string;
    retry: string;
  };
  story: {
    kicker: string;
    title: string;
    body: string;
    pillars: {
      title: string;
      detail: string;
    }[];
  };
  footer: {
    tagline: string;
    hoursLabel: string;
    hoursValue: string;
    addressLabel: string;
    addressValue: string;
    rights: string;
  };
  modal: {
    close: string;
    originLabel: string;
    tastingLabel: string;
    sizeLabel: string;
    bagWeightLabel: string;
    sizes: {
      S: string;
      M: string;
      L: string;
    };
    bagSizes: {
      S: string;
      M: string;
      L: string;
    };
    roastLabel: string;
    roasts: {
      light: string;
      medium: string;
      dark: string;
    };
    milkLabel: string;
    milks: {
      none: string;
      whole: string;
      oat: string;
      almond: string;
      coconut: string;
    };
    sugarLabel: string;
    sugarLevels: {
      '0': string;
      '25': string;
      '50': string;
      '100': string;
    };
    quantityLabel: string;
    addToOrder: string;
    unavailable: string;
  };
  cart: {
    title: string;
    emptyTitle: string;
    emptyBody: string;
    browseMenu: string;
    remove: string;
    subtotal: string;
    total: string;
    proceedCheckout: string;
    backToBag: string;
    checkoutTitle: string;
    customerName: string;
    customerNamePlaceholder: string;
    customerPhone: string;
    customerPhonePlaceholder: string;
    serviceMode: string;
    modeTable: string;
    modeDelivery: string;
    tableNumber: string;
    tablePlaceholder: string;
    deliveryAddress: string;
    addressPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    placeOrder: string;
    submitting: string;
    confirmationTitle: string;
    confirmationSubtitle: string;
    orderNumberLabel: string;
    newOrder: string;
    validation: {
      nameRequired: string;
      phoneRequired: string;
      locationRequired: string;
      submitFailed: string;
    };
  };
  toasts: {
    addedToCart: string;
    orderPlaced: string;
    statusUpdated: string;
    productUpdated: string;
    productCreated: string;
    signedOut: string;
    authError: string;
  };
  admin: {
    consoleTitle: string;
    backToStore: string;
    signOut: string;
    greetings: {
      morning: string;
      afternoon: string;
      evening: string;
    };
    loginPrompt: string;
    signInGoogle: string;
    signingIn: string;
    verifyingAccess: string;
    restrictedTitle: string;
    restrictedBody: string;
    signedInAs: string;
    switchAccount: string;
    tabs: {
      orders: string;
      catalog: string;
      logs: string;
    };
    kpis: {
      revenue: string;
      activeOrders: string;
      completedOrders: string;
      loginAttempts: string;
    };
    orders: {
      filterAll: string;
      refresh: string;
      liveConnected: string;
      liveReconnecting: string;
      empty: string;
      orderCol: string;
      customerCol: string;
      locationCol: string;
      itemsCol: string;
      totalCol: string;
      statusCol: string;
      timeCol: string;
      tablePrefix: string;
      deliveryPrefix: string;
      statuses: {
        pending: string;
        brewing: string;
        ready: string;
        completed: string;
        cancelled: string;
      };
    };
    catalog: {
      addTitle: string;
      addButton: string;
      nameEn: string;
      nameRu: string;
      nameUz: string;
      descriptionEn: string;
      originEn: string;
      tastingNotesEn: string;
      category: string;
      priceUsd: string;
      createProduct: string;
      creating: string;
      inStock: string;
      paused: string;
      toggleStock: string;
    };
    logs: {
      title: string;
      emailCol: string;
      nameCol: string;
      statusCol: string;
      timeCol: string;
      granted: string;
      denied: string;
      empty: string;
    };
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    brand: 'KAVO ROASTERY',
    nav: {
      menu: 'Menu',
      origins: 'Origins',
      story: 'Craft',
      admin: 'Barista Desk',
      cart: 'Bag',
      storefront: 'Storefront',
    },
    hero: {
      kicker: 'Single-Origin Coffee Bar & Micro-Roastery',
      title: 'Precision-roasted coffee, poured to the gram.',
      subtitle:
        'Exclusively specialty coffee—from syrupy 9-bar ristretto shots and silky flat whites to hand-poured single-estate V60 lots and fresh whole beans.',
      ctaPrimary: 'Explore Coffee Menu',
      ctaSecondary: 'Our Roasting Philosophy',
      roasteryNote: 'Roasted in small 12kg batches every Tuesday and Friday.',
      metrics: {
        lotsLabel: 'Active Micro-Lots',
        lotsValue: '12 Origins',
        roastLabel: 'Roast Cadence',
        roastValue: '48h Fresh',
        extractionLabel: 'Espresso Target',
        extractionValue: '9.0 Bar · 93°C',
        waterLabel: 'Mineral Water',
        waterValue: '72 ppm TDS',
      },
    },
    menu: {
      sectionTitle: 'The Coffee Menu',
      sectionSubtitle: 'Every drink and bean bag is calibrated to order—choose your roast profile, size, and milk.',
      searchPlaceholder: 'Search espresso, V60, cold brew, origin...',
      categories: {
        all: 'All Coffee',
        hot: 'Hot Espresso',
        iced: 'Iced Coffee',
        brew: 'Brew Methods',
        beans: 'Whole Beans',
      },
      customize: 'Customize',
      outOfStock: 'Sold Out',
      featured: 'Roaster Pick',
      emptySearch: 'No coffee matches your current search or category filter.',
      clearFilters: 'Reset Filters',
      loading: 'Preparing coffee menu...',
      loadError: 'Unable to load the coffee menu right now.',
      retry: 'Try Again',
    },
    story: {
      kicker: 'Roasting & Extraction Craft',
      title: 'Built strictly around the coffee bean.',
      body: 'We never dilute our bar with syrups or non-coffee distractions. Every shot is dialed in each morning on precision scales, using remineralized water and traceably sourced high-elevation Arabica.',
      pillars: [
        {
          title: '01. High-Elevation Sourcing',
          detail: 'Washed and natural micro-lots grown between 1,750m and 2,150m in Ethiopia, Colombia, Kenya, and Panama.',
        },
        {
          title: '02. Custom Curve Roasting',
          detail: 'Light and medium-light profiles engineered to preserve delicate jasmine florals, stone fruit, and cacao sweetness.',
        },
        {
          title: '03. Made-to-Order Calibration',
          detail: 'Select your cup size, roast level, milk texture, and sweetness directly before your barista pulls the shot.',
        },
      ],
    },
    footer: {
      tagline: 'Pure specialty coffee, roasted and brewed daily.',
      hoursLabel: 'Bar Hours',
      hoursValue: '07:30 — 22:00 Daily',
      addressLabel: 'Roastery Bar',
      addressValue: '14 Amir Temur Avenue, Tashkent',
      rights: 'Kavo Roastery. Strictly Specialty Coffee.',
    },
    modal: {
      close: 'Close',
      originLabel: 'Origin',
      tastingLabel: 'Tasting Notes',
      sizeLabel: 'Cup Size',
      bagWeightLabel: 'Bag Weight',
      sizes: {
        S: 'Small · 250 ml',
        M: 'Medium · 350 ml (+$0.70)',
        L: 'Large · 450 ml (+$1.40)',
      },
      bagSizes: {
        S: '250g Bag',
        M: '500g Bag',
        L: '1kg Roaster Bag',
      },
      roastLabel: 'Roast Profile',
      roasts: {
        light: 'Light · Floral & Bright',
        medium: 'Medium · Balanced',
        dark: 'Dark · Rich Cacao',
      },
      milkLabel: 'Milk Selection',
      milks: {
        none: 'Black / No Milk',
        whole: 'Whole Farm Milk',
        oat: 'Barista Oat (+$0.80)',
        almond: 'Roasted Almond (+$0.80)',
        coconut: 'Organic Coconut (+$0.90)',
      },
      sugarLabel: 'Sweetness Level',
      sugarLevels: {
        '0': '0% Unsweetened',
        '25': '25% Subtle',
        '50': '50% Moderate',
        '100': '100% Classic',
      },
      quantityLabel: 'Quantity',
      addToOrder: 'Add to Bag',
      unavailable: 'Currently Unavailable',
    },
    cart: {
      title: 'Your Coffee Bag',
      emptyTitle: 'Your bag is empty',
      emptyBody: 'Select an espresso, filter pour-over, or fresh bean bag to begin your order.',
      browseMenu: 'Browse Coffee Menu',
      remove: 'Remove',
      subtotal: 'Subtotal',
      total: 'Total Due',
      proceedCheckout: 'Proceed to Checkout',
      backToBag: 'Back to Bag',
      checkoutTitle: 'Order Details',
      customerName: 'Full Name',
      customerNamePlaceholder: 'e.g. Azizbek Karimov',
      customerPhone: 'Phone Number',
      customerPhonePlaceholder: '+998 90 123 45 67',
      serviceMode: 'Service Type',
      modeTable: 'Table Service',
      modeDelivery: 'Courier Delivery',
      tableNumber: 'Table Number',
      tablePlaceholder: 'e.g. Table 04',
      deliveryAddress: 'Delivery Address',
      addressPlaceholder: 'Street, building, apartment or entrance',
      notesLabel: 'Barista Notes (Optional)',
      notesPlaceholder: 'Extra hot, separate lid, grind for V60...',
      placeOrder: 'Submit Coffee Order',
      submitting: 'Sending to Barista...',
      confirmationTitle: 'Order Sent to the Bar',
      confirmationSubtitle: 'Our baristas have received your ticket and started calibrating.',
      orderNumberLabel: 'Order Reference',
      newOrder: 'Start Another Order',
      validation: {
        nameRequired: 'Please enter your name (at least 2 characters).',
        phoneRequired: 'Please provide a valid contact phone number.',
        locationRequired: 'Please enter your table number or delivery address.',
        submitFailed: 'Could not submit order. Please review your details and retry.',
      },
    },
    toasts: {
      addedToCart: 'Added to your coffee bag.',
      orderPlaced: 'Coffee order confirmed and sent to the bar.',
      statusUpdated: 'Order status updated.',
      productUpdated: 'Coffee menu item updated.',
      productCreated: 'New coffee added to menu.',
      signedOut: 'Signed out safely.',
      authError: 'Google sign-in could not be completed.',
    },
    admin: {
      consoleTitle: 'Barista Command Desk',
      backToStore: 'Storefront',
      signOut: 'Sign Out',
      greetings: {
        morning: 'Good Morning & Welcome, Barista Master!',
        afternoon: 'Good Afternoon & Welcome, Barista Master!',
        evening: 'Good Evening & Welcome, Barista Master!',
      },
      loginPrompt: 'Please sign in with Google to continue.',
      signInGoogle: 'Sign in with Google',
      signingIn: 'Connecting to Google...',
      verifyingAccess: 'Verifying barista credentials...',
      restrictedTitle: 'Access Restricted — Pending Admin Approval',
      restrictedBody:
        'Your Google sign-in has been logged for review, but this account does not yet hold administrator permissions for the roastery console.',
      signedInAs: 'Signed in as',
      switchAccount: 'Switch Google Account',
      tabs: {
        orders: 'Live Order Feed',
        catalog: 'Coffee Catalog',
        logs: 'Sign-In Audit Logs',
      },
      kpis: {
        revenue: 'Total Order Value',
        activeOrders: 'Active in Bar',
        completedOrders: 'Completed Cups',
        loginAttempts: 'Auth Events',
      },
      orders: {
        filterAll: 'All Orders',
        refresh: 'Refresh',
        liveConnected: 'Live Sync Active',
        liveReconnecting: 'Syncing...',
        empty: 'No orders match this status yet.',
        orderCol: 'Order',
        customerCol: 'Guest',
        locationCol: 'Table / Address',
        itemsCol: 'Coffee Selection',
        totalCol: 'Total',
        statusCol: 'Stage',
        timeCol: 'Placed',
        tablePrefix: 'Table',
        deliveryPrefix: 'Delivery',
        statuses: {
          pending: 'Pending',
          brewing: 'Brewing',
          ready: 'Ready',
          completed: 'Completed',
          cancelled: 'Cancelled',
        },
      },
      catalog: {
        addTitle: 'Add Specialty Coffee',
        addButton: 'Add Coffee',
        nameEn: 'Name (EN)',
        nameRu: 'Name (RU)',
        nameUz: 'Name (UZ)',
        descriptionEn: 'Description (EN)',
        originEn: 'Origin',
        tastingNotesEn: 'Tasting Notes',
        category: 'Category',
        priceUsd: 'Base Price ($)',
        createProduct: 'Save to Menu',
        creating: 'Saving...',
        inStock: 'Available',
        paused: 'Paused',
        toggleStock: 'Toggle Stock',
      },
      logs: {
        title: 'Google Authentication Activity',
        emailCol: 'Google Email',
        nameCol: 'Account Name',
        statusCol: 'Access Result',
        timeCol: 'Timestamp',
        granted: 'Granted',
        denied: 'Pending Approval',
        empty: 'No sign-in events recorded yet.',
      },
    },
  },
  ru: {
    brand: 'KAVO ROASTERY',
    nav: {
      menu: 'Меню',
      origins: 'Происхождение',
      story: 'Мастерство',
      admin: 'Панель Бариста',
      cart: 'Заказ',
      storefront: 'Витрина',
    },
    hero: {
      kicker: 'Спешелти Кофейня и Микро-Обжарка',
      title: 'Кофе точной обжарки, приготовленный до грамма.',
      subtitle:
        'Исключительно спешелти-кофе: от плотного ристретто на 9 барах и бархатного флэт уайта до ручного заваривания V60 и свежеобжаренного зерна.',
      ctaPrimary: 'Открыть Меню Кофе',
      ctaSecondary: 'Философия Обжарки',
      roasteryNote: 'Обжариваем малыми партиями по 12 кг каждый вторник и пятницу.',
      metrics: {
        lotsLabel: 'Активные Микролоты',
        lotsValue: '12 Регионов',
        roastLabel: 'Свежесть Зерна',
        roastValue: '48 часов',
        extractionLabel: 'Стандарт Эспрессо',
        extractionValue: '9.0 Бар · 93°C',
        waterLabel: 'Минерализация',
        waterValue: '72 ppm TDS',
      },
    },
    menu: {
      sectionTitle: 'Кофейная Карта',
      sectionSubtitle: 'Каждый напиток и пачка зерна настраиваются под ваш вкус — выберите профиль обжарки, объём и молоко.',
      searchPlaceholder: 'Поиск эспрессо, V60, колд брю, региона...',
      categories: {
        all: 'Весь Кофе',
        hot: 'Горячий Эспрессо',
        iced: 'Холодный Кофе',
        brew: 'Альтернатива',
        beans: 'Кофе в Зёрнах',
      },
      customize: 'Настроить',
      outOfStock: 'Нет в наличии',
      featured: 'Выбор Ростера',
      emptySearch: 'По вашему запросу кофе не найден.',
      clearFilters: 'Сбросить Фильтры',
      loading: 'Загружаем кофейную карту...',
      loadError: 'Не удалось загрузить меню кофе.',
      retry: 'Повторить',
    },
    story: {
      kicker: 'Обжарка и Экстракция',
      title: 'Всё внимание — только кофейному зерну.',
      body: 'Мы не отвлекаемся на посторонние напитки и сиропы. Каждое утро бариста калибруют помол на прецизионных весах, используя реминерализованную воду и отборную высокогорную арабику.',
      pillars: [
        {
          title: '01. Высокогорные Микролоты',
          detail: 'Отборная арабика мытой и натуральной обработки с высот 1750–2150 м из Эфиопии, Колумбии, Кении и Панамы.',
        },
        {
          title: '02. Авторский Профиль Обжарки',
          detail: 'Светлая и средне-светлая обжарка, раскрывающая ноты жасмина, косточковых фруктов и тёмного какао.',
        },
        {
          title: '03. Настройка Под Каждый Заказ',
          detail: 'Выберите объём, степень обжарки, альтернативное молоко и уровень сладости перед передачей заказа в бар.',
        },
      ],
    },
    footer: {
      tagline: 'Чистый спешелти-кофе ежедневной обжарки и заваривания.',
      hoursLabel: 'Часы Работы',
      hoursValue: '07:30 — 22:00 Ежедневно',
      addressLabel: 'Кофейня-Ростерия',
      addressValue: 'пр. Амира Темура, 14, Ташкент',
      rights: 'Kavo Roastery. Только Спешелти Кофе.',
    },
    modal: {
      close: 'Закрыть',
      originLabel: 'Регион',
      tastingLabel: 'Вкусовой Профиль',
      sizeLabel: 'Объём Чашки',
      bagWeightLabel: 'Вес Упаковки',
      sizes: {
        S: 'Малый · 250 мл',
        M: 'Средний · 350 мл (+$0.70)',
        L: 'Большой · 450 мл (+$1.40)',
      },
      bagSizes: {
        S: 'Пачка 250г',
        M: 'Пачка 500г',
        L: 'Пачка 1кг',
      },
      roastLabel: 'Степень Обжарки',
      roasts: {
        light: 'Светлая · Яркая и цветочная',
        medium: 'Средняя · Сбалансированная',
        dark: 'Тёмная · Плотный какао',
      },
      milkLabel: 'Выбор Молока',
      milks: {
        none: 'Чёрный / Без молока',
        whole: 'Фермерское цельное',
        oat: 'Овсяное Бариста (+$0.80)',
        almond: 'Миндальное (+$0.80)',
        coconut: 'Кокосовое (+$0.90)',
      },
      sugarLabel: 'Уровень Сахара',
      sugarLevels: {
        '0': '0% Без сахара',
        '25': '25% Лёгкая сладость',
        '50': '50% Умеренно',
        '100': '100% Классика',
      },
      quantityLabel: 'Количество',
      addToOrder: 'Добавить в заказ',
      unavailable: 'Временно недоступно',
    },
    cart: {
      title: 'Ваш Заказ Кофе',
      emptyTitle: 'Корзина пока пуста',
      emptyBody: 'Выберите эспрессо, воронку V60 или свежие зёрна, чтобы оформить заказ.',
      browseMenu: 'Перейти к Меню',
      remove: 'Удалить',
      subtotal: 'Подытог',
      total: 'Итого к оплате',
      proceedCheckout: 'Оформить Заказ',
      backToBag: 'Назад к составу',
      checkoutTitle: 'Детали Заказа',
      customerName: 'Ваше Имя',
      customerNamePlaceholder: 'Например, Тимур Алимов',
      customerPhone: 'Номер Телефона',
      customerPhonePlaceholder: '+998 90 123 45 67',
      serviceMode: 'Способ Получения',
      modeTable: 'За столиком',
      modeDelivery: 'Доставка курьером',
      tableNumber: 'Номер Столика',
      tablePlaceholder: 'Например, Стол 04',
      deliveryAddress: 'Адрес Доставки',
      addressPlaceholder: 'Улица, дом, квартира или ориентир',
      notesLabel: 'Комментарий Бариста',
      notesPlaceholder: 'Погорячее, крышка отдельно, помол под V60...',
      placeOrder: 'Отправить Заказ Бариста',
      submitting: 'Отправка заказа...',
      confirmationTitle: 'Заказ Передан в Бар',
      confirmationSubtitle: 'Бариста уже получили ваш заказ и начали приготовление.',
      orderNumberLabel: 'Номер Заказа',
      newOrder: 'Создать Новый Заказ',
      validation: {
        nameRequired: 'Укажите ваше имя (минимум 2 символа).',
        phoneRequired: 'Введите корректный номер телефона.',
        locationRequired: 'Укажите номер столика или адрес доставки.',
        submitFailed: 'Не удалось оформить заказ. Проверьте данные и повторите попытку.',
      },
    },
    toasts: {
      addedToCart: 'Добавлено в ваш заказ.',
      orderPlaced: 'Заказ подтверждён и передан бариста.',
      statusUpdated: 'Статус заказа обновлён.',
      productUpdated: 'Позиция меню обновлена.',
      productCreated: 'Новый кофе добавлен в меню.',
      signedOut: 'Вы вышли из системы.',
      authError: 'Не удалось завершить вход через Google.',
    },
    admin: {
      consoleTitle: 'Пульт Бариста и Администратора',
      backToStore: 'На Витрину',
      signOut: 'Выйти',
      greetings: {
        morning: 'Доброе утро и добро пожаловать, Мастер Бариста!',
        afternoon: 'Добрый день и добро пожаловать, Мастер Бариста!',
        evening: 'Добрый вечер и добро пожаловать, Мастер Бариста!',
      },
      loginPrompt: 'Пожалуйста, войдите через Google, чтобы продолжить.',
      signInGoogle: 'Войти через Google',
      signingIn: 'Подключение к Google...',
      verifyingAccess: 'Проверка прав администратора...',
      restrictedTitle: 'Доступ ограничен — Ожидается одобрение администратора',
      restrictedBody:
        'Ваш вход через Google зафиксирован в журнале аудита, но у этого аккаунта пока нет прав администратора кофейни.',
      signedInAs: 'Вы вошли как',
      switchAccount: 'Сменить аккаунт Google',
      tabs: {
        orders: 'Лента Заказов',
        catalog: 'Каталог Кофе',
        logs: 'Журнал Входов',
      },
      kpis: {
        revenue: 'Общая Выручка',
        activeOrders: 'В Работе',
        completedOrders: 'Выдано Заказов',
        loginAttempts: 'События Входа',
      },
      orders: {
        filterAll: 'Все Заказы',
        refresh: 'Обновить',
        liveConnected: 'Онлайн-поток активен',
        liveReconnecting: 'Синхронизация...',
        empty: 'Заказов с таким статусом пока нет.',
        orderCol: 'Заказ',
        customerCol: 'Гость',
        locationCol: 'Стол / Адрес',
        itemsCol: 'Состав',
        totalCol: 'Сумма',
        statusCol: 'Этап',
        timeCol: 'Время',
        tablePrefix: 'Стол',
        deliveryPrefix: 'Доставка',
        statuses: {
          pending: 'Ожидает',
          brewing: 'Готовится',
          ready: 'Готов',
          completed: 'Выдан',
          cancelled: 'Отменён',
        },
      },
      catalog: {
        addTitle: 'Добавить Спешелти Кофе',
        addButton: 'Добавить Кофе',
        nameEn: 'Название (EN)',
        nameRu: 'Название (RU)',
        nameUz: 'Название (UZ)',
        descriptionEn: 'Описание (EN)',
        originEn: 'Регион',
        tastingNotesEn: 'Вкусовые ноты',
        category: 'Категория',
        priceUsd: 'Базовая цена ($)',
        createProduct: 'Сохранить в Меню',
        creating: 'Сохранение...',
        inStock: 'В наличии',
        paused: 'На стопе',
        toggleStock: 'Наличие',
      },
      logs: {
        title: 'Журнал Авторизаций Google',
        emailCol: 'Google Email',
        nameCol: 'Имя Аккаунта',
        statusCol: 'Результат',
        timeCol: 'Дата и Время',
        granted: 'Разрешён',
        denied: 'Ожидает Одобрения',
        empty: 'Записей о входе пока нет.',
      },
    },
  },
  uz: {
    brand: 'KAVO ROASTERY',
    nav: {
      menu: 'Menyu',
      origins: 'Kelib chiqishi',
      story: 'Mahorat',
      admin: 'Barista Paneli',
      cart: 'Savat',
      storefront: 'Doʻkon',
    },
    hero: {
      kicker: 'Specialty Qahvaxona va Mikro-Qovurish',
      title: 'Grammigacha aniq qovurilgan specialty qahva.',
      subtitle:
        'Faqat haqiqiy specialty qahva: 9 bar bosimli quyuq ristretto va mayin flet uaytdan tortib, qoʻlda damlangan V60 va yangi qovurilgan donlargacha.',
      ctaPrimary: 'Qahva Menyusini Koʻrish',
      ctaSecondary: 'Qovurish Falsafasi',
      roasteryNote: 'Har seshanba va juma kunlari 12 kg lik kichik partiyalarda qovuriladi.',
      metrics: {
        lotsLabel: 'Faol Mikro-Lotlar',
        lotsValue: '12 Hudud',
        roastLabel: 'Qovurish Yangiligi',
        roastValue: '48 Soat',
        extractionLabel: 'Espresso Standarti',
        extractionValue: '9.0 Bar · 93°C',
        waterLabel: 'Minerallashgan Suv',
        waterValue: '72 ppm TDS',
      },
    },
    menu: {
      sectionTitle: 'Qahva Menyusi',
      sectionSubtitle: 'Har bir ichimlik va qahva paketi buyurtmangizga moslab tayyorlanadi — qovurish darajasi, hajm va sut turini tanlang.',
      searchPlaceholder: 'Espresso, V60, cold brew, hudud qidirish...',
      categories: {
        all: 'Barcha Qahva',
        hot: 'Issiq Espresso',
        iced: 'Muzdek Qahva',
        brew: 'Damlash Usullari',
        beans: 'Qahva Donlari',
      },
      customize: 'Moslash',
      outOfStock: 'Tugagan',
      featured: 'Roaster Tanlovi',
      emptySearch: 'Qidiruv yoki filtr boʻyicha qahva topilmadi.',
      clearFilters: 'Filtrlarni Tozalash',
      loading: 'Qahva menyusi yuklanmoqda...',
      loadError: 'Qahva menyusini yuklab boʻlmadi.',
      retry: 'Qayta urinish',
    },
    story: {
      kicker: 'Qovurish va Ekstraksiya Sanʼati',
      title: 'Butun eʼtibor faqat qahva donida.',
      body: 'Biz menyumizni begona ichimliklar bilan aralashtirmaymiz. Har tong baristalarimiz aniq tarozilarda maydalash darajasini sozlab, balanslangan suv va baland togʻ arabikasidan foydalanadi.',
      pillars: [
        {
          title: '01. Baland Togʻ Mikro-Lotlari',
          detail: 'Efiopiya, Kolumbiya, Keniya va Panamadan 1750m–2150m balandlikda yetishtirilgan sara arabika donlari.',
        },
        {
          title: '02. Mualliflik Qovurish Profili',
          detail: 'Yasmin gullari, danakli mevalar va tabiiy kakao shirinligini saqlab qoluvchi yengil va oʻrta qovurish.',
        },
        {
          title: '03. Buyurtmaga Mos Sozlash',
          detail: 'Barista qahvani tayyorlashidan oldin finjon hajmi, qovurish darajasi, sut va shirinlikni oʻzingiz belgilang.',
        },
      ],
    },
    footer: {
      tagline: 'Har kuni yangi qovurilgan va damlangan sof specialty qahva.',
      hoursLabel: 'Ish Vaqti',
      hoursValue: '07:30 — 22:00 Har kuni',
      addressLabel: 'Qahvaxona Manzili',
      addressValue: 'Amir Temur shoh koʻchasi, 14, Toshkent',
      rights: 'Kavo Roastery. Faqat Specialty Qahva.',
    },
    modal: {
      close: 'Yopish',
      originLabel: 'Kelib Chiqishi',
      tastingLabel: 'Taʼm Notalari',
      sizeLabel: 'Finjon Hajmi',
      bagWeightLabel: 'Paket Vazni',
      sizes: {
        S: 'Kichik · 250 ml',
        M: 'Oʻrta · 350 ml (+$0.70)',
        L: 'Katta · 450 ml (+$1.40)',
      },
      bagSizes: {
        S: '250g Paket',
        M: '500g Paket',
        L: '1kg Roaster Paketi',
      },
      roastLabel: 'Qovurish Darajasi',
      roasts: {
        light: 'Yengil · Gulli va yorqin',
        medium: 'Oʻrta · Muvozanatli',
        dark: 'Toʻq · Qora kakao',
      },
      milkLabel: 'Sut Tanlovi',
      milks: {
        none: 'Qora / Sutsiz',
        whole: 'Tabiiy sigir suti',
        oat: 'Barista suli suti (+$0.80)',
        almond: 'Bodom suti (+$0.80)',
        coconut: 'Kokos suti (+$0.90)',
      },
      sugarLabel: 'Shakar Darajasi',
      sugarLevels: {
        '0': '0% Shakarsiz',
        '25': '25% Yengil shirin',
        '50': '50% Oʻrtacha',
        '100': '100% Klassik',
      },
      quantityLabel: 'Soni',
      addToOrder: 'Savatga Qoʻshish',
      unavailable: 'Vaqtincha mavjud emas',
    },
    cart: {
      title: 'Qahva Savatingiz',
      emptyTitle: 'Savatingiz boʻsh',
      emptyBody: 'Buyurtma berish uchun espresso, V60 damlama yoki qahva donlarini tanlang.',
      browseMenu: 'Menyuni Koʻrish',
      remove: 'Oʻchirish',
      subtotal: 'Oraliq jami',
      total: 'Jami Toʻlov',
      proceedCheckout: 'Buyurtmani Rasmiylashtirish',
      backToBag: 'Savatga qaytish',
      checkoutTitle: 'Buyurtma Maʼlumotlari',
      customerName: 'Ismingiz',
      customerNamePlaceholder: 'Masalan, Azizbek Karimov',
      customerPhone: 'Telefon Raqami',
      customerPhonePlaceholder: '+998 90 123 45 67',
      serviceMode: 'Xizmat Turi',
      modeTable: 'Stolga yetkazish',
      modeDelivery: 'Kuryer orqali yetkazish',
      tableNumber: 'Stol Raqami',
      tablePlaceholder: 'Masalan, 04-stol',
      deliveryAddress: 'Yetkazib Berish Manzili',
      addressPlaceholder: 'Koʻcha, uy, xonadon yoki moʻljal',
      notesLabel: 'Baristaga Izoh (Ixtiyoriy)',
      notesPlaceholder: 'Issiqroq qiling, qopqoq alohida, V60 uchun maydalab bering...',
      placeOrder: 'Buyurtmani Yuborish',
      submitting: 'Baristaga yuborilmoqda...',
      confirmationTitle: 'Buyurtma Barga Yuborildi',
      confirmationSubtitle: 'Baristalarimiz buyurtmangizni qabul qildi va tayyorlashni boshladi.',
      orderNumberLabel: 'Buyurtma Raqami',
      newOrder: 'Yangi Buyurtma Berish',
      validation: {
        nameRequired: 'Iltimos, ismingizni kiriting (kamida 2 ta harf).',
        phoneRequired: 'Iltimos, toʻgʻri telefon raqamini kiriting.',
        locationRequired: 'Iltimos, stol raqami yoki yetkazish manzilini kiriting.',
        submitFailed: 'Buyurtmani yuborib boʻlmadi. Maʼlumotlarni tekshirib qayta urining.',
      },
    },
    toasts: {
      addedToCart: 'Qahva savatingizga qoʻshildi.',
      orderPlaced: 'Buyurtma tasdiqlandi va baristaga yuborildi.',
      statusUpdated: 'Buyurtma holati yangilandi.',
      productUpdated: 'Menyu pozitsiyasi yangilandi.',
      productCreated: 'Yangi qahva menyuga qoʻshildi.',
      signedOut: 'Tizimdan muvaffaqiyatli chiqdingiz.',
      authError: 'Google orqali kirishni yakunlab boʻlmadi.',
    },
    admin: {
      consoleTitle: 'Barista Boshqaruv Paneli',
      backToStore: 'Doʻkonga',
      signOut: 'Chiqish',
      greetings: {
        morning: 'Xayrli tong va Xush kelibsiz, Barista Ustasi!',
        afternoon: 'Xayrli kun va Xush kelibsiz, Barista Ustasi!',
        evening: 'Xayrli kech va Xush kelibsiz, Barista Ustasi!',
      },
      loginPrompt: 'Davom etish uchun Google orqali kiring.',
      signInGoogle: 'Google bilan kirish',
      signingIn: 'Google bilan ulanilmoqda...',
      verifyingAccess: 'Admin huquqlari tekshirilmoqda...',
      restrictedTitle: 'Kirish Cheklangan — Admin Tasdigʻi Kutilmoqda',
      restrictedBody:
        'Google orqali kirish urinishingiz jurnalga yozildi, ammo ushbu hisobda hozircha boshqaruv paneli uchun admin huquqlari mavjud emas.',
      signedInAs: 'Kirilgan hisob',
      switchAccount: 'Boshqa Google Hisobini Tanlash',
      tabs: {
        orders: 'Jonli Buyurtmalar',
        catalog: 'Qahva Katalogi',
        logs: 'Kirish Jurnali',
      },
      kpis: {
        revenue: 'Umumiy Tushum',
        activeOrders: 'Tayyorlanmoqda',
        completedOrders: 'Topshirilgan',
        loginAttempts: 'Kirish Hodisalari',
      },
      orders: {
        filterAll: 'Barcha Buyurtmalar',
        refresh: 'Yangilash',
        liveConnected: 'Jonli Aloqa Faol',
        liveReconnecting: 'Ulanmoqda...',
        empty: 'Ushbu holatdagi buyurtmalar hozircha yoʻq.',
        orderCol: 'Buyurtma',
        customerCol: 'Mijoz',
        locationCol: 'Stol / Manzil',
        itemsCol: 'Qahva Tarkibi',
        totalCol: 'Jami',
        statusCol: 'Bosqich',
        timeCol: 'Vaqt',
        tablePrefix: 'Stol',
        deliveryPrefix: 'Yetkazish',
        statuses: {
          pending: 'Kutilmoqda',
          brewing: 'Tayyorlanmoqda',
          ready: 'Tayyor',
          completed: 'Topshirildi',
          cancelled: 'Bekor qilindi',
        },
      },
      catalog: {
        addTitle: 'Yangi Specialty Qahva Qoʻshish',
        addButton: 'Qahva Qoʻshish',
        nameEn: 'Nomi (EN)',
        nameRu: 'Nomi (RU)',
        nameUz: 'Nomi (UZ)',
        descriptionEn: 'Tavsif (EN)',
        originEn: 'Kelib chiqishi',
        tastingNotesEn: 'Taʼm notalari',
        category: 'Toifa',
        priceUsd: 'Asosiy narx ($)',
        createProduct: 'Menyuga Saqlash',
        creating: 'Saqlanmoqda...',
        inStock: 'Mavjud',
        paused: 'Toʻxtatilgan',
        toggleStock: 'Mavjudlik',
      },
      logs: {
        title: 'Google Kirish Faolligi Jurnali',
        emailCol: 'Google Email',
        nameCol: 'Hisob Nomi',
        statusCol: 'Kirish Natijasi',
        timeCol: 'Vaqt',
        granted: 'Ruxsat Berilgan',
        denied: 'Tasdiq Kutilmoqda',
        empty: 'Hali kirish hodisalari qayd etilmagan.',
      },
    },
  },
};
