# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

# Doctor Appointment Portal - Frontend Structure

```
src/
├── assets/                  # Static assets
│   ├── images/
│   └── icons/
├── components/              # Reusable UI components
│   ├── ui/                  # shadcn/ui components
│   ├── common/              # Shared components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Sidebar/
│   │   ├── Breadcrumbs/
│   │   └── Notifications/
│   ├── layouts/             # Layout components
│   │   ├── DashboardLayout/
│   │   ├── AuthLayout/
│   │   └── MainLayout/
│   └── features/            # Feature-specific components
│       ├── auth/
│       ├── appointments/
│       ├── doctors/
│       ├── patients/
│       ├── consultations/
│       ├── payments/
│       └── prescriptions/
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useToast.ts
│   ├── useAppointments.ts
│   └── useFetch.ts
├── lib/                     # Utility functions
│   ├── api.ts
│   ├── utils.ts
│   ├── constants.ts
│   ├── validation.ts
│   └── date-utils.ts
├── pages/                   # Page components
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── dashboard/
│   │   ├── patient/
│   │   ├── doctor/
│   │   └── admin/
│   ├── appointments/
│   ├── doctors/
│   ├── clinics/
│   ├── consultations/
│   └── settings/
├── providers/               # Context providers
│   ├── AuthProvider.tsx
│   ├── ThemeProvider.tsx
│   └── NotificationProvider.tsx
├── services/                # API services
│   ├── authService.ts
│   ├── appointmentService.ts
│   ├── doctorService.ts
│   └── paymentService.ts
├── stores/                  # State management
│   ├── authStore.ts
│   └── uiStore.ts
├── types/                   # TypeScript types
│   ├── auth.types.ts
│   ├── appointment.types.ts
│   ├── doctor.types.ts
│   └── api.types.ts
├── routes/                  # Route definitions
│   ├── index.tsx
│   ├── privateRoutes.tsx
│   └── publicRoutes.tsx
├── App.tsx
├── main.tsx
└── index.css
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
