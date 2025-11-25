# Glass Finance App - Tu Secretaria Financiera Personal

Una aplicación móvil completa de gestión financiera personal que actúa como tu secretaria financiera, automatizando pagos, detectando gastos sospechosos y optimizando tus finanzas.

## 🌟 Características Principales

### 1. **Dashboard Inteligente**
- Resumen financiero completo con balance total, ingresos y gastos
- Alertas importantes destacadas (cargos sospechosos, pagos pendientes)
- Transacciones recientes con categorización automática
- Acciones rápidas para gestión financiera

### 2. **Gestión de Cuentas y Tarjetas**
- Conexión con múltiples cuentas bancarias
- Visualización de tarjetas de crédito con diseño atractivo
- Sincronización automática de balances
- Monitoreo de utilización de crédito
- Sistema de Open Banking para conexión segura

### 3. **Detección Inteligente de Gastos**
- **Cargos Fantasma**: Detecta cargos recurrentes no autorizados
- **Cargos Duplicados**: Identifica transacciones duplicadas
- **Gastos Inusuales**: Alerta sobre compras atípicas
- **Gestión de Suscripciones**: Rastrea y sugiere cancelación de suscripciones no utilizadas
- Nivel de confianza en cada detección

### 4. **Automatización Financiera**
- **Pago automático de tarjetas**: Nunca olvides un pago
- **Ahorro automático**: Transfiere un porcentaje de tu nómina a ahorros
- **Alertas inteligentes**: Notificaciones de gastos altos o balance bajo
- **Reglas personalizables**: Crea tus propias automatizaciones

## 📱 Estructura de la Aplicación

### Pantallas Principales

#### Dashboard (`/`)
- Resumen financiero general
- Balance total de todas las cuentas
- Ingresos y gastos del mes
- Alertas de cargos sospechosos
- Cuenta principal destacada
- Transacciones recientes

#### Cuentas (`/accounts`)
- Lista de cuentas bancarias
- Tarjetas de crédito con visualización tipo wallet
- Balance total y crédito disponible
- Opción para agregar nuevas cuentas

#### Análisis (`/insights`)
- Detección de cargos sospechosos
- Gestión de suscripciones activas
- Insights financieros personalizados
- Sugerencias de optimización

#### Automatización (`/automation`)
- Reglas de automatización activas
- Estadísticas de ahorro
- Acciones rápidas
- Sugerencias de nuevas automatizaciones

## 🛠 Tecnologías Utilizadas

- **React Native** con **Expo** (~54.0)
- **TypeScript** para type safety
- **Expo Router** para navegación
- **React Native Reanimated** para animaciones fluidas
- **Expo Linear Gradient** para diseños visuales
- Sistema de temas (light/dark mode)

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js (versión 18 o superior)
- npm o yarn
- Expo CLI
- iOS Simulator (para iOS) o Android Emulator (para Android)

### Pasos de Instalación

1. **Instalar dependencias**
   ```bash
   cd frontend-glass
   npm install
   ```

2. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   ```

3. **Ejecutar en plataforma específica**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

## 📂 Estructura del Proyecto

```
frontend-glass/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Layout de navegación por tabs
│   │   ├── index.tsx             # Dashboard principal
│   │   ├── accounts.tsx          # Cuentas y tarjetas
│   │   ├── insights.tsx          # Análisis y detección
│   │   └── automation.tsx        # Automatización
│   └── _layout.tsx               # Layout raíz
├── components/
│   ├── ui/
│   │   ├── card.tsx              # Componente Card base
│   │   ├── stat-card.tsx         # Tarjetas de estadísticas
│   │   ├── icon-symbol.tsx       # Iconos multiplataforma
│   │   └── collapsible.tsx       # Secciones colapsables
│   ├── financial/
│   │   ├── account-card.tsx      # Tarjeta de cuenta bancaria
│   │   ├── credit-card-view.tsx  # Vista de tarjeta de crédito
│   │   ├── transaction-item.tsx  # Item de transacción
│   │   └── alert-card.tsx        # Tarjeta de alerta
│   ├── themed-text.tsx           # Texto con temas
│   └── themed-view.tsx           # Vista con temas
├── types/
│   └── financial.ts              # Tipos TypeScript para datos financieros
├── constants/
│   └── theme.ts                  # Colores y fuentes del tema
└── hooks/
    ├── use-theme-color.ts        # Hook para colores dinámicos
    └── use-color-scheme.ts       # Hook para detectar tema

