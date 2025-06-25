# Música Litúrgica - Sistema de Gestão Musical

## Overview
Sistema completo de gestão musical para a paróquia de Boa Viagem, focado na organização de missas, músicos e repertório litúrgico. Desenvolvido especificamente para uso do coordenador do coral.

## User Preferences
- Interface otimizada para administrador único (coordenador do coral)
- Fluxos simples, rápidos e sem distrações
- Layout moderno com tema claro por padrão e opção de tema escuro
- Contraste adequado para leitura fácil, especialmente para usuários mais velhos
- Cards com cantos arredondados (8px) e sombras suaves
- Fundo levemente cinza-claro (#f7f7f7) para melhor contraste
- Dados sempre sincronizados em tempo real
- Sem necessidade de login multiusuário no momento

## Project Architecture
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Replit built-in) + Drizzle ORM
- **State Management**: React hooks + API integration
- **UI Components**: Shadcn/ui components

## Recent Changes  
- **2025-01-25**: Interface improvements and theme implementation
  - Added complete musician availability control with absence tracking
  - Implemented separated YouTube search from intelligent sheet music search
  - Fixed Dashboard "Ver" button navigation to missas tab
  - Created individual cards for upcoming masses by date
  - Added analytics dashboard with comprehensive charts and metrics
  - Implemented musician assignment system for mass parts
  - Enhanced MP3 download using cnvmp3.com/v25 service
  - Added Disponibilidade tab to navigation
  - Created analytics endpoint with mock data
  - Updated documentation with SQL schemas and new features
- **2025-01-25**: Light theme implementation and UX improvements
  - Fixed date formatting issues in missa cards
  - Implemented theme selector (light/dark) with light as default
  - Added musician assignment functionality for mass scheduling
  - Created comprehensive analytics dashboard with 6 charts
  - Improved dashboard navigation and "Nova missa" button functionality
  - Enhanced card styling with rounded corners and subtle shadows
  - Optimized interface contrast for better readability
- **2025-01-25**: Enhanced musician scheduling system
  - Fixed dark theme background and card styling issues
  - Added prominent "Escalar" buttons to mass cards for easy musician assignment
  - Created default assignment system to save frequently used musician configurations
  - Implemented quick assignment feature to avoid repetitive scheduling
  - Added "Escalações Padrão" management interface with save/apply functionality
- **2025-01-25**: Complete system functionality implementation
  - Fixed UserManagement component import and authentication issues
  - Added comprehensive music library selector for missas
  - Implemented YouTube music search with API key integration
  - Created partitura management system with text-based storage
  - Enhanced music selection workflow with library integration
  - Added sheet music search functionality via Arquidiocese de Goiânia
  - Complete API authentication fixes and route protection
  - YouTube Data API v3 integration: AIzaSyB4UJR8RSCxKjcMFwUD7vdTJRGd5ADVrQM
  - Created comprehensive documentation files (instrucoes.txt, sql_esquema.txt)

## Features
- Dashboard com métricas principais e visão geral
- Gestão completa de missas e escalas musicais
- Cadastro e controle detalhado de músicos
- Sistema completo de disponibilidade dos músicos
  - Registro de ausências (férias, doença, compromisso pessoal, outro)
  - Períodos de indisponibilidade com datas
  - Verificação automática de disponibilidade por data
  - Integração com seleção de músicos para missas
- Biblioteca integrada de músicas litúrgicas
  - Busca inteligente de partituras
  - Integração com Cifras e Partituras - Arquidiocese de Goiânia
  - Download de áudio via CNV MP3
  - Campo de partitura em texto para cada música
  - Busca no YouTube integrada
- Sistema avançado de sugestões com workflow de aprovação
- Relatórios e análises históricas com exportação PDF
- Interface otimizada para coordenador único
- Sidebar com navegação intuitiva e tema escuro
- Cards informativos com estatísticas em tempo real

## Technical Notes
- Uses modern React patterns with TypeScript
- Database schema designed for church music management
- API endpoints for all CRUD operations
- Components are modular and reusable