```

## 🎨 Sistema de Temas

La aplicación incluye un sistema de temas completo con modo claro y oscuro:

### Colores Principales
- **Tint (Primario)**: Verde (#10b981 light, #34d399 dark)
- **Success**: Verde para ingresos y logros
- **Danger**: Rojo para gastos y alertas
- **Warning**: Amarillo para advertencias
- **Info**: Azul para información

## 🔒 Datos Mock

Actualmente la aplicación usa datos mock para demostración. Para integrar con APIs reales:

1. Implementa servicios en `services/` para llamadas a API
2. Usa hooks de React para gestión de estado (useState, useEffect)
3. Considera usar Context API o una librería de estado global (Redux, Zustand)
4. Implementa autenticación segura
5. Conecta con servicios de Open Banking para cuentas reales

## 📊 Tipos de Datos

### BankAccount
```typescript
{
  id: string;
  name: string;
  bank: string;
  type: 'checking' | 'savings' | 'investment';
  balance: number;
  currency: string;
  lastSync: Date;
  accountNumber: string;
  status: 'active' | 'inactive' | 'syncing';
}
```

### CreditCard
```typescript
{
  id: string;
  name: string;
  bank: string;
  last4: string;
  balance: number;
  limit: number;
  dueDate: Date;
  minPayment: number;
  autoPayEnabled: boolean;
}
```

### SuspiciousCharge
```typescript
{
  id: string;
  type: 'phantom' | 'unusual' | 'duplicate' | 'high-amount';
  amount: number;
  merchant: string;
  date: Date;
  reason: string;
  confidence: number; // 0-100
  status: 'pending' | 'reviewed' | 'disputed' | 'resolved';
}
```

### AutomationRule
```typescript
{
  id: string;
  name: string;
  type: 'payment' | 'alert' | 'transfer' | 'save';
  enabled: boolean;
  conditions: {
    trigger: string;
    value?: any;
  };
  actions: Action[];
}
```

## 🎯 Próximas Funcionalidades

- [ ] Integración con APIs bancarias reales
- [ ] Autenticación biométrica
- [ ] Gráficos y reportes avanzados
- [ ] Exportación de reportes (PDF, CSV)
- [ ] Presupuestos personalizados por categoría
- [ ] Metas de ahorro con tracking
- [ ] Notificaciones push
- [ ] Modo offline con sincronización
- [ ] Compartir gastos con otros usuarios
- [ ] Asistente con IA para consejos financieros

## 🐛 Desarrollo y Debug

Para depurar la aplicación:

```bash
# Ver logs
npm start

# Limpiar cache
npx expo start -c

# Ejecutar linter
npm run lint
```

## 📝 Notas Importantes

1. **Seguridad**: Esta es una versión demo. Para producción, implementa:
   - Encriptación de datos sensibles
   - Autenticación robusta (OAuth 2.0, JWT)
   - Conexiones HTTPS exclusivamente
   - Validación de entrada en backend
   - Rate limiting en APIs

2. **Performance**:
   - Los datos mock están en memoria
   - Para datos reales, implementa caché local (AsyncStorage)
   - Usa paginación para listas largas
   - Implementa lazy loading de imágenes

3. **Accesibilidad**:
   - Todos los botones tienen áreas táctiles adecuadas
   - Soporte para lectores de pantalla (mejorar)
   - Buen contraste de colores en ambos temas

## 📄 Licencia

Este proyecto es de código abierto bajo licencia MIT.

## 👥 Contribución

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

¡Disfruta tu nueva secretaria financiera! 💰✨
